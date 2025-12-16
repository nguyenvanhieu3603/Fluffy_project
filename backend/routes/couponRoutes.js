const express = require('express');
const router = express.Router();
const couponController = require('../controllers/couponController');
// Sửa 'authorize' thành 'adminOnly' để đồng bộ với các route khác
const { protect, adminOnly } = require('../middleware/authMiddleware');

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
  adminOnly, // Sử dụng adminOnly thay vì authorize('admin')
  couponController.getAllCoupons
);

// [POST] /api/v1/coupons
router.post(
  '/',
  protect,
  adminOnly,
  couponController.createCoupon
);

// [PUT] /api/v1/coupons/:id
router.put(
  '/:id',
  protect,
  adminOnly,
  couponController.updateCoupon
);

// [DELETE] /api/v1/coupons/:id
router.delete(
  '/:id',
  protect,
  adminOnly,
  couponController.deleteCoupon
);

module.exports = router;