const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  customer: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User' 
  },
  seller: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User' 
  },
  orderItems: [
    {
      name: { type: String, required: true },
      quantity: { type: Number, required: true },
      image: { type: String, required: true },
      price: { type: Number, required: true },
      pet: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Pet',
      },
    },
  ],
  shippingInfo: {
    fullName: { type: String, required: true },
    address: { type: String, required: true },
    phone: { type: String, required: true },
  },
  paymentMethod: {
    type: String,
    required: true,
  },
  paymentResult: {
    id: { type: String },
    status: { type: String },
    update_time: { type: String },
    email_address: { type: String },
  },
  
  // --- THÊM PHẦN NÀY CHO COUPON ---
  coupon: {
      code: { type: String },
      discount: { type: Number, default: 0 }
  },
  // --------------------------------

  prices: {
      itemsPrice: { type: Number, required: true, default: 0.0 },
      shippingPrice: { type: Number, required: true, default: 0.0 },
      totalPrice: { type: Number, required: true, default: 0.0 },
  },
  
  isPaid: {
    type: Boolean,
    required: true,
    default: false,
  },
  paidAt: {
    type: Date,
  },
  status: {
      type: String,
      enum: ['pending', 'confirmed', 'shipping', 'delivered', 'completed', 'cancelled'],
      default: 'pending'
  },
  deliveredAt: {
    type: Date,
  },
  completedAt: {
      type: Date
  },
  cancelledAt: {
      type: Date
  }
}, {
  timestamps: true,
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;