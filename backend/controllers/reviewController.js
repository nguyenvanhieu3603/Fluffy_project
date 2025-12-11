const Review = require('../models/reviewModel');
const Order = require('../models/orderModel');
const Pet = require('../models/petModel');

// @desc    Lấy danh sách đánh giá của 1 sản phẩm
// @route   GET /api/reviews/:petId
// @access  Public
const getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ pet: req.params.petId })
      .populate('customer', 'fullName avatar')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Tạo đánh giá mới
// @route   POST /api/reviews/:petId
// @access  Private
const createReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const petId = req.params.petId;
    const userId = req.user._id;

    // 1. Kiểm tra xem đã đánh giá chưa
    const alreadyReviewed = await Review.findOne({
      pet: petId,
      customer: userId
    });

    if (alreadyReviewed) {
      return res.status(400).json({ message: 'Bạn đã đánh giá sản phẩm này rồi' });
    }

    // 2. Kiểm tra xem đã mua hàng chưa (để gắn nhãn Verified)
    // Tìm đơn hàng của user này, có chứa petId và trạng thái là 'completed' hoặc 'delivered'
    const order = await Order.findOne({
      customer: userId,
      'orderItems.pet': petId,
      status: { $in: ['delivered', 'completed'] }
    });

    const review = new Review({
      pet: petId,
      customer: userId,
      rating: Number(rating),
      comment,
      isVerified: !!order // True nếu tìm thấy đơn hàng
    });

    await review.save();

    res.status(201).json({ message: 'Đánh giá đã được gửi' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getProductReviews,
  createReview
};