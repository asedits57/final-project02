import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../src/app';
import User from '../src/models/User';

let mongoServer: MongoMemoryServer;

describe('Auth API', () => {
  beforeAll(async () => {
    process.env.JWT_SECRET = 'testsecret';
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe('POST /api/register', () => {
    it('should register a new user successfully and set a cookie', async () => {
      const res = await request(app)
        .post('/api/v1/register')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('User registered');
      expect(res.header['set-cookie']).toBeDefined();
      expect(res.header['set-cookie'][0]).toContain('jwt_refresh=');

      const user = await User.findOne({ email: 'test@example.com' });
      expect(user).toBeTruthy();
    });

    it('should not register a user with an existing email', async () => {
      await User.create({
        email: 'test@example.com',
        password: 'hashedpassword'
      });

      const res = await request(app)
        .post('/api/v1/register')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('User already exists');
    });
  });

  describe('POST /api/login', () => {
    it('should login an existing user successfully and set a cookie', async () => {
      await request(app)
        .post('/api/v1/register')
        .send({
          email: 'login@example.com',
          password: 'password123'
        });

      const res = await request(app)
        .post('/api/v1/login')
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
      await request(app)
        .post('/api/v1/register')
        .send({
          email: 'wrongpass@example.com',
          password: 'password123'
        });

      const res = await request(app)
        .post('/api/v1/login')
        .send({
          email: 'wrongpass@example.com',
          password: 'wrongpassword'
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Invalid password');
    });
  });

  describe('GET /api/admin/stats', () => {
    it('should not allow access without a cookie', async () => {
      const res = await request(app).get('/api/admin/stats');
      expect(res.status).toBe(401);
      expect(res.body.message).toBe('Not authorized, no token provided');
    });
  });
});
