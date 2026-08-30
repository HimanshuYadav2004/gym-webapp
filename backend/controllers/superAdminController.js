import prisma from '../config/db.js';

export const getPlatformStats = async (req, res) => {
  try {
    const gymFilter = { isSuperAdmin: false };

    const [totalGyms, totalMembers, statusCounts, revenue] = await Promise.all([
      prisma.gymOwner.count({ where: gymFilter }),
      prisma.member.count({ where: { gymOwner: gymFilter } }),
      prisma.gymOwner.groupBy({
        by: ['licenseStatus'],
        where: gymFilter,
        _count: { _all: true }
      }),
      prisma.licensePayment.aggregate({ where: { status: 'paid' }, _sum: { amount: true } })
    ]);

    const byStatus = { pending: 0, trial: 0, active: 0, expired: 0, suspended: 0, rejected: 0 };
    statusCounts.forEach((s) => {
      byStatus[s.licenseStatus] = s._count._all;
    });

    // Recompute "expired" for anything past its expiry date but not yet flagged
    const now = new Date();
    const expiringGyms = await prisma.gymOwner.findMany({
      where: {
        ...gymFilter,
        licenseExpiresAt: { not: null, lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) }
      },
      select: {
        id: true,
        gymName: true,
        fullName: true,
        licenseStatus: true,
        licenseExpiresAt: true
      },
      orderBy: { licenseExpiresAt: 'asc' },
      take: 10
    });

    res.json({
      stats: {
        totalGyms,
        totalMembers,
        totalRevenue: revenue._sum.amount || 0,
        byStatus
      },
      expiringGyms
    });
  } catch (error) {
    console.error('Get platform stats error:', error);
    res.status(500).json({ error: 'Failed to fetch platform stats' });
  }
};

export const getAllGyms = async (req, res) => {
  try {
    const gyms = await prisma.gymOwner.findMany({
      where: { isSuperAdmin: false },
      select: {
        id: true,
        fullName: true,
        email: true,
        phoneNumber: true,
        gymName: true,
        gymAddress: true,
        createdAt: true,
        licenseStatus: true,
        licensePlan: true,
        licenseAmount: true,
        licenseExpiresAt: true,
        _count: { select: { members: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ gyms });
  } catch (error) {
    console.error('Get all gyms error:', error);
    res.status(500).json({ error: 'Failed to fetch gyms' });
  }
};

export const getGymById = async (req, res) => {
  try {
    const { id } = req.params;

    const gym = await prisma.gymOwner.findFirst({
      where: { id, isSuperAdmin: false },
      select: {
        id: true,
        fullName: true,
        email: true,
        phoneNumber: true,
        gymName: true,
        gymAddress: true,
        createdAt: true,
        licenseStatus: true,
        licensePlan: true,
        licenseAmount: true,
        licenseExpiresAt: true,
        members: {
          select: {
            id: true,
            fullName: true,
            membershipId: true,
            photoUrl: true,
            isActive: true,
            joiningDate: true
          },
          orderBy: { createdAt: 'desc' }
        },
        licensePayments: {
          where: { status: 'paid' },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!gym) {
      return res.status(404).json({ error: 'Gym not found' });
    }

    res.json({ gym });
  } catch (error) {
    console.error('Get gym error:', error);
    res.status(500).json({ error: 'Failed to fetch gym' });
  }
};

export const updateGymLicense = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, days } = req.body;

    const gym = await prisma.gymOwner.findFirst({ where: { id, isSuperAdmin: false } });
    if (!gym) {
      return res.status(404).json({ error: 'Gym not found' });
    }

    let data = {};

    if (action === 'extend') {
      const now = new Date();
      const base = gym.licenseExpiresAt && new Date(gym.licenseExpiresAt) > now
        ? new Date(gym.licenseExpiresAt)
        : now;
      const newExpiry = new Date(base);
      newExpiry.setDate(newExpiry.getDate() + (parseInt(days) || 30));
      data = { licenseStatus: 'active', licenseExpiresAt: newExpiry };

      await prisma.licensePayment.create({
        data: { gymOwnerId: id, amount: gym.licenseAmount, periodDays: parseInt(days) || 30, paidAt: new Date() }
      });
    } else if (action === 'suspend') {
      data = { licenseStatus: 'suspended' };
    } else if (action === 'activate') {
      const newExpiry = new Date();
      newExpiry.setDate(newExpiry.getDate() + 30);
      data = { licenseStatus: 'active', licenseExpiresAt: newExpiry };
    } else if (action === 'approve') {
      const trialExpiry = new Date();
      trialExpiry.setDate(trialExpiry.getDate() + 14);
      data = { licenseStatus: 'trial', licenseExpiresAt: trialExpiry };
    } else if (action === 'reject') {
      data = { licenseStatus: 'rejected' };
    } else {
      return res.status(400).json({ error: 'Invalid action' });
    }

    const updated = await prisma.gymOwner.update({
      where: { id },
      data,
      select: {
        id: true,
        licenseStatus: true,
        licenseExpiresAt: true
      }
    });

    await prisma.auditLog.create({
      data: {
        action: `license.${action}`,
        targetGymId: id,
        targetGymName: gym.gymName,
        actorEmail: req.email || 'unknown',
        details: action === 'extend' ? `+${parseInt(days) || 30} days` : null
      }
    });

    res.json({ message: 'License updated', gym: updated });
  } catch (error) {
    console.error('Update license error:', error);
    res.status(500).json({ error: 'Failed to update license' });
  }
};

export const getMemberDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const member = await prisma.member.findUnique({
      where: { id },
      include: {
        gymOwner: { select: { id: true, gymName: true, isSuperAdmin: true } },
        memberships: { orderBy: { createdAt: 'desc' } },
        payments: { orderBy: { paymentDate: 'desc' } },
        attendance: { orderBy: { checkInTime: 'desc' }, take: 30 }
      }
    });

    if (!member || member.gymOwner.isSuperAdmin) {
      return res.status(404).json({ error: 'Member not found' });
    }

    res.json({ member });
  } catch (error) {
    console.error('Get member detail error:', error);
    res.status(500).json({ error: 'Failed to fetch member' });
  }
};

export const getAuditLog = async (req, res) => {
  try {
    const logs = await prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 30
    });
    res.json({ logs });
  } catch (error) {
    console.error('Get audit log error:', error);
    res.status(500).json({ error: 'Failed to fetch audit log' });
  }
};
