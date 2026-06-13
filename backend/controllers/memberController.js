import prisma from '../config/db.js';

export const createMember = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phoneNumber,
      dateOfBirth,
      gender,
      address,
      emergencyContact
    } = req.body;

    // Generate unique membership ID
    const memberCount = await prisma.member.count({
      where: { gymOwnerId: req.gymOwnerId }
    });
    const membershipId = `MEM${Date.now()}${memberCount + 1}`;

    const photoUrl = req.file ? `/uploads/members/${req.file.filename}` : null;

    const member = await prisma.member.create({
      data: {
        membershipId,
        fullName,
        email,
        phoneNumber,
        photoUrl,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        gender,
        address,
        emergencyContact,
        gymOwnerId: req.gymOwnerId
      }
    });

    res.status(201).json({
      message: 'Member created successfully',
      member
    });
  } catch (error) {
    console.error('Create member error:', error);
    res.status(500).json({ error: 'Failed to create member' });
  }
};

export const getAllMembers = async (req, res) => {
  try {
    const { status, search } = req.query;

    const where = {
      gymOwnerId: req.gymOwnerId,
      ...(status && { isActive: status === 'active' }),
      ...(search && {
        OR: [
          { fullName: { contains: search, mode: 'insensitive' } },
          { membershipId: { contains: search, mode: 'insensitive' } },
          { phoneNumber: { contains: search } }
        ]
      })
    };

    const members = await prisma.member.findMany({
      where,
      include: {
        memberships: {
          orderBy: { createdAt: 'desc' },
          take: 1
        },
        payments: {
          orderBy: { paymentDate: 'desc' },
          take: 1
        },
        _count: {
          select: { attendance: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ members });
  } catch (error) {
    console.error('Get members error:', error);
    res.status(500).json({ error: 'Failed to fetch members' });
  }
};

export const getMemberById = async (req, res) => {
  try {
    const { id } = req.params;

    const member = await prisma.member.findFirst({
      where: {
        id,
        gymOwnerId: req.gymOwnerId
      },
      include: {
        memberships: {
          orderBy: { createdAt: 'desc' }
        },
        payments: {
          orderBy: { paymentDate: 'desc' }
        },
        attendance: {
          orderBy: { checkInTime: 'desc' },
          take: 10
        }
      }
    });

    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    res.json({ member });
  } catch (error) {
    console.error('Get member error:', error);
    res.status(500).json({ error: 'Failed to fetch member' });
  }
};

export const updateMember = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      fullName,
      email,
      phoneNumber,
      dateOfBirth,
      gender,
      address,
      emergencyContact,
      isActive
    } = req.body;

    const member = await prisma.member.findFirst({
      where: {
        id,
        gymOwnerId: req.gymOwnerId
      }
    });

    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    const photoUrl = req.file ? `/uploads/members/${req.file.filename}` : member.photoUrl;

    const updatedMember = await prisma.member.update({
      where: { id },
      data: {
        fullName,
        email,
        phoneNumber,
        photoUrl,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        gender,
        address,
        emergencyContact,
        isActive
      }
    });

    res.json({
      message: 'Member updated successfully',
      member: updatedMember
    });
  } catch (error) {
    console.error('Update member error:', error);
    res.status(500).json({ error: 'Failed to update member' });
  }
};

export const deleteMember = async (req, res) => {
  try {
    const { id } = req.params;

    const member = await prisma.member.findFirst({
      where: {
        id,
        gymOwnerId: req.gymOwnerId
      }
    });

    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    await prisma.member.delete({
      where: { id }
    });

    res.json({ message: 'Member deleted successfully' });
  } catch (error) {
    console.error('Delete member error:', error);
    res.status(500).json({ error: 'Failed to delete member' });
  }
};
