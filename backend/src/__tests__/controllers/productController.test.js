const request = require('supertest');
const app = require('../../server');
const pool = require('../../config/database');

describe('Product Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/products', () => {
    test('should get all products successfully', async () => {
      const mockProducts = [
        {
          id: 1,
          name: 'Reliance Industries Ltd',
          category: 'Stocks',
          price: 2450.75,
          description: 'Leading Indian conglomerate',
          pe_ratio: 18.5,
          market_cap: 16500000000000,
          volume: 2500000
        },
        {
          id: 2,
          name: 'TCS',
          category: 'Stocks',
          price: 3850.25,
          description: 'Global IT services',
          pe_ratio: 25.8,
          market_cap: 14000000000000,
          volume: 1800000
        }
      ];

      pool.query.mockResolvedValueOnce({
        rows: mockProducts
      });

      const response = await request(app)
        .get('/api/products');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.products).toHaveLength(2);
      expect(response.body.data.products[0].name).toBe('Reliance Industries Ltd');
    });

    test('should handle database errors', async () => {
      pool.query.mockRejectedValueOnce(new Error('Database connection failed'));

      const response = await request(app)
        .get('/api/products?error=database');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Internal server error');
    });
  });

  describe('GET /api/products/:id', () => {
    test('should get product by id successfully', async () => {
      const mockProduct = {
        id: 1,
        name: 'Reliance Industries Ltd',
        category: 'Stocks',
        price: 2450.75,
        description: 'Leading Indian conglomerate',
        pe_ratio: 18.5,
        market_cap: 16500000000000,
        volume: 2500000
      };

      pool.query.mockResolvedValueOnce({
        rows: [mockProduct]
      });

      const response = await request(app)
        .get('/api/products/1');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.product.name).toBe('Reliance Industries Ltd');
    });

    test('should return 404 for non-existent product', async () => {
      pool.query.mockResolvedValueOnce({
        rows: []
      });

      const response = await request(app)
        .get('/api/products/999');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Product not found');
    });

    test('should return 400 for invalid product id', async () => {
      const response = await request(app)
        .get('/api/products/invalid');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid product ID');
    });
  });

  describe('GET /api/products/category/:category', () => {
    test('should get products by category successfully', async () => {
      const mockProducts = [
        {
          id: 1,
          name: 'Reliance Industries Ltd',
          category: 'Stocks',
          price: 2450.75
        }
      ];

      pool.query.mockResolvedValueOnce({
        rows: mockProducts
      });

      const response = await request(app)
        .get('/api/products/category/Stocks');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.products).toHaveLength(1);
      expect(response.body.data.products[0].category).toBe('Stocks');
    });

    test('should return empty array for non-existent category', async () => {
      pool.query.mockResolvedValueOnce({
        rows: []
      });

      const response = await request(app)
        .get('/api/products/category/NonExistent');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.products).toHaveLength(0);
    });
  });
});
