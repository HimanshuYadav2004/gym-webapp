import prisma from '../config/db.js';

export const createPayment = async (req, res) => {
  try {
    const { memberId, amount, paymentMethod, remarks, paymentDate } = req.body;

    // Verify member belongs to this gym owner
    const member = await prisma.member.findFirst({
      where: {
        id: memberId,
        gymOwnerId: req.gymOwnerId
      }
    });

    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    const payment = await prisma.payment.create({
      data: {
        amount: parseFloat(amount),
        paymentMethod,
        remarks,
        paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
        memberId
      }
    });

    res.status(201).json({
      message: 'Payment recorded successfully',
      payment
    });
  } catch (error) {
    console.error('Create payment error:', error);
    res.status(500).json({ error: 'Failed to record payment' });
  }
};

export const getPaymentHistory = async (req, res) => {
  try {
    const { memberId } = req.params;

    // Verify member belongs to this gym owner
    const member = await prisma.member.findFirst({
      where: {
        id: memberId,
        gymOwnerId: req.gymOwnerId
      }
    });

    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    const payments = await prisma.payment.findMany({
      where: { memberId },
      orderBy: { paymentDate: 'desc' }
    });

    res.json({ payments });
  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json({ error: 'Failed to fetch payment history' });
  }
};

export const updatePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, paymentMethod, remarks, paymentDate } = req.body;

    const payment = await prisma.payment.findFirst({
      where: {
        id,
        member: { gymOwnerId: req.gymOwnerId }
      }
    });

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    const updatedPayment = await prisma.payment.update({
      where: { id },
      data: {
        amount: amount !== undefined ? parseFloat(amount) : payment.amount,
        paymentMethod: paymentMethod ?? payment.paymentMethod,
        remarks: remarks !== undefined ? remarks : payment.remarks,
        paymentDate: paymentDate ? new Date(paymentDate) : payment.paymentDate
      }
    });

    res.json({
      message: 'Payment updated successfully',
      payment: updatedPayment
    });
  } catch (error) {
    console.error('Update payment error:', error);
    res.status(500).json({ error: 'Failed to update payment' });
  }
};

export const deletePayment = async (req, res) => {
  try {
    const { id } = req.params;

    const payment = await prisma.payment.findFirst({
      where: {
        id,
        member: { gymOwnerId: req.gymOwnerId }
      }
    });

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    await prisma.payment.delete({ where: { id } });

    res.json({ message: 'Payment deleted successfully' });
  } catch (error) {
    console.error('Delete payment error:', error);
    res.status(500).json({ error: 'Failed to delete payment' });
  }
};

export const getAllPayments = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const where = {
      member: {
        gymOwnerId: req.gymOwnerId
      },
      ...(startDate && endDate && {
        paymentDate: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      })
    };

    const payments = await prisma.payment.findMany({
      where,
      include: {
        member: {
          select: {
            id: true,
            fullName: true,
            membershipId: true,
            photoUrl: true
          }
        }
      },
      orderBy: { paymentDate: 'desc' }
    });

    // Calculate total
    const total = payments.reduce((sum, payment) => sum + parseFloat(payment.amount), 0);

    res.json({ payments, total });
  } catch (error) {
    console.error('Get all payments error:', error);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
};
