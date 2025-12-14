const User = require('../models/userModel');
const Order = require('../models/orderModel');
const Pet = require('../models/petModel');
const Review = require('../models/reviewModel');
const Report = require('../models/reportModel');

// @desc    Lấy thống kê Dashboard (Nâng cao)
// @route   GET /api/admin/stats
const getDashboardStats = async (req, res) => {
  try {
    // 1. Số liệu tổng quan
    const totalUsers = await User.countDocuments({ role: 'customer' });
    const totalSellers = await User.countDocuments({ role: 'seller' });
    const totalProducts = await Pet.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: 'pending' });

    // 2. Tính tổng doanh thu & Hoa hồng (Chỉ tính đơn thành công)
    const revenueStats = await Order.aggregate([
      { $match: { status: { $in: ['delivered', 'completed'] } } },
      { $group: { _id: null, totalSales: { $sum: "$prices.totalPrice" } } }
    ]);

    const totalSalesVolume = revenueStats.length > 0 ? revenueStats[0].totalSales : 0;
    const commissionRate = 0.1; // Phí sàn 10%
    const totalCommission = totalSalesVolume * commissionRate;

    // --- XỬ LÝ DỮ LIỆU BIỂU ĐỒ ---
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0,0,0,0);

    // A. Biểu đồ Doanh thu 6 tháng (Bar Chart)
    const monthlyStats = await Order.aggregate([
      {
        $match: {
          status: { $in: ['delivered', 'completed'] },
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } },
          totalSales: { $sum: "$prices.totalPrice" }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    // B. Biểu đồ Tăng trưởng người dùng 6 tháng (Line Chart) - MỚI
    const userGrowthStats = await User.aggregate([
        {
          $match: {
            role: 'customer',
            createdAt: { $gte: sixMonthsAgo }
          }
        },
        {
          $group: {
            _id: { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } },
            count: { $sum: 1 }
          }
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    // C. Biểu đồ Phân bố trạng thái đơn hàng (Doughnut Chart) - MỚI
    const orderStatusStats = await Order.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    // --- Helper function để lấp đầy các tháng bị thiếu dữ liệu ---
    const fillMonthlyData = (data, valueKey) => {
        const result = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const month = d.getMonth() + 1;
            const year = d.getFullYear();
            
            const found = data.find(item => item._id.month === month && item._id.year === year);
            const val = found ? (valueKey === 'sales' ? found.totalSales * commissionRate : found.count) : 0;
            
            result.push({
                name: `Tháng ${month}`,
                value: val
            });
        }
        return result;
    }

    const monthlyRevenue = fillMonthlyData(monthlyStats, 'sales');
    const monthlyUserGrowth = fillMonthlyData(userGrowthStats, 'users');
    
    // Map trạng thái đơn hàng sang format frontend dễ dùng
    const statusDistribution = {
        pending: 0, confirmed: 0, shipping: 0, completed: 0, cancelled: 0
    };
    orderStatusStats.forEach(item => {
        // Gom delivered vào completed cho gọn, hoặc để riêng tùy bạn
        let key = item._id;
        if (key === 'delivered') key = 'completed'; 
        if (statusDistribution[key] !== undefined) {
            statusDistribution[key] += item.count;
        }
    });

    res.json({ 
        totalUsers, 
        totalSellers, 
        totalProducts, 
        totalSalesVolume, 
        totalCommission, 
        pendingOrders,
        monthlyRevenue,      // Data cho Bar Chart
        monthlyUserGrowth,   // Data cho Line Chart (Mới)
        statusDistribution   // Data cho Doughnut Chart (Mới)
    });

  } catch (error) {
    console.error("Dashboard Stats Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ... (Giữ nguyên các hàm bên dưới không thay đổi)
const getUsersByRole = async (req, res) => {
  try {
    const role = req.query.role || 'customer'; 
    const users = await User.find({ role: role }).select('-password -otp').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const toggleUserStatus = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng' });
        if (user.role === 'admin') return res.status(400).json({ message: 'Không thể khóa Admin' });
        user.isActive = !user.isActive;
        await user.save();
        res.json({ message: user.isActive ? 'Đã mở khóa' : 'Đã khóa', isActive: user.isActive });
    } catch (error) { res.status(500).json({ message: error.message }); }
}

const getAllPetsAdmin = async (req, res) => {
    try {
        // Lấy tất cả có type là 'pet'
        const pets = await Pet.find({ type: 'pet' })
            .populate('seller', 'fullName email sellerInfo.shopName')
            .populate('category', 'name')
            .sort({ createdAt: -1 });
        res.json(pets);
    } catch (error) { res.status(500).json({ message: error.message }); }
}

const getAllAccessoriesAdmin = async (req, res) => {
    try {
        // Lấy tất cả có type là 'accessory'
        const accessories = await Pet.find({ type: 'accessory' })
            .populate('seller', 'fullName email sellerInfo.shopName')
            .populate('category', 'name')
            .sort({ createdAt: -1 });
        res.json(accessories);
    } catch (error) { res.status(500).json({ message: error.message }); }
}

const getAllReviews = async (req, res) => {
    try {
        const reviews = await Review.find({}).populate('customer', 'fullName email avatar').populate('pet', 'name images').sort({ createdAt: -1 });
        res.json(reviews);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

const deleteReview = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);
        if (review) { await review.deleteOne(); res.json({ message: 'Đã xóa' }); } 
        else { res.status(404).json({ message: 'Không tìm thấy' }); }
    } catch (error) { res.status(500).json({ message: error.message }); }
};

const getAllReports = async (req, res) => {
    try {
        const reports = await Report.find({}).populate('customer', 'fullName email').populate('seller', 'fullName email sellerInfo.shopName').populate('order', '_id totalPrice status').sort({ createdAt: -1 });
        res.json(reports);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

const resolveReport = async (req, res) => {
    try {
        const report = await Report.findById(req.params.id);
        if (report) {
            report.status = 'resolved'; report.resolvedAt = Date.now(); report.adminNote = req.body.adminNote || 'Đã xử lý';
            await report.save(); res.json({ message: 'Đã giải quyết' });
        } else { res.status(404).json({ message: 'Không tìm thấy' }); }
    } catch (error) { res.status(500).json({ message: error.message }); }
};

const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find({}).populate('customer', 'fullName email').populate('seller', 'fullName sellerInfo.shopName').sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

module.exports = {
  getDashboardStats, 
  getUsersByRole, 
  toggleUserStatus, 
  getAllPetsAdmin, 
  getAllAccessoriesAdmin, 
  getAllReviews, 
  deleteReview, 
  getAllReports, 
  resolveReport, 
  getAllOrders 
};