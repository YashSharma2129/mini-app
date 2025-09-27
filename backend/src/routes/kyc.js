const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middleware/auth');
const {
  submitKYC,
  getKYCStatus,
  getAllKYC,
  updateKYCStatus
} = require('../controllers/kycController');

router.post('/submit', authenticateToken, submitKYC);
router.get('/status', authenticateToken, getKYCStatus);

router.get('/all', authenticateToken, requireRole(['admin']), getAllKYC);
router.put('/:kycId/status', authenticateToken, requireRole(['admin']), updateKYCStatus);

module.exports = router;
