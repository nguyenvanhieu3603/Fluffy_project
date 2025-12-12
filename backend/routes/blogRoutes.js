// backend/routes/blogRoutes.js
const express = require('express');
const router = express.Router();
const { getBlogs, getBlogDetail, createBlog, updateBlog, deleteBlog } = require('../controllers/blogController');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { upload } = require('../config/uploadLocal');

// Public Routes
router.get('/', getBlogs);
router.get('/:idOrSlug', getBlogDetail);

// Admin Routes
router.post('/', protect, adminOnly, upload.single('image'), createBlog);
router.put('/:id', protect, adminOnly, upload.single('image'), updateBlog);
router.delete('/:id', protect, adminOnly, deleteBlog);

module.exports = router;