const pool = require('../config/database');
const { getRedisClient } = require('../config/redis');

class Product {
  static async create(productData) {
    const { name, category, price, description, pe_ratio, market_cap, volume } = productData;
    
    const query = `
      INSERT INTO products (name, category, price, description, pe_ratio, market_cap, volume, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      RETURNING *
    `;
    
    const values = [name, category, price, description, pe_ratio, market_cap, volume];
    const result = await pool.query(query, values);
    
    // Clear cache when new product is added
    const redisClient = getRedisClient();
    if (redisClient) {
      await redisClient.del('products:all');
    }
    
    return result.rows[0];
  }

  static async findAll() {
    const redisClient = getRedisClient();
    
    // Try to get from cache first
    if (redisClient) {
      try {
        const cached = await redisClient.get('products:all');
        if (cached) {
          return JSON.parse(cached);
        }
      } catch (error) {
        console.error('Redis cache error:', error);
      }
    }

    const query = `
      SELECT id, name, category, price, description, pe_ratio, market_cap, volume, created_at
      FROM products
      ORDER BY created_at DESC
    `;
    
    const result = await pool.query(query);
    const products = result.rows;

    // Cache the result for 5 minutes
    if (redisClient) {
      try {
        await redisClient.setEx('products:all', 300, JSON.stringify(products));
      } catch (error) {
        console.error('Redis cache error:', error);
      }
    }

    return products;
  }

  static async findById(id) {
    const query = 'SELECT * FROM products WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async updatePrice(id, newPrice) {
    const query = 'UPDATE products SET price = $1 WHERE id = $2 RETURNING *';
    const result = await pool.query(query, [newPrice, id]);
    
    const redisClient = getRedisClient();
    if (redisClient) {
      await redisClient.del('products:all');
    }
    
    return result.rows[0];
  }

  static async getByCategory(category) {
    const query = `
      SELECT id, name, category, price, description, pe_ratio, market_cap, volume
      FROM products
      WHERE category = $1
      ORDER BY name
    `;
    const result = await pool.query(query, [category]);
    return result.rows;
  }

  static async searchProducts(searchTerm) {
    const query = `
      SELECT id, name, category, price, description, pe_ratio, market_cap, volume
      FROM products
      WHERE name ILIKE $1 OR category ILIKE $1
      ORDER BY name
    `;
    const result = await pool.query(query, [`%${searchTerm}%`]);
    return result.rows;
  }
}

module.exports = Product;
