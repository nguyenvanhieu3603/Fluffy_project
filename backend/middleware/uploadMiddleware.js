const multer = require('multer');

// Cấu hình lưu trữ file trên RAM (memoryStorage)

const storage = multer.memoryStorage(); 

// Hàm lọc file (chỉ chấp nhận ảnh)
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Chỉ cho phép tải lên file ảnh'), false);
  }
};

// Khởi tạo multer (chấp nhận 5 file ảnh, mỗi file tối đa 5MB)
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 5, // 5MB
  },
});



module.exports = upload;