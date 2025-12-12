// backend/controllers/blogController.js
const Blog = require('../models/blogModel');

// @desc    Lấy danh sách bài viết (Public)
// @route   GET /api/blogs
const getBlogs = async (req, res) => {
  try {
    // Nếu là admin (có gửi token admin) thì lấy hết, nếu khách thì chỉ lấy bài hiện
    const filter = req.query.isAdmin ? {} : { isVisible: true };
    const blogs = await Blog.find(filter).sort({ createdAt: -1 });
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Lấy chi tiết 1 bài viết theo Slug hoặc ID (Public)
// @route   GET /api/blogs/:idOrSlug
const getBlogDetail = async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    // Kiểm tra xem param là ID hay Slug
    const isId = idOrSlug.match(/^[0-9a-fA-F]{24}$/);
    
    const query = isId ? { _id: idOrSlug } : { slug: idOrSlug };
    const blog = await Blog.findOne(query);

    if (blog) {
      // Tăng view
      blog.views += 1;
      await blog.save({ validateBeforeSave: false }); // Bỏ qua validate slug khi update view
      res.json(blog);
    } else {
      res.status(404).json({ message: 'Bài viết không tồn tại' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Tạo bài viết mới (Admin)
// @route   POST /api/blogs
const createBlog = async (req, res) => {
  try {
    const { title, excerpt, content, isVisible } = req.body;
    // Xử lý ảnh (nếu dùng multer uploadLocal giống Pet)
    let image = '';
    if (req.file) {
        image = `/uploads/${req.file.filename}`;
    }

    const blog = new Blog({
      title,
      image,
      excerpt,
      content,
      author: req.user.fullName || 'Admin', // Lấy tên người tạo
      isVisible: isVisible === 'true' || isVisible === true
    });

    const createdBlog = await blog.save();
    res.status(201).json(createdBlog);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Cập nhật bài viết (Admin)
// @route   PUT /api/blogs/:id
const updateBlog = async (req, res) => {
  try {
    const { title, excerpt, content, isVisible } = req.body;
    const blog = await Blog.findById(req.params.id);

    if (blog) {
      blog.title = title || blog.title;
      blog.excerpt = excerpt || blog.excerpt;
      blog.content = content || blog.content;
      if (isVisible !== undefined) blog.isVisible = isVisible;

      if (req.file) {
        blog.image = `/uploads/${req.file.filename}`;
      }

      // Nếu đổi tiêu đề thì slug sẽ tự đổi nhờ middleware trong model
      const updatedBlog = await blog.save();
      res.json(updatedBlog);
    } else {
      res.status(404).json({ message: 'Không tìm thấy bài viết' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Xóa bài viết (Admin)
// @route   DELETE /api/blogs/:id
const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (blog) {
      await blog.deleteOne();
      res.json({ message: 'Đã xóa bài viết' });
    } else {
      res.status(404).json({ message: 'Không tìm thấy bài viết' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getBlogs, getBlogDetail, createBlog, updateBlog, deleteBlog };