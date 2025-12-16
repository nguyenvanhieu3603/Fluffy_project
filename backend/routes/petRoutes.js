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

// Create Pet (Có upload ảnh)
router.post('/', protect, sellerOnly, upload.fields([
    { name: 'images', maxCount: 5 },       
    { name: 'certification', maxCount: 1 } 
]), createPet); 

// Update Pet (Cũng cần upload middleware để đọc FormData, dù có up ảnh mới hay không)
router.put('/:id', protect, sellerOnly, upload.fields([
    { name: 'images', maxCount: 5 },       
    { name: 'certification', maxCount: 1 } 
]), updatePet);

router.delete('/:id', protect, sellerOnly, deletePet);

// --- ADMIN ACTION ---
router.put('/:id/health-check', protect, adminOnly, approveHealthCheck);

// --- DETAIL ROUTE ---
router.get('/:id', getPetById);

module.exports = router;