const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) {
          return res.status(401).json({ message: 'Tài khoản không tồn tại hoặc đã bị xóa.' });
      }
      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Token không hợp lệ, vui lòng đăng nhập lại' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Không có quyền truy cập, vui lòng đăng nhập' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Truy cập bị từ chối. Chỉ dành cho Admin.' });
  }
};

const sellerOnly = (req, res, next) => {
    if (req.user && (req.user.role === 'seller' || req.user.role === 'admin')) {
      next();
    } else {
      res.status(403).json({ message: 'Truy cập bị từ chối. Chỉ dành cho Người bán.' });
    }
  };

module.exports = { protect, adminOnly, sellerOnly };