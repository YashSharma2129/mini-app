const request = require('supertest');
const app = require('../../server');
const pool = require('../../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

describe('Auth Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    test('should register a new user successfully', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123'
      };

      // Mock database query for checking existing user
      pool.query.mockResolvedValueOnce({ rows: [] });
      
      // Mock database query for inserting new user
      pool.query.mockResolvedValueOnce({
        rows: [{
          id: 1,
          name: 'Test User',
          email: 'test@example.com',
          role: 'user',
          wallet_balance: 100000.00
        }]
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe('test@example.com');
      expect(response.body.data.token).toBeDefined();
    });

    test('should return error if user already exists', async () => {
      const userData = {
        name: 'Test User',
        email: 'existing@example.com',
        password: 'password123',
        confirmPassword: 'password123'
      };

      // Mock database query to return existing user
      pool.query.mockResolvedValueOnce({
        rows: [{ id: 1, email: 'existing@example.com' }]
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already exists');
    });

    test('should return validation error for invalid data', async () => {
      const invalidData = {
        name: '',
        email: 'invalid-email',
        password: '123',
        confirmPassword: '456'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('POST /api/auth/login', () => {
    test('should login user successfully', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const mockUser = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashed-password',
        role: 'user',
        wallet_balance: 100000.00
      };

      // Mock database query to return user
      pool.query.mockResolvedValueOnce({
        rows: [mockUser]
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe('test@example.com');
      expect(response.body.data.token).toBeDefined();
    });

    test('should return error for invalid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      // Mock database query to return no user
      pool.query.mockResolvedValueOnce({ rows: [] });

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid credentials');
    });

    test('should return validation error for missing fields', async () => {
      const invalidData = {
        email: 'test@example.com'
        // missing password
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });
  });
});
