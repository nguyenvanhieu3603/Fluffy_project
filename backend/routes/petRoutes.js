const express = require('express');
const router = express.Router();
const {
  getPets,
  getPetById,
  createPet,
  updatePet,
  deletePet,
  approveHealthCheck,
  getMyPets,
  getPendingPets 
} = require('../controllers/petController');
const { protect, sellerOnly, adminOnly } = require('../middleware/authMiddleware');
const { upload } = require('../config/uploadLocal'); 

// --- PUBLIC ROUTES ---
router.get('/', getPets);

// --- ADMIN ROUTES ---
router.get('/admin/pending', protect, adminOnly, getPendingPets);

// --- SELLER ROUTES ---
router.get('/my-pets', protect, sellerOnly, getMyPets); 


router.post('/', protect, sellerOnly, upload.fields([
    { name: 'images', maxCount: 5 },       // Tối đa 5 ảnh sản phẩm
    { name: 'certification', maxCount: 1 } // Tối đa 1 ảnh chứng nhận
]), createPet); 

router.put('/:id', protect, sellerOnly, updatePet);
router.delete('/:id', protect, sellerOnly, deletePet);

// --- ADMIN ACTION ---
router.put('/:id/health-check', protect, adminOnly, approveHealthCheck);

// --- DETAIL ROUTE ---
router.get('/:id', getPetById);

module.exports = router;