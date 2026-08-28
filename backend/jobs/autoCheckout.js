import cron from 'node-cron';
import prisma from '../config/db.js';

// Runs every midnight — anyone still "checked in" from a previous day gets
// auto-checked-out at the end of their check-in day, so stale "in gym"
// records don't linger forever.
export const startAutoCheckoutJob = () => {
  cron.schedule('0 0 * * *', async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const stale = await prisma.attendance.findMany({
        where: { checkOutTime: null, checkInTime: { lt: today } }
      });

      for (const record of stale) {
        const endOfDay = new Date(record.checkInTime);
        endOfDay.setHours(23, 59, 59, 999);
        await prisma.attendance.update({
          where: { id: record.id },
          data: { checkOutTime: endOfDay }
        });
      }

      if (stale.length > 0) {
        console.log(`🕛 Auto-checkout: closed ${stale.length} stale attendance record(s)`);
      }
    } catch (error) {
      console.error('Auto-checkout job error:', error);
    }
  });

  console.log('🕛 Auto-checkout job scheduled (runs daily at midnight)');
};
