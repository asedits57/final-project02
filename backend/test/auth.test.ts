import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import bcrypt from 'bcrypt';
import request from 'supertest';
import app from '../src/app';
import User from '../src/models/User';
import { connectMongoTestDatabase, getMongoTestAvailability, type TestDatabaseHandle } from './support/database';

const mongoSupport = getMongoTestAvailability();
const describeMongo = mongoSupport.enabled ? describe : describe.skip;

describeMongo('Auth API', () => {
  let database: TestDatabaseHandle;

  beforeAll(async () => {
    process.env.JWT_SECRET = 'testsecret';
    database = await connectMongoTestDatabase();
  });

  afterAll(async () => {
    await database?.stop();
  });

  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe('POST /api/v1/auth/register', () => {
    it('requires a verified signup request id', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(res.status).toBe(400);
      expect(String(res.body.message)).toContain('requestId');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should login an existing user successfully and set a cookie', async () => {
      await User.create({
        email: 'login@example.com',
        password: await bcrypt.hash('password123', 10),
        username: 'login-user',
      });

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'login@example.com',
          password: 'password123'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Login successful');
      expect(res.header['set-cookie']).toBeDefined();
    });

    it('should not login with wrong password', async () => {
      await User.create({
        email: 'wrongpass@example.com',
        password: await bcrypt.hash('password123', 10),
      });

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'wrongpass@example.com',
          password: 'wrongpassword'
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Invalid password');
    });

    it('supports logging in with username as well as email', async () => {
      await User.create({
        email: 'username@example.com',
        username: 'username-login',
        password: await bcrypt.hash('password123', 10),
      });

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'username-login',
          password: 'password123'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user.email).toBe('username@example.com');
    });
  });

  describe('GET /api/admin/stats', () => {
    it('should not allow access without a cookie', async () => {
      const res = await request(app).get('/api/v1/admin/stats');
      expect(res.status).toBe(401);
      expect(res.body.message).toBe('Not authorized, no token provided');
    });
  });
});
