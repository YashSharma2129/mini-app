const pool = require('../config/database');
const { validateRequest, schemas } = require('../middleware/validation');
const { upload, handleUploadError } = require('../middleware/upload');

const submitKYC = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email, panNumber, address, phone } = req.body;
    const idImagePath = req.file ? req.file.path : null;

    const existingKYC = await pool.query(
      'SELECT id FROM kyc WHERE user_id = $1',
      [userId]
    );

    if (existingKYC.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'KYC already submitted'
      });
    }

    const query = `
      INSERT INTO kyc (user_id, name, email, pan_number, address, phone, id_image_path, status, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending', NOW())
      RETURNING *
    `;

    const values = [userId, name, email, panNumber, address, phone, idImagePath];
    const result = await pool.query(query, values);

    res.status(201).json({
      success: true,
      message: 'KYC submitted successfully',
      data: {
        kyc: {
          id: result.rows[0].id,
          name: result.rows[0].name,
          email: result.rows[0].email,
          pan_number: result.rows[0].pan_number,
          address: result.rows[0].address,
          phone: result.rows[0].phone,
          status: result.rows[0].status,
          created_at: result.rows[0].created_at
        }
      }
    });
  } catch (error) {
    console.error('KYC submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const getKYCStatus = async (req, res) => {
  try {
    const userId = req.user.id;

    const query = `
      SELECT id, name, email, pan_number, address, phone, status, created_at
      FROM kyc
      WHERE user_id = $1
    `;

    const result = await pool.query(query, [userId]);

    if (result.rows.length === 0) {
      return res.json({
        success: true,
        data: { kyc: null }
      });
    }

    res.json({
      success: true,
      data: { kyc: result.rows[0] }
    });
  } catch (error) {
    console.error('Get KYC status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const getAllKYC = async (req, res) => {
  try {
    const query = `
      SELECT k.*, u.name as user_name, u.email as user_email
      FROM kyc k
      JOIN users u ON k.user_id = u.id
      ORDER BY k.created_at DESC
    `;

    const result = await pool.query(query);

    res.json({
      success: true,
      data: { kycList: result.rows }
    });
  } catch (error) {
    console.error('Get all KYC error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const updateKYCStatus = async (req, res) => {
  try {
    const { kycId } = req.params;
    const { status } = req.body;

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be pending, approved, or rejected'
      });
    }

    const query = `
      UPDATE kyc
      SET status = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `;

    const result = await pool.query(query, [status, kycId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'KYC not found'
      });
    }

    res.json({
      success: true,
      message: 'KYC status updated successfully',
      data: { kyc: result.rows[0] }
    });
  } catch (error) {
    console.error('Update KYC status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  submitKYC: [
    upload.single('idImage'),
    handleUploadError,
    validateRequest(schemas.kyc),
    submitKYC
  ],
  getKYCStatus,
  getAllKYC,
  updateKYCStatus
};
