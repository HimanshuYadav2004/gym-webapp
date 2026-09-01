import prisma from '../config/db.js';

const normalizePhone = (phone = '') => phone.replace(/\D/g, '').slice(-10);

// Haversine formula — great-circle distance between two lat/lng points, in meters
const distanceMeters = (lat1, lon1, lat2, lon2) => {
  const R = 6371000;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// Public: gym name/address for the check-in page header
export const getGymInfo = async (req, res) => {
  try {
    const { gymOwnerId } = req.params;

    const gymOwner = await prisma.gymOwner.findUnique({
      where: { id: gymOwnerId },
      select: {
        gymName: true,
        gymAddress: true,
        gymLatitude: true,
        gymLongitude: true,
        checkinRadiusMeters: true
      }
    });

    if (!gymOwner) {
      return res.status(404).json({ error: 'Gym not found' });
    }

    const locationRequired = gymOwner.gymLatitude != null && gymOwner.gymLongitude != null;

    res.json({
      gym: {
        gymName: gymOwner.gymName,
        gymAddress: gymOwner.gymAddress,
        locationRequired,
        checkinRadiusMeters: gymOwner.checkinRadiusMeters
      }
    });
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
    const { memberId, gymOwnerId, latitude, longitude } = req.body;

    if (!gymOwnerId) {
      return res.status(400).json({ error: 'Missing gym reference' });
    }

    const member = await prisma.member.findFirst({
      where: { id: memberId, gymOwnerId, isActive: true }
    });

    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    const gymOwner = await prisma.gymOwner.findUnique({
      where: { id: gymOwnerId },
      select: { gymLatitude: true, gymLongitude: true, checkinRadiusMeters: true }
    });

    const geofenced = gymOwner?.gymLatitude != null && gymOwner?.gymLongitude != null;

    if (geofenced) {
      if (latitude == null || longitude == null) {
        return res.status(400).json({ error: 'Location access is required to check in at this gym.', locationRequired: true });
      }

      const distance = distanceMeters(latitude, longitude, gymOwner.gymLatitude, gymOwner.gymLongitude);
      if (distance > gymOwner.checkinRadiusMeters) {
        return res.status(403).json({
          error: `You need to be at the gym to check in — you're about ${Math.round(distance)}m away.`,
          tooFar: true
        });
      }
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existing = await prisma.attendance.findFirst({
      where: { memberId, checkInTime: { gte: today } }
    });

    if (existing) {
      return res.json({
        alreadyCheckedIn: true,
        stillIn: !existing.checkOutTime,
        checkInTime: existing.checkInTime,
        checkOutTime: existing.checkOutTime,
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
