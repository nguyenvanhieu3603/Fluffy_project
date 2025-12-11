const express = require('express');
const router = express.Router();
const {
  addOrderItems,
  getOrderById,
  getMyOrders,
  cancelOrder,
  getSellerOrders,  // <-- Mới
  updateOrderStatus,
  getSellerStats,
  confirmReceived  // <-- Mới
} = require('../controllers/orderController');
const { protect, sellerOnly } = require('../middleware/authMiddleware');

router.post('/', protect, addOrderItems);
router.get('/myorders', protect, getMyOrders);

// Route cho Seller (Phải có quyền sellerOnly)
router.get('/seller-orders', protect, sellerOnly, getSellerOrders); 
router.get('/seller-stats', protect, sellerOnly, getSellerStats); // <-- Mới
router.put('/:id/status', protect, sellerOnly, updateOrderStatus);  // <-- Mới

// Lưu ý: Route /:id phải đặt cuối cùng để tránh trùng lặp
router.put('/:id/cancel', protect, cancelOrder);
router.get('/:id', protect, getOrderById);

// Route Khách xác nhận đã nhận hàng
router.put('/:id/received', protect, confirmReceived); 

module.exports = router;