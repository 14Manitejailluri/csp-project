import { test, describe, before, after, beforeEach } from 'node:test';
import assert from 'node:assert';
import request from 'supertest';
import app from '../src/app.js';
import { connectTestDB, clearTestDB, closeTestDB } from './setup.js';
import { generateToken } from '../src/utils/token.js';
import { User } from '../src/models/User.js';
import { Donation } from '../src/models/Donation.js';

describe('Donation API Tests', () => {
  let donorUser;
  let donorToken;

  before(async () => {
    await connectTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();

    donorUser = await User.create({
      name: 'Fresh Bakery',
      email: 'bakery@example.com',
      password: 'password123',
      role: 'donor',
      organizationName: 'Fresh Bakery',
      location: {
        type: 'Point',
        coordinates: [-73.985, 40.748],
        address: '100 Broadway',
        city: 'New York',
        state: 'NY',
      },
    });
    donorToken = generateToken(donorUser._id, 'donor');
  });

  after(async () => {
    await closeTestDB();
  });

  test('POST /api/donations - should create a donation with valid data', async () => {
    const futureDeadline = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const res = await request(app)
      .post('/api/donations')
      .set('Authorization', `Bearer ${donorToken}`)
      .send({
        title: 'Assorted Artisan Bread & Pastries',
        description: 'Freshly baked baguettes, croissants, and sourdough bread',
        foodType: 'Bakery',
        quantity: 15,
        quantityUnit: 'kg',
        preparedAt: new Date().toISOString(),
        pickupDeadline: futureDeadline,
        storageCondition: 'Room Temperature',
        allergens: ['Gluten', 'Eggs', 'Dairy'],
        address: '100 Broadway',
        city: 'New York',
        state: 'NY',
        latitude: 40.748,
        longitude: -73.985,
      });

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.donation.title, 'Assorted Artisan Bread & Pastries');
    assert.strictEqual(res.body.data.donation.status, 'AVAILABLE');
  });

  test('GET /api/donations/available - should retrieve available donations', async () => {
    const futureDeadline = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await Donation.create({
      donor: donorUser._id,
      title: 'Vegetable Soup Containers',
      foodType: 'Cooked food',
      quantity: 20,
      quantityUnit: 'servings',
      preparedAt: new Date(),
      pickupDeadline: futureDeadline,
      location: {
        type: 'Point',
        coordinates: [-73.985, 40.748],
        address: '100 Broadway',
        city: 'New York',
        state: 'NY',
      },
      status: 'AVAILABLE',
    });

    const res = await request(app)
      .get('/api/donations/available')
      .set('Authorization', `Bearer ${donorToken}`);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.data.donations.length >= 1);
  });
});
