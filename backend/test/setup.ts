import { vi } from 'vitest';

process.env.NODE_ENV = 'test';

// Global mock for Socket.io to prevent initialization errors in all tests
vi.mock('../src/socket', () => ({
  initSocket: vi.fn(),
  getIO: vi.fn(() => ({
    emit: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
  })),
}));
