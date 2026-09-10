import cron from 'node-cron';
import { Donation } from '../models/Donation.js';
import { notifyDonationExpired } from './notificationService.js';

export const sweepExpiredDonations = async () => {
  try {
    const now = new Date();
    const expiredDonations = await Donation.find({
      status: 'AVAILABLE',
      pickupDeadline: { $lt: now },
    });

    if (expiredDonations.length === 0) return 0;

    console.log(`[Sweeper] Found ${expiredDonations.length} expired donation(s). Updating status...`);

    for (const donation of expiredDonations) {
      donation.status = 'EXPIRED';
      await donation.save();
      await notifyDonationExpired(donation);
    }

    return expiredDonations.length;
  } catch (error) {
    console.error('[Sweeper Error]:', error.message);
    return 0;
  }
};

export const initCronJobs = () => {
  // Run every 5 minutes: */5 * * * *
  cron.schedule('*/5 * * * *', async () => {
    await sweepExpiredDonations();
  });

  // Also run immediate sweep on startup
  sweepExpiredDonations();
  console.log('[Cron Service] Expiration sweeper scheduled every 5 minutes.');
};
