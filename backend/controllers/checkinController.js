import prisma from '../config/db.js';

const normalizePhone = (phone = '') => phone.replace(/\D/g, '').slice(-10);

// Public: gym name/address for the check-in page header
export const getGymInfo = async (req, res) => {
  try {
    const { gymOwnerId } = req.params;

    const gymOwner = await prisma.gymOwner.findUnique({
      where: { id: gymOwnerId },
      select: { gymName: true, gymAddress: true }
    });

    if (!gymOwner) {
      return res.status(404).json({ error: 'Gym not found' });
    }

    res.json({ gym: gymOwner });
  } catch (error) {
    console.error('Get gym info error:', error);
    res.status(500).json({ error: 'Failed to fetch gym info' });
  }
};

// Public: find active member(s) at this gym by phone number
export const lookupMember = async (req, res) => {
  try {
    const { gymOwnerId, phoneNumber } = req.body;
    const digits = normalizePhone(phoneNumber);

    if (digits.length < 6) {
      return res.status(400).json({ error: 'Enter a valid phone number' });
    }

    const members = await prisma.member.findMany({
      where: { gymOwnerId, isActive: true },
      select: { id: true, fullName: true, membershipId: true, photoUrl: true, phoneNumber: true }
    });

    const matches = members.filter((m) => normalizePhone(m.phoneNumber) === digits);

    if (matches.length === 0) {
      return res.status(404).json({ error: "We couldn't find you. Check the number or ask the front desk." });
    }

    res.json({ members: matches.map(({ phoneNumber, ...m }) => m) });
  } catch (error) {
    console.error('Lookup member error:', error);
    res.status(500).json({ error: 'Failed to look up member' });
  }
};

// Public: confirm and record the check-in
export const confirmCheckIn = async (req, res) => {
  try {
    const { memberId } = req.body;

    const member = await prisma.member.findFirst({
      where: { id: memberId, isActive: true }
    });

    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existing = await prisma.attendance.findFirst({
      where: { memberId, checkInTime: { gte: today } }
    });

    if (existing) {
      return res.json({
        alreadyCheckedIn: true,
        checkInTime: existing.checkInTime,
        member: { fullName: member.fullName, photoUrl: member.photoUrl }
      });
    }

    const attendance = await prisma.attendance.create({ data: { memberId } });
    const visitCount = await prisma.attendance.count({ where: { memberId } });

    res.status(201).json({
      alreadyCheckedIn: false,
      checkInTime: attendance.checkInTime,
      visitCount,
      member: { fullName: member.fullName, photoUrl: member.photoUrl }
    });
  } catch (error) {
    console.error('Confirm check-in error:', error);
    res.status(500).json({ error: 'Failed to record check-in' });
  }
};
