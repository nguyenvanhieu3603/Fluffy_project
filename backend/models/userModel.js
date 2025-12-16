const mongoose = require('mongoose');


const addressSchema = new mongoose.Schema({
  province: { type: String, default: '' }, // Tỉnh/Thành phố
  district: { type: String, default: '' }, // Quận/Huyện
  ward: { type: String, default: '' },     // Phường/Xã
  specificAddress: { type: String, default: '' }, // Số nhà, tên đường
  // Giữ lại trường address cũ (nếu cần) để tránh mất dữ liệu cũ
  address: { type: String }, 
  isDefault: { type: Boolean, default: false }
});

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Vui lòng nhập họ tên'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Vui lòng nhập email'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Vui lòng nhập mật khẩu'],
    minlength: 6
  },
  phone: {
    type: String,
    default: ''
  },
  avatar: {
    type: String,
    default: '' 
  },
  role: {
    type: String,
    enum: ['customer', 'seller', 'admin'],
    default: 'customer'
  },
  // Mảng chứa danh sách địa chỉ giao hàng
  addresses: [addressSchema],
  
  // Thông tin shop (nếu là seller)
  sellerInfo: {
    shopName: { type: String },
    shopAddress: { type: String },
    shopDescription: { type: String },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    }
  },
  
  // Các trường phục vụ reset password
  otp: String,
  otpExpires: Date,
  
  lastLogin: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const User = mongoose.model('User', userSchema);

module.exports = User;