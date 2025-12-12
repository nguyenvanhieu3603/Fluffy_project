// backend/models/blogModel.js
const mongoose = require('mongoose');
const slugify = require('slugify');

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Vui lòng nhập tiêu đề bài viết'],
    trim: true
  },
  slug: {
    type: String,
    unique: true,
    index: true
  },
  image: {
    type: String,
    required: [true, 'Vui lòng chọn ảnh đại diện cho bài viết']
  },
  author: {
    type: String,
    default: 'Admin' 
  },
  excerpt: {
    type: String,
    required: [true, 'Vui lòng nhập tóm tắt ngắn'],
    maxLength: 300
  },
  content: {
    type: String, // Lưu HTML content
    required: [true, 'Vui lòng nhập nội dung bài viết']
  },
  views: {
    type: Number,
    default: 0
  },
  isVisible: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true // Tự động tạo createdAt, updatedAt
});

// Middleware: Tự động tạo slug từ title trước khi lưu
blogSchema.pre('save', function(next) {
  if (this.isModified('title')) {
    this.slug = slugify(this.title, { lower: true, locale: 'vi' }) + '-' + Date.now();
  }
  next();
});

const Blog = mongoose.model('Blog', blogSchema);
module.exports = Blog;