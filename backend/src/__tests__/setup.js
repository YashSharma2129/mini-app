const { Pool } = require('pg');

// Mock database connection for tests
jest.mock('../config/database', () => ({
  query: jest.fn(),
  end: jest.fn()
}));

// Mock Redis connection
jest.mock('../config/redis', () => ({
  connectRedis: jest.fn(() => Promise.resolve()),
  getClient: jest.fn(() => ({
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    quit: jest.fn()
  }))
}));

// Mock JWT
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(() => 'mock-jwt-token'),
  verify: jest.fn(() => ({ userId: 1, role: 'user' }))
}));

// Mock bcrypt
jest.mock('bcryptjs', () => ({
  hash: jest.fn(() => 'hashed-password'),
  compare: jest.fn(() => true)
}));

// Global test timeout
jest.setTimeout(10000);

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
});
