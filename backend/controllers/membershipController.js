import prisma from '../config/db.js';

export const createMembership = async (req, res) => {
  try {
    const { memberId, planName, planDuration, planAmount, startDate } = req.body;

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

    // Calculate end date
    const start = new Date(startDate);
    const endDate = new Date(start);
    endDate.setDate(endDate.getDate() + parseInt(planDuration));

    const membership = await prisma.membership.create({
      data: {
        planName,
        planDuration: parseInt(planDuration),
        planAmount: parseFloat(planAmount),
        startDate: start,
        endDate,
        memberId
      }
    });

    res.status(201).json({
      message: 'Membership created successfully',
      membership
    });
  } catch (error) {
    console.error('Create membership error:', error);
    res.status(500).json({ error: 'Failed to create membership' });
  }
};

export const renewMembership = async (req, res) => {
  try {
    const { memberId, planName, planDuration, planAmount } = req.body;

    // Verify member belongs to this gym owner
    const member = await prisma.member.findFirst({
      where: {
        id: memberId,
        gymOwnerId: req.gymOwnerId
      },
      include: {
        memberships: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });

    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    // Mark old membership as expired if exists
    if (member.memberships.length > 0) {
      await prisma.membership.update({
        where: { id: member.memberships[0].id },
        data: { status: 'expired' }
      });
    }

    // Create new membership starting from today or last membership end date
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + parseInt(planDuration));

    const membership = await prisma.membership.create({
      data: {
        planName,
        planDuration: parseInt(planDuration),
        planAmount: parseFloat(planAmount),
        startDate,
        endDate,
        memberId
      }
    });

    res.status(201).json({
      message: 'Membership renewed successfully',
      membership
    });
  } catch (error) {
    console.error('Renew membership error:', error);
    res.status(500).json({ error: 'Failed to renew membership' });
  }
};

export const updateMembership = async (req, res) => {
  try {
    const { id } = req.params;
    const { planName, planDuration, planAmount, startDate, endDate, status } = req.body;

    const membership = await prisma.membership.findFirst({
      where: {
        id,
        member: { gymOwnerId: req.gymOwnerId }
      }
    });

    if (!membership) {
      return res.status(404).json({ error: 'Membership not found' });
    }

    const updatedMembership = await prisma.membership.update({
      where: { id },
      data: {
        planName: planName ?? membership.planName,
        planDuration: planDuration !== undefined ? parseInt(planDuration) : membership.planDuration,
        planAmount: planAmount !== undefined ? parseFloat(planAmount) : membership.planAmount,
        startDate: startDate ? new Date(startDate) : membership.startDate,
        endDate: endDate ? new Date(endDate) : membership.endDate,
        status: status ?? membership.status
      }
    });

    res.json({
      message: 'Membership updated successfully',
      membership: updatedMembership
    });
  } catch (error) {
    console.error('Update membership error:', error);
    res.status(500).json({ error: 'Failed to update membership' });
  }
};

export const deleteMembership = async (req, res) => {
  try {
    const { id } = req.params;

    const membership = await prisma.membership.findFirst({
      where: {
        id,
        member: { gymOwnerId: req.gymOwnerId }
      }
    });

    if (!membership) {
      return res.status(404).json({ error: 'Membership not found' });
    }

    await prisma.membership.delete({ where: { id } });

    res.json({ message: 'Membership deleted successfully' });
  } catch (error) {
    console.error('Delete membership error:', error);
    res.status(500).json({ error: 'Failed to delete membership' });
  }
};

export const getMembershipHistory = async (req, res) => {
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

    const memberships = await prisma.membership.findMany({
      where: { memberId },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ memberships });
  } catch (error) {
    console.error('Get membership history error:', error);
    res.status(500).json({ error: 'Failed to fetch membership history' });
  }
};
