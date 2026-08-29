import crypto from 'crypto';
import prisma from '../config/db.js';
import getRazorpay from '../config/razorpay.js';

export const getMyLicense = async (req, res) => {
  try {
    const gymOwner = await prisma.gymOwner.findUnique({
      where: { id: req.gymOwnerId },
      select: {
        licenseStatus: true,
        licensePlan: true,
        licenseAmount: true,
        licenseExpiresAt: true
      }
    });

    if (!gymOwner) {
      return res.status(404).json({ error: 'Account not found' });
    }

    const payments = await prisma.licensePayment.findMany({
      where: { gymOwnerId: req.gymOwnerId, status: 'paid' },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    res.json({ license: gymOwner, payments });
  } catch (error) {
    console.error('Get license error:', error);
    res.status(500).json({ error: 'Failed to fetch license' });
  }
};

// Marks a LicensePayment paid and extends the gym's licence exactly once,
// even if the client-side verify call and the Razorpay webhook both fire
// for the same payment (updateMany's status guard makes the claim atomic).
const markPaymentPaidAndExtend = async (payment, razorpayPaymentId) => {
  const now = new Date();
  const claimed = await prisma.licensePayment.updateMany({
    where: { id: payment.id, status: { not: 'paid' } },
    data: { status: 'paid', paidAt: now, razorpayPaymentId }
  });

  if (claimed.count === 1) {
    const gymOwner = await prisma.gymOwner.findUnique({ where: { id: payment.gymOwnerId } });
    const base = gymOwner.licenseExpiresAt && new Date(gymOwner.licenseExpiresAt) > now
      ? new Date(gymOwner.licenseExpiresAt)
      : now;
    const newExpiry = new Date(base);
    newExpiry.setDate(newExpiry.getDate() + payment.periodDays);

    await prisma.gymOwner.update({
      where: { id: payment.gymOwnerId },
      data: { licenseStatus: 'active', licenseExpiresAt: newExpiry }
    });
  }

  return prisma.gymOwner.findUnique({
    where: { id: payment.gymOwnerId },
    select: { licenseStatus: true, licensePlan: true, licenseAmount: true, licenseExpiresAt: true }
  });
};

// Step 1 — create a Razorpay order and a matching "created" LicensePayment row.
export const createRenewalOrder = async (req, res) => {
  try {
    const gymOwner = await prisma.gymOwner.findUnique({ where: { id: req.gymOwnerId } });
    if (!gymOwner) {
      return res.status(404).json({ error: 'Account not found' });
    }

    const periodDays = 30;
    const amountPaise = Math.round(Number(gymOwner.licenseAmount) * 100);

    const order = await getRazorpay().orders.create({
      amount: amountPaise,
      currency: 'INR',
      receipt: `renew_${gymOwner.id}_${Date.now()}`,
      notes: { gymOwnerId: gymOwner.id, periodDays: String(periodDays) }
    });

    await prisma.licensePayment.create({
      data: {
        gymOwnerId: gymOwner.id,
        amount: gymOwner.licenseAmount,
        periodDays,
        status: 'created',
        method: 'razorpay',
        razorpayOrderId: order.id
      }
    });

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      gymName: gymOwner.gymName,
      email: gymOwner.email,
      phoneNumber: gymOwner.phoneNumber
    });
  } catch (error) {
    console.error('Create renewal order error:', error);
    const message = error.message?.includes('not configured')
      ? 'Payments are not configured yet — set RAZORPAY_KEY_ID/RAZORPAY_KEY_SECRET on the server'
      : 'Failed to create payment order';
    res.status(500).json({ error: message });
  }
};

// Step 2 — the browser calls this from Razorpay Checkout's success handler.
// Signature is HMAC-SHA256(order_id + "|" + payment_id, key_secret) — this
// is what proves the payment actually came from Razorpay, not just a client
// claiming success.
export const verifyRenewalPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: 'Missing payment verification fields' });
    }

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ error: 'Payment verification failed' });
    }

    const payment = await prisma.licensePayment.findUnique({ where: { razorpayOrderId: razorpay_order_id } });
    if (!payment || payment.gymOwnerId !== req.gymOwnerId) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const license = await markPaymentPaidAndExtend(payment, razorpay_payment_id);
    res.json({ message: 'Payment successful', license });
  } catch (error) {
    console.error('Verify renewal payment error:', error);
    res.status(500).json({ error: 'Failed to verify payment' });
  }
};

// Step 2b (reliability path) — Razorpay's own server-to-server webhook.
// Covers the case where the browser closes/loses connection right after
// payment but before the verify call completes. Configure this URL +
// secret in the Razorpay dashboard under Webhooks, subscribed to
// "payment.captured".
export const razorpayWebhook = async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!signature || !secret || !req.rawBody) {
      return res.status(400).json({ error: 'Invalid webhook request' });
    }

    const expectedSignature = crypto.createHmac('sha256', secret).update(req.rawBody).digest('hex');
    if (signature !== expectedSignature) {
      return res.status(400).json({ error: 'Invalid webhook signature' });
    }

    const event = req.body;
    if (event.event === 'payment.captured') {
      const paymentEntity = event.payload.payment.entity;
      const payment = await prisma.licensePayment.findUnique({
        where: { razorpayOrderId: paymentEntity.order_id }
      });
      if (payment) {
        await markPaymentPaidAndExtend(payment, paymentEntity.id);
      }
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Razorpay webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
};
