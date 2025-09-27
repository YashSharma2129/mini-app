const Product = require('../models/Product');
const Portfolio = require('../models/Portfolio');

const getAllProducts = async (req, res) => {
  try {
    const products = await Product.findAll();
    
    res.json({
      success: true,
      data: { products }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    let isWatched = false;
    if (req.user) {
      isWatched = await Portfolio.isInWatchlist(req.user.id, id);
    }

    res.json({
      success: true,
      data: { 
        product: {
          ...product,
          is_watched: isWatched
        }
      }
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const products = await Product.getByCategory(category);
    
    res.json({
      success: true,
      data: { products }
    });
  } catch (error) {
    console.error('Get products by category error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const searchProducts = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters long'
      });
    }

    const products = await Product.searchProducts(q.trim());
    
    res.json({
      success: true,
      data: { products }
    });
  } catch (error) {
    console.error('Search products error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const createProduct = async (req, res) => {
  try {
    const productData = req.body;
    const product = await Product.create(productData);
    
    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: { product }
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const updateProductPrice = async (req, res) => {
  try {
    const { id } = req.params;
    const { price } = req.body;
    
    if (!price || price <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid price is required'
      });
    }

    const product = await Product.updatePrice(id, price);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      message: 'Product price updated successfully',
      data: { product }
    });
  } catch (error) {
    console.error('Update product price error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  getProductsByCategory,
  searchProducts,
  createProduct,
  updateProductPrice
};
