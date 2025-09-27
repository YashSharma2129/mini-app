const request = require('supertest');
const app = require('../../server');
const pool = require('../../config/database');

// Mock authentication middleware
jest.mock('../../middleware/auth', () => ({
  authenticateToken: (req, res, next) => {
    req.user = { id: 1, role: 'user' };
    next();
  },
  requireRole: () => (req, res, next) => next()
}));

describe('Portfolio Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/portfolio', () => {
    test('should get user portfolio successfully', async () => {
      const mockPortfolio = [
        {
          product_id: 1,
          product_name: 'Reliance Industries Ltd',
          category: 'Stocks',
          current_price: 2450.75,
          total_units: 5.0,
          total_invested: 12253.75
        }
      ];

      pool.query.mockResolvedValueOnce({
        rows: mockPortfolio
      });

      const response = await request(app)
        .get('/api/portfolio')
        .set('Authorization', 'Bearer mock-token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.portfolio).toHaveLength(1);
      expect(response.body.data.portfolio[0].product_name).toBe('Reliance Industries Ltd');
    });

    test('should return empty portfolio for new user', async () => {
      pool.query.mockResolvedValueOnce({
        rows: []
      });

      const response = await request(app)
        .get('/api/portfolio')
        .set('Authorization', 'Bearer mock-token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.portfolio).toHaveLength(0);
    });
  });

  describe('GET /api/portfolio/summary', () => {
    test('should get portfolio summary successfully', async () => {
      const mockSummary = {
        total_invested: 12253.75,
        current_value: 12500.00,
        returns: 246.25,
        returns_percentage: 2.01
      };

      const mockUser = {
        id: 1,
        wallet_balance: 87500.00
      };

      pool.query.mockResolvedValueOnce({
        rows: [mockSummary]
      });

      pool.query.mockResolvedValueOnce({
        rows: [mockUser]
      });

      const response = await request(app)
        .get('/api/portfolio/summary')
        .set('Authorization', 'Bearer mock-token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.summary.total_invested).toBe(12253.75);
      expect(response.body.data.wallet_balance).toBe(87500.00);
    });
  });

  describe('GET /api/portfolio/watchlist', () => {
    test('should get user watchlist successfully', async () => {
      const mockWatchlist = [
        {
          id: 1,
          name: 'Reliance Industries Ltd',
          category: 'Stocks',
          price: 2450.75,
          description: 'Leading Indian conglomerate'
        }
      ];

      pool.query.mockResolvedValueOnce({
        rows: mockWatchlist
      });

      const response = await request(app)
        .get('/api/portfolio/watchlist')
        .set('Authorization', 'Bearer mock-token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.watchlist).toHaveLength(1);
      expect(response.body.data.watchlist[0].name).toBe('Reliance Industries Ltd');
    });
  });

  describe('POST /api/portfolio/watchlist/:productId', () => {
    test('should add product to watchlist successfully', async () => {
      pool.query.mockResolvedValueOnce({
        rows: [{ id: 1, user_id: 1, product_id: 1 }]
      });

      const response = await request(app)
        .post('/api/portfolio/watchlist/1')
        .set('Authorization', 'Bearer mock-token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('added to watchlist');
    });

    test('should return error if product already in watchlist', async () => {
      pool.query.mockResolvedValueOnce({
        rows: [] // No rows returned means already exists
      });

      const response = await request(app)
        .post('/api/portfolio/watchlist/1')
        .set('Authorization', 'Bearer mock-token');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already in watchlist');
    });
  });

  describe('DELETE /api/portfolio/watchlist/:productId', () => {
    test('should remove product from watchlist successfully', async () => {
      pool.query.mockResolvedValueOnce({
        rows: [{ id: 1, user_id: 1, product_id: 1 }]
      });

      const response = await request(app)
        .delete('/api/portfolio/watchlist/1')
        .set('Authorization', 'Bearer mock-token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('removed from watchlist');
    });

    test('should return error if product not in watchlist', async () => {
      pool.query.mockResolvedValueOnce({
        rows: [] // No rows returned means not found
      });

      const response = await request(app)
        .delete('/api/portfolio/watchlist/1')
        .set('Authorization', 'Bearer mock-token');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not found in watchlist');
    });
  });
});
