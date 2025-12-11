const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  orderItems: [{
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    image: { type: String, required: true },
    price: { type: Number, required: true },
    pet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pet',
      required: true
    },
    totalItemPrice: { type: Number, required: true }
  }],
  shippingInfo: {
    fullName: { type: String, required: true },
    address: { type: String, required: true },
    phone: { type: String, required: true }
  },
  paymentMethod: {
    type: String,
    required: true,
    default: 'COD'
  },
  prices: {
    itemsPrice: { type: Number, required: true, default: 0 },
    shippingPrice: { type: Number, required: true, default: 0 },
    discountPrice: { type: Number, required: true, default: 0 },
    totalPrice: { type: Number, required: true, default: 0 }
  },
  coupon: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Coupon'
  },
  status: {
    type: String,
    // --- THÊM 'completed' VÀO ĐÂY ---
    enum: ['pending', 'confirmed', 'shipping', 'delivered', 'completed', 'cancelled', 'reported'],
    default: 'pending'
  },
  trackingNumber: { type: String },
  
  deliveredAt: Date,
  cancelledAt: Date,
  completedAt: Date // Thêm trường này để lưu ngày khách xác nhận
}, {
  timestamps: true
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;