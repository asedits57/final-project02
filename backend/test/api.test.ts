import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app';

describe('Global API Health', () => {
  it('should return 200 on /api diagnostic route', async () => {
    const res = await request(app).get('/api');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('API Working');
  });

  it('should return 200 on /api/test route', async () => {
    const res = await request(app).get('/api/test');
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Backend working ✅');
  });

  it('should handle 404 for non-existent routes with standard error', async () => {
    const res = await request(app).get('/api/does-not-exist');
    expect(res.status).toBe(404);
  });
});
