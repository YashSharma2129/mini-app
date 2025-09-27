const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middleware/auth');
const {
  getAllProducts,
  getProductById,
  getProductsByCategory,
  searchProducts,
  createProduct,
  updateProductPrice
} = require('../controllers/productController');

router.get('/', getAllProducts);
router.get('/search', searchProducts);
router.get('/category/:category', getProductsByCategory);
router.get('/:id', getProductById);

router.post('/', authenticateToken, requireRole(['admin']), createProduct);
router.put('/:id/price', authenticateToken, requireRole(['admin']), updateProductPrice);

module.exports = router;
