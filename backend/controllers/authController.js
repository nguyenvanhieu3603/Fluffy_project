const User = require('../models/User.js'); 
const jwt = require('jsonwebtoken'); 
const sendEmail = require('../utils/sendEmail');

const generateToken = (userId) => {
  return jwt.sign(
    { id: userId }, 
    process.env.JWT_SECRET, 
    {
      expiresIn: process.env.JWT_EXPIRES_IN, 
    }
  );
};


exports.registerUser = async (req, res) => {
  try {
    
    const { fullName, email, password } = req.body;

    
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: 'Vui lòng cung cấp đủ thông tin' });
    }

   
    const userExists = await User.findOne({ email: email });
    if (userExists) {
      return res.status(400).json({ message: 'Email này đã được sử dụng' });
    }

    
    const newUser = await User.create({
      fullName: fullName,
      email: email,
      password: password,
      
    });

   
    if (newUser) {
      const token = generateToken(newUser._id);

      res.status(201).json({
        message: 'Tạo tài khoản thành công',
        token: token,
        user: {
          _id: newUser._id,
          fullName: newUser.fullName,
          email: newUser.email,
          role: newUser.role,
        },
      });
    } else {
      return res.status(400).json({ message: 'Dữ liệu không hợp lệ' });
    }
  } catch (error) {
    console.error('Lỗi khi đăng ký:', error.message);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};

exports.loginUser = async (req, res) => {
  try {
    
    const { email, password } = req.body;

    
    if (!email || !password) {
      return res.status(400).json({ message: 'Vui lòng cung cấp email và mật khẩu' });
    }


    const user = await User.findOne({ email: email }).select('+password');

    
    if (user && (await user.matchPassword(password))) {
      
      
      if (!user.isActive) {
        return res.status(403).json({ message: 'Tài khoản của bạn đã bị khóa' });
      }

      
      user.lastLogin = Date.now();
      await user.save();

      
      const token = generateToken(user._id);

      res.status(200).json({
        message: 'Đăng nhập thành công',
        token: token,
        user: {
          _id: user._id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
        },
      });
      
    } else {
      
      return res.status(401).json({ message: 'Email hoặc mật khẩu không chính xác' });
    }
  } catch (error) {
    console.error('Lỗi khi đăng nhập:', error.message);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};

exports.forgotPassword = async (req, res) => {
  let user; 

  try {
   
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Vui lòng cung cấp email' });
    }

    
    user = await User.findOne({ email: email }); 
    if (!user) {
      return res.status(200).json({
        message: 'Nếu email tồn tại, bạn sẽ nhận được một mã OTP',
      });
    }

    
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    
    const otpExpires = Date.now() + 10 * 60 * 1000;

    
    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    
    const message = `<p>Mã OTP để đặt lại mật khẩu của bạn là:</p>
                     <h1 style="font-size: 24px; font-weight: bold;">${otp}</h1>
                     <p>Mã này sẽ hết hạn sau 10 phút.</p>`;

    await sendEmail({
      email: user.email,
      subject: 'Yêu cầu Đặt lại Mật khẩu (Pet Shop)',
      message: message,
    });

    res.status(200).json({
      message:
        'Mã OTP đã được gửi. Vui lòng kiểm tra email (và console của server để xem link Ethereal).',
    });
  } catch (error) {
    console.error('Lỗi khi quên mật khẩu:', error.message);

    
    if (user) {
      user.otp = undefined;
      user.otpExpires = undefined;
      await user.save();
    }
    
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: 'Vui lòng cung cấp đủ thông tin (email, otp, newPassword)' });
    }

    
    const user = await User.findOne({
      email: email,
      otp: otp,
      otpExpires: { $gt: Date.now() }, 
    });

    
    if (!user) {
      return res.status(400).json({ message: 'Mã OTP không hợp lệ hoặc đã hết hạn.' });
    }

    
    user.password = newPassword; 
    
    
    user.otp = undefined;
    user.otpExpires = undefined;

    
    await user.save();

    
    const token = generateToken(user._id);

    res.status(200).json({
      message: 'Mật khẩu đã được đặt lại thành công.',
      token: token,
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {
    console.error('Lỗi khi reset mật khẩu:', error.message);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};