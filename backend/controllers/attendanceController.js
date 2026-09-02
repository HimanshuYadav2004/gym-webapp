import prisma from '../config/db.js';

export const checkIn = async (req, res) => {
  try {
    const { memberId } = req.body;

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

    // Check if already checked in today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingAttendance = await prisma.attendance.findFirst({
      where: {
        memberId,
        checkInTime: {
          gte: today
        }
      }
    });

    if (existingAttendance) {
      return res.status(400).json({ error: 'Member already checked in today' });
    }

    const attendance = await prisma.attendance.create({
      data: {
        memberId
      }
    });

    res.status(201).json({
      message: 'Check-in recorded successfully',
      attendance
    });
  } catch (error) {
    console.error('Check-in error:', error);
    res.status(500).json({ error: 'Failed to record check-in' });
  }
};

export const checkOut = async (req, res) => {
  try {
    const { attendanceId } = req.body;

    const attendance = await prisma.attendance.findFirst({
      where: {
        id: attendanceId,
        member: {
          gymOwnerId: req.gymOwnerId
        }
      }
    });

    if (!attendance) {
      return res.status(404).json({ error: 'Attendance record not found' });
    }

    if (attendance.checkOutTime) {
      return res.status(400).json({ error: 'Already checked out' });
    }

    const updatedAttendance = await prisma.attendance.update({
      where: { id: attendanceId },
      data: { checkOutTime: new Date() }
    });

    res.json({
      message: 'Check-out recorded successfully',
      attendance: updatedAttendance
    });
  } catch (error) {
    console.error('Check-out error:', error);
    res.status(500).json({ error: 'Failed to record check-out' });
  }
};

export const updateAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { checkInTime, checkOutTime } = req.body;

    const attendance = await prisma.attendance.findFirst({
      where: {
        id,
        member: { gymOwnerId: req.gymOwnerId }
      }
    });

    if (!attendance) {
      return res.status(404).json({ error: 'Attendance record not found' });
    }

    const updatedAttendance = await prisma.attendance.update({
      where: { id },
      data: {
        checkInTime: checkInTime ? new Date(checkInTime) : attendance.checkInTime,
        checkOutTime: checkOutTime === '' ? null : checkOutTime ? new Date(checkOutTime) : attendance.checkOutTime
      }
    });

    res.json({
      message: 'Attendance updated successfully',
      attendance: updatedAttendance
    });
  } catch (error) {
    console.error('Update attendance error:', error);
    res.status(500).json({ error: 'Failed to update attendance' });
  }
};

export const deleteAttendance = async (req, res) => {
  try {
    const { id } = req.params;

    const attendance = await prisma.attendance.findFirst({
      where: {
        id,
        member: { gymOwnerId: req.gymOwnerId }
      }
    });

    if (!attendance) {
      return res.status(404).json({ error: 'Attendance record not found' });
    }

    await prisma.attendance.delete({ where: { id } });

    res.json({ message: 'Attendance record deleted successfully' });
  } catch (error) {
    console.error('Delete attendance error:', error);
    res.status(500).json({ error: 'Failed to delete attendance record' });
  }
};

export const getAttendanceHistory = async (req, res) => {
  try {
    const { memberId } = req.params;
    const { startDate, endDate } = req.query;

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

    const where = {
      memberId,
      ...(startDate && endDate && {
        checkInTime: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      })
    };

    const attendance = await prisma.attendance.findMany({
      where,
      orderBy: { checkInTime: 'desc' }
    });

    res.json({ attendance });
  } catch (error) {
    console.error('Get attendance history error:', error);
    res.status(500).json({ error: 'Failed to fetch attendance history' });
  }
};

export const getCheckinLocation = async (req, res) => {
  try {
    const gymOwner = await prisma.gymOwner.findUnique({
      where: { id: req.gymOwnerId },
      select: { gymLatitude: true, gymLongitude: true, checkinRadiusMeters: true }
    });
    res.json({
      isSet: gymOwner.gymLatitude != null && gymOwner.gymLongitude != null,
      radiusMeters: gymOwner.checkinRadiusMeters
    });
  } catch (error) {
    console.error('Get checkin location error:', error);
    res.status(500).json({ error: 'Failed to fetch check-in location' });
  }
};

export const setCheckinLocation = async (req, res) => {
  try {
    const { latitude, longitude, radiusMeters } = req.body;

    if (latitude == null || longitude == null) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    await prisma.gymOwner.update({
      where: { id: req.gymOwnerId },
      data: {
        gymLatitude: latitude,
        gymLongitude: longitude,
        ...(radiusMeters ? { checkinRadiusMeters: parseInt(radiusMeters) } : {})
      }
    });

    res.json({ message: 'Gym location saved' });
  } catch (error) {
    console.error('Set checkin location error:', error);
    res.status(500).json({ error: 'Failed to save gym location' });
  }
};

export const clearCheckinLocation = async (req, res) => {
  try {
    await prisma.gymOwner.update({
      where: { id: req.gymOwnerId },
      data: { gymLatitude: null, gymLongitude: null }
    });
    res.json({ message: 'Location check-in disabled' });
  } catch (error) {
    console.error('Clear checkin location error:', error);
    res.status(500).json({ error: 'Failed to clear gym location' });
  }
};

export const getAttendanceReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'startDate and endDate are required' });
    }

    const attendance = await prisma.attendance.findMany({
      where: {
        checkInTime: { gte: new Date(startDate), lte: new Date(endDate) },
        member: { gymOwnerId: req.gymOwnerId }
      },
      include: {
        member: { select: { id: true, fullName: true, membershipId: true, photoUrl: true } }
      },
      orderBy: { checkInTime: 'desc' }
    });

    res.json({ attendance, count: attendance.length });
  } catch (error) {
    console.error('Get attendance report error:', error);
    res.status(500).json({ error: 'Failed to fetch attendance report' });
  }
};

export const getTodayAttendance = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await prisma.attendance.findMany({
      where: {
        checkInTime: {
          gte: today
        },
        member: {
          gymOwnerId: req.gymOwnerId
        }
      },
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
      orderBy: { checkInTime: 'desc' }
    });

    res.json({ attendance, count: attendance.length });
  } catch (error) {
    console.error('Get today attendance error:', error);
    res.status(500).json({ error: 'Failed to fetch today attendance' });
  }
};
