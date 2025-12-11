

const express = require('express');
const router = express.Router();
const couponController = require('../controllers/couponController');
const { protect, authorize } = require('../middleware/authMiddleware');

// --- Customer Route ---

// [POST] /api/v1/coupons/validate
// (Customer dùng để check mã khi checkout)
router.post('/validate', protect, couponController.validateCoupon);


// --- Admin Routes (CRUD) ---
// (Các API bên dưới yêu cầu phải là Admin)

// [GET] /api/v1/coupons
router.get(
  '/',
  protect,
  authorize('admin'),
  couponController.getAllCoupons
);

// [POST] /api/v1/coupons
router.post(
  '/',
  protect,
  authorize('admin'),
  couponController.createCoupon
);

// [PUT] /api/v1/coupons/:id
router.put(
  '/:id',
  protect,
  authorize('admin'),
  couponController.updateCoupon
);

// [DELETE] /api/v1/coupons/:id
router.delete(
  '/:id',
  protect,
  authorize('admin'),
  couponController.deleteCoupon
);

module.exports = router;