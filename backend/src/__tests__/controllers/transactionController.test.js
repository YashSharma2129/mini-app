const request = require('supertest');
const app = require('../../server');
const pool = require('../../config/database');

// Mock authentication middleware
jest.mock('../../middleware/auth', () => ({
  authenticateToken: (req, res, next) => {
    req.user = { id: 1, role: 'user', wallet_balance: 100000.00 };
    next();
  },
  requireRole: () => (req, res, next) => next()
}));

describe('Transaction Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/transactions/buy', () => {
    test('should buy product successfully', async () => {
      const buyData = {
        productId: 1,
        units: 1
      };

      const mockProduct = {
        id: 1,
        name: 'Reliance Industries Ltd',
        price: 2450.75
      };

      const mockUser = {
        id: 1,
        wallet_balance: 100000.00
      };

      const mockTransaction = {
        id: 1,
        user_id: 1,
        product_id: 1,
        type: 'buy',
        units: 1,
        price_per_unit: 2450.75,
        total_amount: 2450.75
      };

      // Mock database queries
      pool.query
        .mockResolvedValueOnce({ rows: [mockProduct] }) // Get product
        .mockResolvedValueOnce({ rows: [mockUser] }) // Get user
        .mockResolvedValueOnce({ rows: [mockTransaction] }) // Create transaction
        .mockResolvedValueOnce({ rows: [] }) // Update wallet balance
        .mockResolvedValueOnce({ rows: [] }); // Update portfolio

      const response = await request(app)
        .post('/api/transactions/buy')
        .send(buyData)
        .set('Authorization', 'Bearer mock-token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('purchased successfully');
      expect(response.body.data.transaction.product_name).toBe('Reliance Industries Ltd');
    });

    test('should return error for insufficient wallet balance', async () => {
      const buyData = {
        productId: 1,
        units: 100 // Large quantity
      };

      const mockProduct = {
        id: 1,
        name: 'Reliance Industries Ltd',
        price: 2450.75
      };

      const mockUser = {
        id: 1,
        wallet_balance: 1000.00 // Low balance
      };

      pool.query
        .mockResolvedValueOnce({ rows: [mockProduct] })
        .mockResolvedValueOnce({ rows: [mockUser] });

      const response = await request(app)
        .post('/api/transactions/buy')
        .send(buyData)
        .set('Authorization', 'Bearer mock-token');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Insufficient wallet balance');
    });

    test('should return error for non-existent product', async () => {
      const buyData = {
        productId: 999,
        units: 1
      };

      pool.query.mockResolvedValueOnce({ rows: [] }); // No product found

      const response = await request(app)
        .post('/api/transactions/buy')
        .send(buyData)
        .set('Authorization', 'Bearer mock-token');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Product not found');
    });

    test('should return validation error for invalid data', async () => {
      const invalidData = {
        productId: 'invalid',
        units: -1
      };

      const response = await request(app)
        .post('/api/transactions/buy')
        .send(invalidData)
        .set('Authorization', 'Bearer mock-token');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('GET /api/transactions/my', () => {
    test('should get user transactions successfully', async () => {
      const mockTransactions = [
        {
          id: 1,
          user_id: 1,
          product_id: 1,
          type: 'buy',
          units: 1,
          price_per_unit: 2450.75,
          total_amount: 2450.75,
          product_name: 'Reliance Industries Ltd',
          category: 'Stocks'
        }
      ];

      pool.query.mockResolvedValueOnce({
        rows: mockTransactions
      });

      const response = await request(app)
        .get('/api/transactions/my')
        .set('Authorization', 'Bearer mock-token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.transactions).toHaveLength(1);
      expect(response.body.data.transactions[0].product_name).toBe('Reliance Industries Ltd');
    });

    test('should return empty array for user with no transactions', async () => {
      pool.query.mockResolvedValueOnce({
        rows: []
      });

      const response = await request(app)
        .get('/api/transactions/my')
        .set('Authorization', 'Bearer mock-token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.transactions).toHaveLength(0);
    });
  });

  describe('GET /api/transactions/stats', () => {
    test('should get transaction statistics successfully', async () => {
      const mockStats = {
        total_transactions: 5,
        total_buy_amount: 10000.00,
        total_sell_amount: 5000.00,
        total_buy_quantity: 10,
        total_sell_quantity: 5,
        avg_transaction_price: 1500.00
      };

      pool.query.mockResolvedValueOnce({
        rows: [mockStats]
      });

      const response = await request(app)
        .get('/api/transactions/stats')
        .set('Authorization', 'Bearer mock-token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.total_transactions).toBe(5);
      expect(response.body.data.total_buy_amount).toBe(10000.00);
    });
  });
});
