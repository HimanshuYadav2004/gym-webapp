import prisma from '../config/db.js';
import { uploadToSupabase, deleteFromSupabase } from '../middleware/uploadSupabase.js';

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

    // Upload photo to Supabase if provided
    let photoUrl = null;
    if (req.file) {
      photoUrl = await uploadToSupabase(req.file, 'members');
    }

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
      joiningDate,
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

    let photoUrl = member.photoUrl;

    // Upload new photo to Supabase if provided
    if (req.file) {
      // Delete old photo if exists
      if (member.photoUrl) {
        await deleteFromSupabase(member.photoUrl);
      }
      photoUrl = await uploadToSupabase(req.file, 'members');
    }

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
        joiningDate: joiningDate ? new Date(joiningDate) : member.joiningDate,
        isActive: isActive === undefined ? member.isActive : isActive === 'true' || isActive === true
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

    // Delete photo from Supabase if exists
    if (member.photoUrl) {
      await deleteFromSupabase(member.photoUrl);
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
