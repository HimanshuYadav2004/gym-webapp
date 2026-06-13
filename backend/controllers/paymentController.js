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
