const mongoose = require('mongoose');

// Schema con cho Vị trí
const locationSchema = new mongoose.Schema({
  city: { type: String },
  district: { type: String }
}, { _id: false });

// Schema con cho Thông tin sức khỏe
const healthInfoSchema = new mongoose.Schema({
  vaccinationCertificate: { type: String }, // Ảnh sổ tiêm chủng
  microchipId: { type: String },
  otherDocuments: [{ type: String }] // Mảng các ảnh giấy tờ khác
}, { _id: false });

const petSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Vui lòng nhập tên thú cưng'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Vui lòng nhập mô tả']
  },
  price: {
    type: Number,
    required: [true, 'Vui lòng nhập giá bán'],
    min: 0
  },
  images: [{
    type: String, // Lưu URL ảnh từ Cloudinary
    required: true
  }],
  stock: {
    type: Number,
    required: true,
    default: 1
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Liên kết với người bán
    required: true
  },
  // Các thông tin đặc thù của thú cưng
  age: { type: String },
  gender: { 
    type: String, 
    enum: ['Đực', 'Cái', 'Không xác định'] 
  },
  breed: { type: String },
  
  location: locationSchema,
  healthInfo: healthInfoSchema,
  
  // Quy trình duyệt sức khỏe
  healthStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending' // Mặc định chờ Admin duyệt giấy tờ
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' // Admin nào đã duyệt
  },
  
  // Trạng thái hiển thị bán
  status: {
    type: String,
    enum: ['available', 'sold_out', 'hidden'],
    default: 'available'
  },
  views: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index để lọc sản phẩm nhanh hơn
petSchema.index({ category: 1, status: 1 });
petSchema.index({ 'location.city': 1 });

const Pet = mongoose.model('Pet', petSchema);

module.exports = Pet;