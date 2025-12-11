const express = require('express');
const router = express.Router();
const { getProductReviews, createReview } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

router.route('/:petId')
  .get(getProductReviews)
  .post(protect, createReview);

module.exports = router;