import { test, describe, before, after, beforeEach } from 'node:test';
import assert from 'node:assert';
import request from 'supertest';
import app from '../src/app.js';
import { connectTestDB, clearTestDB, closeTestDB } from './setup.js';
import { generateToken } from '../src/utils/token.js';
import { User } from '../src/models/User.js';
import { Donation } from '../src/models/Donation.js';

describe('Claim API & Atomic Lock Tests', () => {
  let donor;
  let verifiedNgo1;
  let verifiedNgo2;
  let unverifiedNgo;
  let donation;

  before(async () => {
    await connectTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();

    donor = await User.create({
      name: 'City Restaurant',
      email: 'donor@example.com',
      password: 'password123',
      role: 'donor',
    });

    verifiedNgo1 = await User.create({
      name: 'Hope Food Bank',
      email: 'hope@ngo.org',
      password: 'password123',
      role: 'ngo',
      organizationName: 'Hope Food Bank Org',
      isVerified: true,
    });

    verifiedNgo2 = await User.create({
      name: 'Care Shelter',
      email: 'care@ngo.org',
      password: 'password123',
      role: 'ngo',
      organizationName: 'Care Shelter Org',
      isVerified: true,
    });

    unverifiedNgo = await User.create({
      name: 'New Pending NGO',
      email: 'pending@ngo.org',
      password: 'password123',
      role: 'ngo',
      isVerified: false,
    });

    donation = await Donation.create({
      donor: donor._id,
      title: 'Surplus Catering Trays',
      foodType: 'Cooked food',
      quantity: 50,
      quantityUnit: 'servings',
      preparedAt: new Date(),
      pickupDeadline: new Date(Date.now() + 12 * 60 * 60 * 1000),
      location: {
        type: 'Point',
        coordinates: [-73.98, 40.75],
        address: '500 5th Ave',
        city: 'New York',
        state: 'NY',
      },
      status: 'AVAILABLE',
    });
  });

  after(async () => {
    await closeTestDB();
  });

  test('POST /api/claims - unverified NGO should be blocked from claiming', async () => {
    const unverifiedToken = generateToken(unverifiedNgo._id, 'ngo');

    const res = await request(app)
      .post('/api/claims')
      .set('Authorization', `Bearer ${unverifiedToken}`)
      .send({ donationId: donation._id.toString() });

    assert.strictEqual(res.status, 403);
    assert.strictEqual(res.body.success, false);
  });

  test('POST /api/claims - verified NGO should successfully claim donation', async () => {
    const ngo1Token = generateToken(verifiedNgo1._id, 'ngo');

    const res = await request(app)
      .post('/api/claims')
      .set('Authorization', `Bearer ${ngo1Token}`)
      .send({
        donationId: donation._id.toString(),
        notes: 'We will distribute to homeless shelter at 6 PM',
      });

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.donation.status, 'CLAIMED');
  });

  test('POST /api/claims - atomic lock: second NGO attempting to claim same donation must fail', async () => {
    const ngo1Token = generateToken(verifiedNgo1._id, 'ngo');
    const ngo2Token = generateToken(verifiedNgo2._id, 'ngo');

    // First NGO claims
    const res1 = await request(app)
      .post('/api/claims')
      .set('Authorization', `Bearer ${ngo1Token}`)
      .send({ donationId: donation._id.toString() });

    assert.strictEqual(res1.status, 201);

    // Second NGO claims simultaneously
    const res2 = await request(app)
      .post('/api/claims')
      .set('Authorization', `Bearer ${ngo2Token}`)
      .send({ donationId: donation._id.toString() });

    assert.strictEqual(res2.status, 409); // Conflict - already claimed
    assert.strictEqual(res2.body.success, false);
  });
});
