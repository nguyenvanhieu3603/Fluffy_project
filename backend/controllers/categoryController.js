const Category = require('../models/categoryModel');
const slugify = require('slugify');

// @desc    Tạo danh mục mới (Admin)
// @route   POST /api/categories
// @access  Private/Admin
const createCategory = async (req, res) => {
  try {
    const { name, description, parentId } = req.body;

    const categoryExists = await Category.findOne({ name });
    if (categoryExists) {
      return res.status(400).json({ message: 'Tên danh mục đã tồn tại' });
    }

    const category = await Category.create({
      name,
      slug: slugify(name, { lower: true, locale: 'vi' }), // Tạo slug tiếng Việt: "Chó Cảnh" -> "cho-canh"
      description,
      parentId: parentId || null,
    });

    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Lấy tất cả danh mục (Hỗ trợ trả về dạng cây nếu cần)
// @route   GET /api/categories
// @access  Public
const getCategories = async (req, res) => {
  try {
    // Lấy tất cả và populate tên của danh mục cha (nếu có)
    const categories = await Category.find({ isActive: true })
      .populate('parentId', 'name')
      .sort({ createdAt: 1 }); // Sắp xếp theo thời gian tạo
    
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Cập nhật danh mục
// @route   PUT /api/categories/:id
// @access  Private/Admin
const updateCategory = async (req, res) => {
  try {
    const { name, description, parentId, isActive } = req.body;
    const category = await Category.findById(req.params.id);

    if (category) {
      category.name = name || category.name;
      if (name) {
        category.slug = slugify(name, { lower: true, locale: 'vi' });
      }
      category.description = description || category.description;
      category.parentId = parentId !== undefined ? parentId : category.parentId;
      category.isActive = isActive !== undefined ? isActive : category.isActive;

      const updatedCategory = await category.save();
      res.json(updatedCategory);
    } else {
      res.status(404).json({ message: 'Không tìm thấy danh mục' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Xóa danh mục
// @route   DELETE /api/categories/:id
// @access  Private/Admin
const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (category) {
      // Kiểm tra xem có danh mục con không trước khi xóa
      const children = await Category.findOne({ parentId: category._id });
      if (children) {
        return res.status(400).json({ message: 'Không thể xóa danh mục này vì còn chứa danh mục con.' });
      }
      
      await category.deleteOne();
      res.json({ message: 'Đã xóa danh mục' });
    } else {
      res.status(404).json({ message: 'Không tìm thấy danh mục' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
};