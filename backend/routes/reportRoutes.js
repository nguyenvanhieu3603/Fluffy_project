

const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/authMiddleware');

// --- Customer Route ---

// [POST] /api/v1/reports
// Tạo khiếu nại mới
router.post('/', protect, reportController.createReport);


// --- Admin Routes ---

// [GET] /api/v1/reports
// Lấy danh sách khiếu nại (mặc định là 'pending')
router.get(
  '/',
  protect,
  authorize('admin'),
  reportController.getAllReports
);

// [PUT] /api/v1/reports/:id/resolve
// Admin giải quyết khiếu nại
router.put(
  '/:id/resolve',
  protect,
  authorize('admin'),
  reportController.resolveReport
);

module.exports = router;