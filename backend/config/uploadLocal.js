const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 1. Xác định đường dẫn tuyệt đối đến thư mục uploads (nằm ở backend/uploads)
const uploadDir = path.join(__dirname, '../uploads');

// 2. Tự động tạo thư mục nếu chưa tồn tại (Tránh crash server)
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log(`Đã tạo thư mục lưu ảnh tại: ${uploadDir}`);
}

// 3. Cấu hình nơi lưu
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadDir);
  },
  filename(req, file, cb) {
    // Đặt tên file ngẫu nhiên để tránh trùng
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'img-' + uniqueSuffix + path.extname(file.originalname));
  },
});

// 4. Lọc chỉ cho phép file ảnh
function checkFileType(file, cb) {
  const filetypes = /jpg|jpeg|png|webp|gif/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Chỉ được upload file ảnh (jpg, jpeg, png, webp)!'));
  }
}

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Giới hạn 5MB
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

module.exports = { upload };