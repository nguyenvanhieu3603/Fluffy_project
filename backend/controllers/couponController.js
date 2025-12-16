const Coupon = require('../models/couponModel'); // Đã sửa tên file cho đúng

// Logic TẠO MÃ GIẢM GIÁ (POST /api/v1/coupons)
// Yêu cầu: Admin
exports.createCoupon = async (req, res) => {
  try {
    const {
      code,
      discountType,
      discountValue,
      expiryDate,
      usageLimit,
      minOrderValue,
      isActive,
    } = req.body;

    // Kiểm tra code đã tồn tại chưa
    const codeExists = await Coupon.findOne({ code: code.toUpperCase() });
    if (codeExists) {
      return res.status(400).json({ message: 'Mã (code) này đã tồn tại' });
    }

    const coupon = await Coupon.create({
      code,
      discountType,
      discountValue,
      expiryDate,
      usageLimit,
      minOrderValue,
      isActive,
    });

    res.status(201).json({
      success: true,
      message: 'Tạo mã giảm giá thành công',
      coupon,
    });
  } catch (error) {
    console.error('Lỗi khi tạo coupon:', error.message);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};

// Logic LẤY TẤT CẢ MÃ 
// Yêu cầu: Admin
exports.getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find({});
    res.status(200).json({
      success: true,
      count: coupons.length,
      coupons,
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};

// Logic CẬP NHẬT MÃ 
// Yêu cầu: Admin
exports.updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const coupon = await Coupon.findByIdAndUpdate(id, req.body, {
      new: true, 
      runValidators: true, 
    });

    if (!coupon) {
      return res.status(404).json({ message: 'Không tìm thấy mã giảm giá' });
    }
    res.status(200).json({
      success: true,
      message: 'Cập nhật thành công',
      coupon,
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};

// Logic XÓA MÃ 
// Yêu cầu: Admin
exports.deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const coupon = await Coupon.findById(id);

    if (!coupon) {
      return res.status(404).json({ message: 'Không tìm thấy mã giảm giá' });
    }
    await coupon.deleteOne();
    res.status(200).json({
      success: true,
      message: 'Xóa mã giảm giá thành công',
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};


// --- CUSTOMER CONTROLLER ---

// Logic KIỂM TRA MÃ (Validate) 
// Yêu cầu: Customer (đã đăng nhập)
exports.validateCoupon = async (req, res) => {
  try {
    const { code, orderTotal } = req.body; 

    if (!code || orderTotal === undefined) {
        return res.status(400).json({ message: 'Vui lòng cung cấp mã code và tổng tiền hàng' });
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });

    // 1. Kiểm tra không tồn tại
    if (!coupon) {
      return res.status(404).json({ message: 'Mã giảm giá không hợp lệ' });
    }
    
    // 2. Kiểm tra bị khóa (isActive)
    if (!coupon.isActive) {
        return res.status(400).json({ message: 'Mã giảm giá đã bị vô hiệu hóa' });
    }
    
    // 3. Kiểm tra hết hạn
    if (coupon.expiryDate < Date.now()) {
        return res.status(400).json({ message: 'Mã giảm giá đã hết hạn' });
    }
    
    // 4. Kiểm tra lượt sử dụng
    if (coupon.usageCount >= coupon.usageLimit) {
        return res.status(400).json({ message: 'Mã giảm giá đã hết lượt sử dụng' });
    }
    
    // 5. Kiểm tra giá trị đơn hàng tối thiểu
    if (orderTotal < coupon.minOrderValue) {
        return res.status(400).json({ 
            message: `Mã này chỉ áp dụng cho đơn hàng từ ${coupon.minOrderValue}đ` 
        });
    }

    // 6. Tính toán số tiền giảm
    let discountPrice = 0;
    if (coupon.discountType === 'percent') {
      discountPrice = (orderTotal * coupon.discountValue) / 100;
    } else { // 'fixed'
      discountPrice = coupon.discountValue;
    }
    
    // Trả về số tiền giảm
    res.status(200).json({
      success: true,
      message: 'Áp dụng mã thành công',
      discountPrice: discountPrice,
      couponId: coupon._id 
    });

  } catch (error) {
    console.error('Lỗi khi validate coupon:', error.message);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};