import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import User from '../src/models/User';
import * as userService from '../src/services/userService';
import { vi } from 'vitest';
import { connectMongoTestDatabase, getMongoTestAvailability, type TestDatabaseHandle } from './support/database';

const mongoSupport = getMongoTestAvailability();
const describeMongo = mongoSupport.enabled ? describe : describe.skip;

describeMongo('UserService Integration', () => {
  let database: TestDatabaseHandle;

  beforeAll(async () => {
    database = await connectMongoTestDatabase();
  });

  afterAll(async () => {
    await database.stop();
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
