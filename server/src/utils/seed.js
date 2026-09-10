import mongoose from 'mongoose';
import { config } from '../config/env.js';
import { User } from '../models/User.js';
import { Donation } from '../models/Donation.js';
import { Claim } from '../models/Claim.js';
import { Pickup } from '../models/Pickup.js';
import { Notification } from '../models/Notification.js';

export const seedDatabase = async () => {
  try {
    await mongoose.connect(config.mongoUri);
    console.log('[Seed] Connected to database. Resetting collections...');

    await Promise.all([
      User.deleteMany({}),
      Donation.deleteMany({}),
      Claim.deleteMany({}),
      Pickup.deleteMany({}),
      Notification.deleteMany({}),
    ]);

    console.log('[Seed] Creating demo users for each role...');

    // 1. Admin
    const admin = await User.create({
      name: 'System Administrator',
      email: 'admin@foodrescue.org',
      password: 'password123',
      role: 'admin',
      isVerified: true,
      isActive: true,
    });

    // 2. Donor (Restaurant)
    const donor1 = await User.create({
      name: 'Green Gourmet Bistro',
      email: 'donor@example.com',
      password: 'password123',
      role: 'donor',
      organizationName: 'Green Gourmet Bistro LLC',
      phone: '+1 (212) 555-0199',
      isVerified: true,
      isActive: true,
      location: {
        type: 'Point',
        coordinates: [-73.9851, 40.7488], // Midtown NYC
        address: '350 5th Avenue',
        city: 'New York',
        state: 'NY',
      },
    });

    // 3. Donor (Supermarket)
    const donor2 = await User.create({
      name: 'Whole Harvest Grocers',
      email: 'grocer@example.com',
      password: 'password123',
      role: 'donor',
      organizationName: 'Whole Harvest Supermarket',
      phone: '+1 (212) 555-0188',
      isVerified: true,
      isActive: true,
      location: {
        type: 'Point',
        coordinates: [-73.9912, 40.7359], // Union Square
        address: '14th St & Broadway',
        city: 'New York',
        state: 'NY',
      },
    });

    // 4. Verified NGO
    const ngoVerified = await User.create({
      name: 'Hope Community Kitchen',
      email: 'hope@ngo.org',
      password: 'password123',
      role: 'ngo',
      organizationName: 'Hope Community Food Bank',
      phone: '+1 (212) 555-0144',
      isVerified: true,
      isActive: true,
      location: {
        type: 'Point',
        coordinates: [-73.9818, 40.7282], // East Village
        address: '250 E 4th Street',
        city: 'New York',
        state: 'NY',
      },
    });

    // 5. Pending Unverified NGO
    const ngoPending = await User.create({
      name: 'Metropolitan Youth Shelter',
      email: 'shelter@ngo.org',
      password: 'password123',
      role: 'ngo',
      organizationName: 'Metropolitan Youth Shelter Inc.',
      phone: '+1 (212) 555-0133',
      isVerified: false,
      isActive: true,
      location: {
        type: 'Point',
        coordinates: [-73.9712, 40.7189],
        address: '120 Delancey St',
        city: 'New York',
        state: 'NY',
      },
    });

    // 6. Volunteer Couriers
    const volunteer1 = await User.create({
      name: 'Sarah Jenkins',
      email: 'sarah@volunteer.org',
      password: 'password123',
      role: 'volunteer',
      phone: '+1 (212) 555-0177',
      isVerified: true,
      isActive: true,
    });

    const volunteer2 = await User.create({
      name: 'Marcus Chen',
      email: 'marcus@volunteer.org',
      password: 'password123',
      role: 'volunteer',
      phone: '+1 (212) 555-0166',
      isVerified: true,
      isActive: true,
    });

    console.log('[Seed] Creating sample surplus food donations...');

    const now = new Date();
    const fourHoursLater = new Date(now.getTime() + 4 * 3600 * 1000);
    const eightHoursLater = new Date(now.getTime() + 8 * 3600 * 1000);
    const twelveHoursLater = new Date(now.getTime() + 12 * 3600 * 1000);
    const yesterday = new Date(now.getTime() - 24 * 3600 * 1000);

    // Donation 1: AVAILABLE (Cooked food)
    const donation1 = await Donation.create({
      donor: donor1._id,
      title: '50 Fresh Bento Lunch Boxes (Teriyaki Chicken & Tofu)',
      description: 'Corporate luncheon surplus. Packed into individual thermal sealed boxes. Kept under hot-holding temperature.',
      foodType: 'Cooked food',
      quantity: 50,
      quantityUnit: 'servings',
      preparedAt: new Date(now.getTime() - 2 * 3600 * 1000),
      pickupDeadline: fourHoursLater,
      storageCondition: 'Hot Holding',
      allergens: ['Soy', 'Gluten', 'Sesame'],
      imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=700&auto=format&fit=crop&q=60',
      location: {
        type: 'Point',
        coordinates: [-73.9851, 40.7488],
        address: '350 5th Avenue, Suite 100',
        city: 'New York',
        state: 'NY',
      },
      status: 'AVAILABLE',
    });

    // Donation 2: AVAILABLE (Bakery)
    const donation2 = await Donation.create({
      donor: donor1._id,
      title: 'Assorted Artisan Sourdough & Croissants',
      description: 'Unsold surplus daily morning bakery goods. 20 loaves of French sourdough, 30 butter croissants.',
      foodType: 'Bakery',
      quantity: 18,
      quantityUnit: 'kg',
      preparedAt: new Date(now.getTime() - 4 * 3600 * 1000),
      pickupDeadline: eightHoursLater,
      storageCondition: 'Room Temperature',
      allergens: ['Gluten', 'Eggs', 'Dairy'],
      imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=700&auto=format&fit=crop&q=60',
      location: {
        type: 'Point',
        coordinates: [-73.9851, 40.7488],
        address: '350 5th Avenue',
        city: 'New York',
        state: 'NY',
      },
      status: 'AVAILABLE',
    });

    // Donation 3: AVAILABLE (Vegetables & Produce)
    const donation3 = await Donation.create({
      donor: donor2._id,
      title: 'Fresh Organic Produce Crates (Bell Peppers, Spinach, Squash)',
      description: 'Surplus organic farm crates. Pristine condition, washed and sorted for distribution.',
      foodType: 'Vegetables',
      quantity: 35,
      quantityUnit: 'kg',
      preparedAt: new Date(now.getTime() - 1 * 3600 * 1000),
      pickupDeadline: twelveHoursLater,
      storageCondition: 'Refrigerated',
      allergens: ['None / Allergen Free'],
      imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=700&auto=format&fit=crop&q=60',
      location: {
        type: 'Point',
        coordinates: [-73.9912, 40.7359],
        address: '14th St & Broadway',
        city: 'New York',
        state: 'NY',
      },
      status: 'AVAILABLE',
    });

    // Donation 4: CLAIMED by Hope NGO (Awaiting courier)
    const donation4 = await Donation.create({
      donor: donor2._id,
      title: '40 Packets of Organic Greek Yogurt & Milk',
      description: 'Refrigerated dairy stock with 4 days before sell-by date. Kept at 2°C.',
      foodType: 'Packaged food',
      quantity: 40,
      quantityUnit: 'packets',
      preparedAt: new Date(now.getTime() - 6 * 3600 * 1000),
      pickupDeadline: fourHoursLater,
      storageCondition: 'Refrigerated',
      allergens: ['Dairy / Milk'],
      imageUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=700&auto=format&fit=crop&q=60',
      location: {
        type: 'Point',
        coordinates: [-73.9912, 40.7359],
        address: '14th St & Broadway',
        city: 'New York',
        state: 'NY',
      },
      status: 'CLAIMED',
      claimedBy: ngoVerified._id,
      claimedAt: new Date(now.getTime() - 30 * 60 * 1000),
    });

    await Claim.create({
      donation: donation4._id,
      ngo: ngoVerified._id,
      status: 'CLAIMED',
      notes: 'For evening youth shelter dinner program.',
    });

    await Pickup.create({
      donation: donation4._id,
      donor: donor2._id,
      ngo: ngoVerified._id,
      pickupAddress: {
        address: '14th St & Broadway',
        city: 'New York',
        state: 'NY',
        coordinates: [-73.9912, 40.7359],
      },
      deliveryAddress: {
        address: '250 E 4th Street',
        city: 'New York',
        state: 'NY',
        coordinates: [-73.9818, 40.7282],
      },
      status: 'ASSIGNED',
    });

    // Donation 5: ASSIGNED to Volunteer Sarah
    const donation5 = await Donation.create({
      donor: donor1._id,
      title: '30 Hot Mediterranean Rice & Falafel Bowls',
      description: 'Fresh catering surplus with tahini dip, pita, and salad boxes.',
      foodType: 'Cooked food',
      quantity: 30,
      quantityUnit: 'servings',
      preparedAt: new Date(now.getTime() - 3 * 3600 * 1000),
      pickupDeadline: fourHoursLater,
      storageCondition: 'Hot Holding',
      allergens: ['Sesame', 'Gluten'],
      imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=700&auto=format&fit=crop&q=60',
      location: {
        type: 'Point',
        coordinates: [-73.9851, 40.7488],
        address: '350 5th Avenue',
        city: 'New York',
        state: 'NY',
      },
      status: 'ASSIGNED',
      claimedBy: ngoVerified._id,
      volunteer: volunteer1._id,
      claimedAt: new Date(now.getTime() - 60 * 60 * 1000),
    });

    await Claim.create({
      donation: donation5._id,
      ngo: ngoVerified._id,
      status: 'ASSIGNED',
    });

    await Pickup.create({
      donation: donation5._id,
      donor: donor1._id,
      ngo: ngoVerified._id,
      volunteer: volunteer1._id,
      pickupAddress: {
        address: '350 5th Avenue',
        city: 'New York',
        state: 'NY',
        coordinates: [-73.9851, 40.7488],
      },
      deliveryAddress: {
        address: '250 E 4th Street',
        city: 'New York',
        state: 'NY',
        coordinates: [-73.9818, 40.7282],
      },
      status: 'ASSIGNED',
    });

    // Donation 6: DELIVERED (Completed Impact item)
    const donation6 = await Donation.create({
      donor: donor2._id,
      title: '60 kg Fresh Crisp Apples & Citrus Oranges',
      description: 'Seasonal orchard surplus fruit boxes distributed to community members.',
      foodType: 'Fruits',
      quantity: 60,
      quantityUnit: 'kg',
      preparedAt: yesterday,
      pickupDeadline: now,
      storageCondition: 'Room Temperature',
      allergens: ['None / Allergen Free'],
      imageUrl: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=700&auto=format&fit=crop&q=60',
      location: {
        type: 'Point',
        coordinates: [-73.9912, 40.7359],
        address: '14th St & Broadway',
        city: 'New York',
        state: 'NY',
      },
      status: 'DELIVERED',
      claimedBy: ngoVerified._id,
      volunteer: volunteer2._id,
      claimedAt: new Date(yesterday.getTime() + 2 * 3600 * 1000),
      pickedUpAt: new Date(yesterday.getTime() + 3 * 3600 * 1000),
      deliveredAt: new Date(yesterday.getTime() + 4 * 3600 * 1000),
    });

    await Claim.create({
      donation: donation6._id,
      ngo: ngoVerified._id,
      status: 'COMPLETED',
    });

    await Pickup.create({
      donation: donation6._id,
      donor: donor2._id,
      ngo: ngoVerified._id,
      volunteer: volunteer2._id,
      pickupAddress: {
        address: '14th St & Broadway',
        city: 'New York',
        state: 'NY',
        coordinates: [-73.9912, 40.7359],
      },
      deliveryAddress: {
        address: '250 E 4th Street',
        city: 'New York',
        state: 'NY',
        coordinates: [-73.9818, 40.7282],
      },
      status: 'DELIVERED',
      pickedUpAt: new Date(yesterday.getTime() + 3 * 3600 * 1000),
      deliveredAt: new Date(yesterday.getTime() + 4 * 3600 * 1000),
    });

    // Sample notifications
    await Notification.create({
      recipient: ngoVerified._id,
      title: 'New Food Donation Available Nearby',
      message: '"50 Fresh Bento Lunch Boxes" is available in New York.',
      type: 'NEW_DONATION',
      relatedDonation: donation1._id,
    });

    await Notification.create({
      recipient: donor1._id,
      title: 'Donation Claimed by NGO',
      message: 'Hope Community Food Bank has claimed your Mediterranean Rice Bowls.',
      type: 'DONATION_CLAIMED',
      relatedDonation: donation5._id,
    });

    console.log('[Seed] Database populated successfully with rich demonstration data!');
    console.log('----------------------------------------------------');
    console.log('Demo Accounts:');
    console.log('Donor:      donor@example.com     / password123');
    console.log('NGO (ver):  hope@ngo.org           / password123');
    console.log('NGO (pen):  shelter@ngo.org        / password123');
    console.log('Volunteer:  sarah@volunteer.org    / password123');
    console.log('Admin:      admin@foodrescue.org   / password123');
    console.log('----------------------------------------------------');

    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]:', error);
    process.exit(1);
  }
};

// If executed directly from CLI
if (process.argv[1]?.endsWith('seed.js')) {
  seedDatabase();
}
