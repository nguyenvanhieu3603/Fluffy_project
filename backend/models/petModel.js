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
    type: String, // Lưu URL ảnh từ Cloudinary/Local
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
  
  // --- THÔNG TIN ĐẶC THÙ CỦA THÚ CƯNG ---
  age: { type: String },
  gender: { 
    type: String, 
    enum: ['Đực', 'Cái', 'Không xác định'] 
  },
  breed: { type: String },
  color: { type: String, trim: true }, // Mới: Màu sắc
  weight: { type: String },            // Mới: Cân nặng
  length: { type: String },            // Mới: Chiều dài
  
  // Phân loại Pet/Accessory
  type: {
    type: String,
    enum: ['pet', 'accessory'],
    default: 'pet'
  },

  location: locationSchema,
  healthInfo: healthInfoSchema,
  
  // Quy trình duyệt sức khỏe
  healthStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'not_required'],
    default: 'pending' 
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
petSchema.index({ name: 'text', color: 'text' }); // Index tìm kiếm text

const Pet = mongoose.model('Pet', petSchema);

module.exports = Pet;