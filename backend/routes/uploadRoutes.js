const express = require('express');
const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const router = express.Router();
const path = require('path');

// Cấu hình Multer: Lưu tạm file vào bộ nhớ hoặc disk
const storage = multer.diskStorage({
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

// Kiểm tra loại file (chỉ cho phép ảnh)
function checkFileType(file, cb) {
  const filetypes = /jpg|jpeg|png/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb('Images only!');
  }
}

const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  }
});

// @desc    Upload ảnh lên Cloudinary
// @route   POST /api/upload
// @access  Public (Hoặc Private tùy bạn)
router.post('/', upload.single('image'), async (req, res) => {
  try {
    // req.file.path là đường dẫn file tạm multer vừa lưu
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'fluffy-petshop', // Tên folder trên Cloudinary
    });
    
    // Trả về URL ảnh
    res.json({
      url: result.secure_url,
      public_id: result.public_id
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Upload failed');
  }
});

module.exports = router;