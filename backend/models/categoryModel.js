const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Vui lòng nhập tên danh mục'],
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true, // Đảm bảo URL không trùng lặp (ví dụ: cho-corgi)
    lowercase: true
  },
  description: {
    type: String
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category', // Tham chiếu đến chính nó để làm danh mục cha-con
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;