import { test, describe, before, after, beforeEach } from 'node:test';
import assert from 'node:assert';
import request from 'supertest';
import app from '../src/app.js';
import { connectTestDB, clearTestDB, closeTestDB } from './setup.js';
import { generateToken } from '../src/utils/token.js';
import { User } from '../src/models/User.js';
import { Donation } from '../src/models/Donation.js';
import { Pickup } from '../src/models/Pickup.js';

describe('Pickup Lifecycle & Status Transition Tests', () => {
  let donor, ngo, volunteer, otherVolunteer, donation, pickup;
  let volunteerToken, otherVolunteerToken;

  before(async () => {
    await connectTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();

    donor = await User.create({
      name: 'Supermarket Metro',
      email: 'metro@example.com',
      password: 'password123',
      role: 'donor',
    });

    ngo = await User.create({
      name: 'Community Meals',
      email: 'meals@ngo.org',
      password: 'password123',
      role: 'ngo',
      isVerified: true,
    });

    volunteer = await User.create({
      name: 'Volunteer Sarah',
      email: 'sarah@volunteer.org',
      password: 'password123',
      role: 'volunteer',
    });

    otherVolunteer = await User.create({
      name: 'Volunteer Tom',
      email: 'tom@volunteer.org',
      password: 'password123',
      role: 'volunteer',
    });

    volunteerToken = generateToken(volunteer._id, 'volunteer');
    otherVolunteerToken = generateToken(otherVolunteer._id, 'volunteer');

    donation = await Donation.create({
      donor: donor._id,
      title: 'Fresh Apples and Oranges',
      foodType: 'Fruits',
      quantity: 30,
      quantityUnit: 'kg',
      preparedAt: new Date(),
      pickupDeadline: new Date(Date.now() + 86400000),
      location: {
        type: 'Point',
        coordinates: [-73.98, 40.75],
        address: '10 Market St',
        city: 'New York',
        state: 'NY',
      },
      status: 'CLAIMED',
      claimedBy: ngo._id,
    });

    pickup = await Pickup.create({
      donation: donation._id,
      donor: donor._id,
      ngo: ngo._id,
      pickupAddress: {
        address: '10 Market St',
        city: 'New York',
        state: 'NY',
      },
      status: 'ASSIGNED',
    });
  });

  after(async () => {
    await closeTestDB();
  });

  test('PATCH /api/pickups/:id/assign - volunteer self-assigns task', async () => {
    const res = await request(app)
      .patch(`/api/pickups/${pickup._id}/assign`)
      .set('Authorization', `Bearer ${volunteerToken}`)
      .send();

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.pickup.status, 'ASSIGNED');
    assert.strictEqual(res.body.data.pickup.volunteer._id.toString(), volunteer._id.toString());
  });

  test('PATCH /api/pickups/:id/picked-up - should update status to PICKED_UP', async () => {
    pickup.volunteer = volunteer._id;
    await pickup.save();

    const res = await request(app)
      .patch(`/api/pickups/${pickup._id}/picked-up`)
      .set('Authorization', `Bearer ${volunteerToken}`)
      .send({ notes: 'Collected safely in insulated thermal containers.' });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.pickup.status, 'PICKED_UP');
  });

  test('PATCH /api/pickups/:id/picked-up - other unassigned volunteer should be forbidden', async () => {
    pickup.volunteer = volunteer._id;
    await pickup.save();

    const res = await request(app)
      .patch(`/api/pickups/${pickup._id}/picked-up`)
      .set('Authorization', `Bearer ${otherVolunteerToken}`)
      .send();

    assert.strictEqual(res.status, 403);
    assert.strictEqual(res.body.success, false);
  });

  test('PATCH /api/pickups/:id/delivered - should complete delivery and update status', async () => {
    pickup.volunteer = volunteer._id;
    pickup.status = 'PICKED_UP';
    await pickup.save();

    const res = await request(app)
      .patch(`/api/pickups/${pickup._id}/delivered`)
      .set('Authorization', `Bearer ${volunteerToken}`)
      .send({ notes: 'Delivered directly to community kitchen manager.' });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.pickup.status, 'DELIVERED');

    const updatedDonation = await Donation.findById(donation._id);
    assert.strictEqual(updatedDonation.status, 'DELIVERED');
  });
});
