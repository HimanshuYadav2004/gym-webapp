import prisma from '../config/db.js';

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
      where: { gymOwnerId: req.gymOwnerId },
      orderBy: { paidAt: 'desc' },
      take: 10
    });

    res.json({ license: gymOwner, payments });
  } catch (error) {
    console.error('Get license error:', error);
    res.status(500).json({ error: 'Failed to fetch license' });
  }
};

// Simulated payment — stands in for a real payment gateway (Razorpay/Stripe)
export const renewLicense = async (req, res) => {
  try {
    const gymOwner = await prisma.gymOwner.findUnique({ where: { id: req.gymOwnerId } });
    if (!gymOwner) {
      return res.status(404).json({ error: 'Account not found' });
    }

    const periodDays = 30;
    const now = new Date();
    const base = gymOwner.licenseExpiresAt && new Date(gymOwner.licenseExpiresAt) > now
      ? new Date(gymOwner.licenseExpiresAt)
      : now;
    const newExpiry = new Date(base);
    newExpiry.setDate(newExpiry.getDate() + periodDays);

    await prisma.licensePayment.create({
      data: {
        gymOwnerId: req.gymOwnerId,
        amount: gymOwner.licenseAmount,
        periodDays
      }
    });

    const updated = await prisma.gymOwner.update({
      where: { id: req.gymOwnerId },
      data: { licenseStatus: 'active', licenseExpiresAt: newExpiry },
      select: {
        licenseStatus: true,
        licensePlan: true,
        licenseAmount: true,
        licenseExpiresAt: true
      }
    });

    res.json({ message: 'Payment successful', license: updated });
  } catch (error) {
    console.error('Renew license error:', error);
    res.status(500).json({ error: 'Failed to process payment' });
  }
};
