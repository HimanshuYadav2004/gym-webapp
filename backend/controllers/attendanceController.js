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
