import prisma from '../config/db.js';

export const getDashboardStats = async (req, res) => {
  try {
    // Total members count
    const totalMembers = await prisma.member.count({
      where: { gymOwnerId: req.gymOwnerId }
    });

    // Active members count
    const activeMembers = await prisma.member.count({
      where: {
        gymOwnerId: req.gymOwnerId,
        isActive: true
      }
    });

    // Today's attendance count
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayAttendance = await prisma.attendance.count({
      where: {
        checkInTime: { gte: today },
        member: { gymOwnerId: req.gymOwnerId }
      }
    });

    // Current month revenue
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthRevenue = await prisma.payment.aggregate({
      where: {
        paymentDate: { gte: firstDayOfMonth },
        member: { gymOwnerId: req.gymOwnerId }
      },
      _sum: { amount: true }
    });

    // Due members (membership expiring within 7 days or expired)
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    const dueMembers = await prisma.member.findMany({
      where: {
        gymOwnerId: req.gymOwnerId,
        isActive: true,
        memberships: {
          some: {
            status: 'active',
            endDate: {
              lte: sevenDaysFromNow
            }
          }
        }
      },
      include: {
        memberships: {
          where: {
            status: 'active'
          },
          orderBy: { endDate: 'desc' },
          take: 1
        }
      },
      take: 10
    });

    // Calculate next fee for each due member
    const dueMembersWithDetails = dueMembers.map(member => {
      const latestMembership = member.memberships[0];
      const daysUntilExpiry = latestMembership 
        ? Math.ceil((new Date(latestMembership.endDate) - new Date()) / (1000 * 60 * 60 * 24))
        : 0;
      
      return {
        id: member.id,
        membershipId: member.membershipId,
        fullName: member.fullName,
        phoneNumber: member.phoneNumber,
        photoUrl: member.photoUrl,
        email: member.email,
        membershipEndDate: latestMembership?.endDate,
        planAmount: latestMembership?.planAmount,
        planName: latestMembership?.planName,
        daysUntilExpiry,
        isExpired: daysUntilExpiry < 0
      };
    });

    // Recent payments
    const recentPayments = await prisma.payment.findMany({
      where: {
        member: { gymOwnerId: req.gymOwnerId }
      },
      include: {
        member: {
          select: {
            id: true,
            fullName: true,
            membershipId: true
          }
        }
      },
      orderBy: { paymentDate: 'desc' },
      take: 5
    });

    res.json({
      stats: {
        totalMembers,
        activeMembers,
        todayAttendance,
        monthRevenue: monthRevenue._sum.amount || 0,
        dueMembersCount: dueMembersWithDetails.length
      },
      dueMembers: dueMembersWithDetails,
      recentPayments
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
};

export const getDueMembers = async (req, res) => {
  try {
    const { days = 7 } = req.query;
    
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + parseInt(days));

    const dueMembers = await prisma.member.findMany({
      where: {
        gymOwnerId: req.gymOwnerId,
        isActive: true,
        memberships: {
          some: {
            status: 'active',
            endDate: {
              lte: targetDate
            }
          }
        }
      },
      include: {
        memberships: {
          where: {
            status: 'active'
          },
          orderBy: { endDate: 'desc' },
          take: 1
        },
        payments: {
          orderBy: { paymentDate: 'desc' },
          take: 1
        }
      }
    });

    // Calculate details for each due member
    const dueMembersWithDetails = dueMembers.map(member => {
      const latestMembership = member.memberships[0];
      const latestPayment = member.payments[0];
      const daysUntilExpiry = latestMembership 
        ? Math.ceil((new Date(latestMembership.endDate) - new Date()) / (1000 * 60 * 60 * 24))
        : 0;
      
      return {
        id: member.id,
        membershipId: member.membershipId,
        fullName: member.fullName,
        phoneNumber: member.phoneNumber,
        email: member.email,
        photoUrl: member.photoUrl,
        address: member.address,
        emergencyContact: member.emergencyContact,
        membershipEndDate: latestMembership?.endDate,
        membershipStartDate: latestMembership?.startDate,
        planAmount: latestMembership?.planAmount,
        planName: latestMembership?.planName,
        planDuration: latestMembership?.planDuration,
        lastPaymentDate: latestPayment?.paymentDate,
        lastPaymentAmount: latestPayment?.amount,
        daysUntilExpiry,
        isExpired: daysUntilExpiry < 0,
        nextFeeAmount: latestMembership?.planAmount || 0
      };
    });

    res.json({
      dueMembers: dueMembersWithDetails,
      count: dueMembersWithDetails.length
    });
  } catch (error) {
    console.error('Get due members error:', error);
    res.status(500).json({ error: 'Failed to fetch due members' });
  }
};
