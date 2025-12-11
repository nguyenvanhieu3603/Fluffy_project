const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUserProfile,
  forgotPassword,
  resetPassword,
  registerSeller,
  getSellerRequests,
  approveSeller,
  addAddress,
  getAddresses,
  updateUserProfile,
  deleteAddress,
  getSellerById
} = require('../controllers/userController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// --- QUAN TRỌNG: Dùng config upload Local ---
// Hãy chắc chắn file uploadLocal.js đã tồn tại trong thư mục config
const { upload } = require('../config/uploadLocal'); 

// Public Routes
router.post('/register', registerUser);
router.post('/login', loginUser);
//router.post('/social-login', socialLogin);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Private Routes (User Profile)
router.route('/profile')
    .get(protect, getUserProfile)
    // --- QUAN TRỌNG: Phải có dòng này để đọc file ảnh gửi lên ---
    .put(protect, upload.single('avatar'), updateUserProfile);

// Address Routes
router.route('/address')
    .post(protect, addAddress)
    .get(protect, getAddresses);

router.delete('/address/:id', protect, deleteAddress);

// Seller & Admin Routes
router.post('/seller-register', protect, registerSeller);
router.get('/seller-requests', protect, adminOnly, getSellerRequests);
router.put('/:id/approve-seller', protect, adminOnly, approveSeller);

router.get('/seller/:id', getSellerById);

module.exports = router;