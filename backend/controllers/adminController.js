const User = require('../models/userModel');
const Order = require('../models/orderModel');
const Pet = require('../models/petModel');
const Review = require('../models/reviewModel');
const Report = require('../models/reportModel');

// @desc    Lấy thống kê Dashboard (Tối ưu hóa bằng Aggregation)
// @route   GET /api/admin/stats
const getDashboardStats = async (req, res) => {
  try {
    // 1. Đếm số lượng (Count Documents nhanh hơn Find)
    const totalUsers = await User.countDocuments({ role: 'customer' });
    const totalSellers = await User.countDocuments({ role: 'seller' });
    const totalProducts = await Pet.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: 'pending' });

    // 2. Tính doanh thu & Hoa hồng bằng Aggregation (Xử lý dưới DB)
    const revenueStats = await Order.aggregate([
      { 
        $match: { status: { $in: ['delivered', 'completed'] } } // Chỉ lấy đơn thành công
      },
      {
        $group: {
          _id: null,
          totalSales: { $sum: "$prices.totalPrice" } // Tổng tiền hàng
        }
      }
    ]);

    const totalSalesVolume = revenueStats.length > 0 ? revenueStats[0].totalSales : 0;
    const commissionRate = 0.1; // 10%
    const totalCommission = totalSalesVolume * commissionRate;

    // 3. Biểu đồ doanh thu 6 tháng gần nhất (Aggregation)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);

    const monthlyStats = await Order.aggregate([
      {
        $match: {
          status: { $in: ['delivered', 'completed'] },
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            month: { $month: "$createdAt" },
            year: { $year: "$createdAt" }
          },
          totalSales: { $sum: "$prices.totalPrice" }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    // Format lại dữ liệu cho Frontend (đảm bảo đủ 6 tháng kể cả tháng 0 doanh thu)
    const monthlyRevenue = [];
    for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const month = d.getMonth() + 1;
        const year = d.getFullYear();
        
        const found = monthlyStats.find(item => item._id.month === month && item._id.year === year);
        const sales = found ? found.totalSales : 0;
        
        monthlyRevenue.push({
            name: `Tháng ${month}`,
            Total: sales * commissionRate
        });
    }

    res.json({ 
        totalUsers, 
        totalSellers, 
        totalProducts, 
        totalSalesVolume, 
        totalCommission, 
        monthlyRevenue, 
        pendingOrders 
    });

  } catch (error) {
    console.error("Dashboard Stats Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Lấy danh sách Users theo Role
// @route   GET /api/admin/users
const getUsersByRole = async (req, res) => {
  try {
    const role = req.query.role || 'customer'; 
    const users = await User.find({ role: role })
        .select('-password -otp') // Bỏ các trường nhạy cảm
        .sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Khóa/Mở khóa User (Thay vì Xóa vĩnh viễn)
// @route   PUT /api/admin/users/:id/status
const toggleUserStatus = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        
        if (!user) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng' });
        }

        // Không cho phép khóa Admin
        if (user.role === 'admin') {
            return res.status(400).json({ message: 'Không thể khóa tài khoản Admin' });
        }

        // Đảo ngược trạng thái
        user.isActive = !user.isActive;
        await user.save();

        const statusMessage = user.isActive ? 'Đã mở khóa tài khoản' : 'Đã khóa tài khoản';
        res.json({ message: statusMessage, isActive: user.isActive });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// ... (Giữ nguyên các hàm GET khác không cần thay đổi logic) ...

const getAllPetsAdmin = async (req, res) => {
    try {
        const pets = await Pet.find({ breed: { $exists: true, $ne: null } })
            .populate('seller', 'fullName email sellerInfo.shopName')
            .populate('category', 'name')
            .sort({ createdAt: -1 });
        res.json(pets);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const getAllAccessoriesAdmin = async (req, res) => {
    try {
        const accessories = await Pet.find({ $or: [{ breed: { $exists: false } }, { breed: null }] })
            .populate('seller', 'fullName email sellerInfo.shopName')
            .populate('category', 'name')
            .sort({ createdAt: -1 });
        res.json(accessories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const getAllReviews = async (req, res) => {
    try {
        const reviews = await Review.find({})
            .populate('customer', 'fullName email avatar')
            .populate('pet', 'name images')
            .sort({ createdAt: -1 });
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteReview = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);
        if (review) {
            await review.deleteOne();
            res.json({ message: 'Đã xóa đánh giá vi phạm' });
        } else {
            res.status(404).json({ message: 'Không tìm thấy đánh giá' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getAllReports = async (req, res) => {
    try {
        const reports = await Report.find({})
            .populate('customer', 'fullName email')
            .populate('seller', 'fullName email sellerInfo.shopName')
            .populate('order', '_id totalPrice status')
            .sort({ createdAt: -1 });
        res.json(reports);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const resolveReport = async (req, res) => {
    try {
        const report = await Report.findById(req.params.id);
        if (report) {
            report.status = 'resolved';
            report.resolvedAt = Date.now();
            report.adminNote = req.body.adminNote || 'Đã xử lý xong';
            await report.save();
            res.json({ message: 'Đã giải quyết khiếu nại' });
        } else {
            res.status(404).json({ message: 'Không tìm thấy khiếu nại' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find({})
            .populate('customer', 'fullName email')
            .populate('seller', 'fullName sellerInfo.shopName')
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
  getDashboardStats,
  getUsersByRole,
  toggleUserStatus, // Export hàm mới
  getAllPetsAdmin,
  getAllAccessoriesAdmin,
  getAllReviews,
  deleteReview,
  getAllReports,
  resolveReport,
  getAllOrders 
};