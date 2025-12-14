const express = require('express');
const router = express.Router();
const { 
    getDashboardStats, 
    getUsersByRole, 
    getAllPetsAdmin,
    getAllAccessoriesAdmin,
    toggleUserStatus, // Sử dụng hàm mới
    getAllReviews,
    deleteReview,
    getAllReports,
    resolveReport,
    getAllOrders
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/stats', protect, adminOnly, getDashboardStats);
router.get('/users', protect, adminOnly, getUsersByRole);
router.get('/pets', protect, adminOnly, getAllPetsAdmin);
router.get('/accessories', protect, adminOnly, getAllAccessoriesAdmin);

// THAY ĐỔI: Chuyển từ DELETE sang PUT để khóa tài khoản
router.put('/users/:id/status', protect, adminOnly, toggleUserStatus);

// --- ORDERS MANAGEMENT ---
router.get('/orders', protect, adminOnly, getAllOrders);

// --- REVIEWS MANAGEMENT ---
router.get('/reviews', protect, adminOnly, getAllReviews);
router.delete('/reviews/:id', protect, adminOnly, deleteReview);

// --- REPORTS MANAGEMENT ---
router.get('/reports', protect, adminOnly, getAllReports);
router.put('/reports/:id/resolve', protect, adminOnly, resolveReport);

module.exports = router;