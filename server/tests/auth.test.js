import { test, describe, before, after, beforeEach } from 'node:test';
import assert from 'node:assert';
import request from 'supertest';
import app from '../src/app.js';
import { connectTestDB, clearTestDB, closeTestDB } from './setup.js';
import { User } from '../src/models/User.js';

describe('Auth API Unit & Integration Tests', () => {
  before(async () => {
    await connectTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();
  });

  after(async () => {
    await closeTestDB();
  });

  test('POST /api/auth/register - should register a new donor successfully', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Green Bistro',
        email: 'bistro@example.com',
        password: 'password123',
        role: 'donor',
        organizationName: 'Green Bistro LLC',
        phone: '123-456-7890',
        location: {
          coordinates: [-73.9851, 40.7488],
          address: '350 5th Ave',
          city: 'New York',
          state: 'NY',
        },
      });

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.user.email, 'bistro@example.com');
    assert.strictEqual(res.body.data.user.role, 'donor');
    assert.strictEqual(res.body.data.user.password, undefined); // Password never exposed
  });

  test('POST /api/auth/register - should fail on duplicate email', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Donor One',
        email: 'duplicate@example.com',
        password: 'password123',
        role: 'donor',
      });

    const duplicateRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Donor Two',
        email: 'duplicate@example.com',
        password: 'password123',
        role: 'donor',
      });

    assert.strictEqual(duplicateRes.status, 409);
    assert.strictEqual(duplicateRes.body.success, false);
  });

  test('POST /api/auth/login - should authenticate valid user and set cookie', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Volunteer Alice',
        email: 'alice@example.com',
        password: 'securePassword123',
        role: 'volunteer',
      });

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'alice@example.com',
        password: 'securePassword123',
      });

    assert.strictEqual(loginRes.status, 200);
    assert.strictEqual(loginRes.body.success, true);
    assert.ok(loginRes.body.data.token);
    assert.strictEqual(loginRes.body.data.user.email, 'alice@example.com');
  });

  test('POST /api/auth/login - should reject incorrect password', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Bob',
        email: 'bob@example.com',
        password: 'correctPassword',
        role: 'donor',
      });

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'bob@example.com',
        password: 'wrongPassword',
      });

    assert.strictEqual(res.status, 401);
    assert.strictEqual(res.body.success, false);
  });
});
