const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');

// --- Helper Functions ---

// Hàm tạo JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d', // Token sống 30 ngày
  });
};

// --- Authentication Controllers ---

// @desc    Đăng ký tài khoản mới
// @route   POST /api/users/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    // Kiểm tra user tồn tại
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Email này đã được sử dụng' });
    }

    // Mã hóa mật khẩu
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Tạo user
    const user = await User.create({
      fullName,
      email,
      password: hashedPassword,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Dữ liệu người dùng không hợp lệ' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Đăng nhập & Lấy token
// @route   POST /api/users/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Tìm user
    const user = await User.findOne({ email });

    // Kiểm tra pass
    if (user && (await bcrypt.compare(password, user.password))) {
      // Cập nhật lần đăng nhập cuối
      user.lastLogin = Date.now();
      await user.save();

      res.json({
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        sellerInfo: user.sellerInfo, // Trả về thông tin shop nếu có
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Lấy thông tin profile người dùng hiện tại
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
  // req.user đã được middleware 'protect' gắn vào
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      phone: user.phone,
      address: user.address,
      avatar: user.avatar,
      sellerInfo: user.sellerInfo
    });
  } else {
    res.status(404).json({ message: 'Không tìm thấy người dùng' });
  }
};

// --- Password Reset Controllers ---

// @desc    Quên mật khẩu - Gửi OTP qua email
// @route   POST /api/users/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy tài khoản với email này' });
    }

    // Tạo OTP ngẫu nhiên 6 số
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Lưu OTP và thời gian hết hạn (10 phút) vào DB
    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000; // 10 phút
    await user.save();

    // Gửi email
    const message = `Mã xác thực (OTP) để đặt lại mật khẩu của bạn là: ${otp}\nMã này sẽ hết hạn sau 10 phút.`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Fluffy Shop - Mã OTP đặt lại mật khẩu',
        message,
      });

      res.status(200).json({ message: 'Đã gửi mã OTP đến email của bạn' });
    } catch (error) {
      user.otp = undefined;
      user.otpExpires = undefined;
      await user.save();
      return res.status(500).json({ message: 'Không thể gửi email, vui lòng thử lại sau' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Đặt lại mật khẩu mới (Reset Password)
// @route   POST /api/users/reset-password
// @access  Public
const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    // Tìm user có email đó, otp đó và otp chưa hết hạn ($gt: lớn hơn)
    const user = await User.findOne({
      email,
      otp,
      otpExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Mã OTP không đúng hoặc đã hết hạn' });
    }

    // Mã hóa mật khẩu mới
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    // Xóa OTP
    user.otp = undefined;
    user.otpExpires = undefined;

    await user.save();

    res.status(200).json({ message: 'Đặt lại mật khẩu thành công! Bạn có thể đăng nhập ngay.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- Seller Management Controllers (NEW) ---

// @desc    Gửi yêu cầu trở thành Seller
// @route   POST /api/users/seller-register
// @access  Private
const registerSeller = async (req, res) => {
  try {
    const { shopName, shopAddress, shopDescription } = req.body;
    
    // Tìm user đang đăng nhập
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'Người dùng không tồn tại' });
    }

    // Cập nhật thông tin sellerInfo
    user.sellerInfo = {
      shopName,
      shopAddress,
      shopDescription,
      status: 'pending' // Chuyển trạng thái sang chờ duyệt
    };

    await user.save();

    res.status(200).json({ 
      message: 'Đã gửi yêu cầu đăng ký thành công! Vui lòng chờ Admin xét duyệt.',
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        sellerInfo: user.sellerInfo
      }
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Lấy danh sách các yêu cầu làm Seller (Admin)
// @route   GET /api/users/seller-requests
// @access  Private/Admin
const getSellerRequests = async (req, res) => {
  try {
    // Tìm các user có sellerInfo.status là 'pending'
    const users = await User.find({ 'sellerInfo.status': 'pending' })
      .select('fullName email sellerInfo createdAt'); // Chỉ lấy các trường cần thiết
    
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Duyệt yêu cầu làm Seller (Admin)
// @route   PUT /api/users/:id/approve-seller
// @access  Private/Admin
const approveSeller = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    // Nâng cấp user
    user.role = 'seller'; // Đổi role thành seller
    user.sellerInfo.status = 'approved'; // Đổi trạng thái duyệt
    
    await user.save();

    res.json({ message: `Đã duyệt user ${user.fullName} trở thành Người bán!` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Thêm địa chỉ giao hàng mới
// @route   POST /api/users/address
// @access  Private
const addAddress = async (req, res) => {
    try {
        const { fullName, phone, address, isDefault } = req.body;
        const user = await User.findById(req.user._id);

        if (user) {
            const newAddress = { fullName, phone, address, isDefault };

            // Nếu là địa chỉ mặc định, set các cái cũ thành false
            if (isDefault) {
                user.addresses.forEach(addr => addr.isDefault = false);
            }

            user.addresses.push(newAddress);
            await user.save();

            res.json(user.addresses);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Lấy danh sách địa chỉ
// @route   GET /api/users/address
// @access  Private
const getAddresses = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        res.json(user.addresses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}


// @desc    Cập nhật hồ sơ người dùng
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    // --- DEBUG LOG ---
    console.log("--- DEBUG UPDATE PROFILE ---");
    console.log("Body:", req.body); // Xem text gửi lên
    console.log("File:", req.file); // Xem file gửi lên (Nếu undefined là lỗi do Route)
    // -----------------

    const user = await User.findById(req.user._id);

    if (user) {
      user.fullName = req.body.fullName || user.fullName;
      user.phone = req.body.phone || user.phone;

      // Logic lưu ảnh Local
      if (req.file) {
          // Lưu đường dẫn tương đối (Ví dụ: /uploads/img-123.jpg)
          user.avatar = `/uploads/${req.file.filename}`;
          console.log("Đã cập nhật Avatar mới:", user.avatar);
      }

      if (req.body.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(req.body.password, salt);
      }

      const updatedUser = await user.save();

      // Tạo token mới để frontend cập nhật lại thông tin ngay lập tức
      const token = jwt.sign({ id: updatedUser._id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
      });

      res.json({
        _id: updatedUser._id,
        fullName: updatedUser.fullName,
        email: updatedUser.email,
        role: updatedUser.role,
        phone: updatedUser.phone,
        address: updatedUser.address,
        avatar: updatedUser.avatar,
        sellerInfo: updatedUser.sellerInfo,
        token: token,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error("Update Error:", error);
    res.status(500).json({ message: error.message });
  }
};


// @desc    Xóa một địa chỉ trong sổ địa chỉ
// @route   DELETE /api/users/address/:id
// @access  Private
const deleteAddress = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (user) {
            // Lọc bỏ địa chỉ có _id trùng với params.id
            user.addresses = user.addresses.filter(addr => addr._id.toString() !== req.params.id);
            await user.save();
            res.json(user.addresses);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// @desc    Lấy thông tin công khai của Seller (Cho khách xem Shop)
// @route   GET /api/users/seller/:id
// @access  Public
const getSellerById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password -otp -otpExpires -authProviderId');

    if (user && (user.role === 'seller' || user.role === 'admin')) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'Không tìm thấy Người bán này' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  forgotPassword,
  resetPassword,
  registerSeller,
  getSellerRequests,
  approveSeller,
  addAddress,
  getAddresses,
  updateUserProfile,
  deleteAddress,
  // socialLogin,
  getSellerById // <-- MỚI THÊM
};