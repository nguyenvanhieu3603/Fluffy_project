const mongoose = require('mongoose');

const sellerInfoSchema = new mongoose.Schema({
  shopName: { type: String },
  shopDescription: { type: String },
  shopLogo: { type: String },
  shopAddress: { type: String },
  status: {
    type: String,
    enum: ['none', 'pending', 'approved', 'rejected'],
    default: 'none'
  }
}, { _id: false });

// Schema con cho Địa chỉ
const addressSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    isDefault: { type: Boolean, default: false }
});

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  phone: { type: String, default: '' },
  
  // Bạn có thể giữ field address cũ hoặc bỏ đi nếu chỉ dùng addresses
  address: { type: String, default: '' },
  
  // Sổ địa chỉ (Mới thêm)
  addresses: [addressSchema],

  // --- SỬA DÒNG NÀY ---
  // Đường dẫn ảnh mặc định trỏ vào thư mục uploads
  avatar: {
    type: String,
    default: '/uploads/default-avatar.jpg' 
  },
  // --------------------

  role: {
    type: String,
    enum: ['customer', 'seller', 'admin'],
    default: 'customer'
  },
  authProvider: {
    type: String,
    enum: ['local', 'google', 'facebook'],
    default: 'local'
  },
  authProviderId: { type: String },
  otp: String,
  otpExpires: Date,
  sellerInfo: sellerInfoSchema,
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date }
}, {
  timestamps: true
});

userSchema.index({ email: 1 });
userSchema.index({ role: 1 });

const User = mongoose.model('User', userSchema);

module.exports = User;