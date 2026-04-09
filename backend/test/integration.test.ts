import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import mongoose from 'mongoose';
import User from '../src/models/User';
import * as userService from '../src/services/userService';
import { vi } from 'vitest';
import { createMongoMemoryServer } from '../src/config/memoryMongo';

let mongoServer: Awaited<ReturnType<typeof createMongoMemoryServer>>;

describe('UserService Integration', () => {
  beforeAll(async () => {
    mongoServer = await createMongoMemoryServer();
    await mongoose.connect(mongoServer.getUri());
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await User.deleteMany({});
  });

  it('should correctly update user score and streak', async () => {
    const user = await User.create({
      email: 'service@test.com',
      password: 'hashed',
      score: 0,
      streak: 0,
      lastActive: new Date(Date.now() - 24 * 60 * 60 * 1000) // yesterday
    });

    const updated = await userService.updateUserProgress(user._id.toString(), 100);
    
    expect(updated.score).toBe(100);
    expect(updated.streak).toBe(1); // Should increment if active yesterday
  });

  it('should reset streak if last active is longer than 24h', async () => {
    const user = await User.create({
      email: 'service2@test.com',
      password: 'hashed',
      score: 50,
      streak: 5,
      lastActive: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
    });

    const updated = await userService.updateUserProgress(user._id.toString(), 50);
    
    expect(updated.score).toBe(100);
    expect(updated.streak).toBe(1); // Reset
  });
});
