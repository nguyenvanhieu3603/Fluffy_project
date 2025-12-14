const mongoose = require('mongoose');

// Schema con cho Vị trí
const locationSchema = new mongoose.Schema({
  city: { type: String },
  district: { type: String }
}, { _id: false });

// Schema con cho Thông tin sức khỏe
const healthInfoSchema = new mongoose.Schema({
  vaccinationCertificate: { type: String }, 
  microchipId: { type: String },
  otherDocuments: [{ type: String }] 
}, { _id: false });

const petSchema = new mongoose.Schema({
  // --- QUAN TRỌNG: PHÂN LOẠI SẢN PHẨM ---
  type: {
    type: String,
    enum: ['pet', 'accessory'],
    required: true,
    default: 'pet' // Mặc định là pet để tương thích dữ liệu cũ
  },

  name: {
    type: String,
    required: [true, 'Vui lòng nhập tên sản phẩm'],
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
    type: String, 
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
    ref: 'User',
    required: true
  },

  // --- CÁC TRƯỜNG DÀNH RIÊNG CHO THÚ CƯNG (Không bắt buộc) ---
  age: { type: String },
  gender: { 
    type: String, 
    enum: ['Đực', 'Cái', 'Không xác định'] 
  },
  breed: { type: String },
  weight: { type: String }, 
  length: { type: String }, 

  location: locationSchema,
  healthInfo: healthInfoSchema,
  
  // Quy trình duyệt sức khỏe (Chỉ áp dụng cho type='pet')
  healthStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'not_required'], // Thêm 'not_required' cho phụ kiện
    default: 'pending'
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
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

// Index nâng cao
petSchema.index({ type: 1, status: 1 }); // Lọc nhanh theo loại
petSchema.index({ category: 1 });
petSchema.index({ 'location.city': 1 });

const Pet = mongoose.model('Pet', petSchema);

module.exports = Pet;