const User = require('../models/userModel');
const Order = require('../models/orderModel');
const Pet = require('../models/petModel');
const Review = require('../models/reviewModel');
const Report = require('../models/reportModel');

// @desc    Lấy thống kê Dashboard
// @route   GET /api/admin/stats
const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'customer' });
    const totalSellers = await User.countDocuments({ role: 'seller' });
    const totalProducts = await Pet.countDocuments();
    
    // Doanh thu (Hoa hồng 10%)
    const successOrders = await Order.find({ status: { $in: ['delivered', 'completed'] } });
    const totalSalesVolume = successOrders.reduce((acc, order) => acc + order.prices.totalPrice, 0);
    const commissionRate = 0.1;
    const totalCommission = totalSalesVolume * commissionRate;

    // Biểu đồ
    const monthlyRevenue = [];
    const today = new Date();
    for (let i = 5; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const monthName = `Tháng ${d.getMonth() + 1}`;
        const year = d.getFullYear();
        const monthOrders = successOrders.filter(order => {
            const orderDate = new Date(order.createdAt);
            return orderDate.getMonth() === d.getMonth() && orderDate.getFullYear() === year;
        });
        const monthSales = monthOrders.reduce((acc, order) => acc + order.prices.totalPrice, 0);
        monthlyRevenue.push({ name: monthName, Total: monthSales * commissionRate });
    }

    const pendingOrders = await Order.countDocuments({ status: 'pending' });

    res.json({ totalUsers, totalSellers, totalProducts, totalSalesVolume, totalCommission, monthlyRevenue, pendingOrders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Lấy danh sách Users theo Role
// @route   GET /api/admin/users
const getUsersByRole = async (req, res) => {
  try {
    const role = req.query.role || 'customer'; 
    const users = await User.find({ role: role }).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Lấy danh sách CHỈ THÚ CƯNG (Có thuộc tính breed)
// @route   GET /api/admin/pets
const getAllPetsAdmin = async (req, res) => {
    try {
        // Lọc: Trường breed tồn tại và không rỗng
        const pets = await Pet.find({ breed: { $exists: true, $ne: null } })
            .populate('seller', 'fullName email sellerInfo.shopName')
            .populate('category', 'name')
            .sort({ createdAt: -1 });
        res.json(pets);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// @desc    Lấy danh sách CHỈ PHỤ KIỆN (Không có breed)
// @route   GET /api/admin/accessories
const getAllAccessoriesAdmin = async (req, res) => {
    try {
        // Lọc: Trường breed không tồn tại hoặc null
        const accessories = await Pet.find({ 
            $or: [{ breed: { $exists: false } }, { breed: null }] 
        })
            .populate('seller', 'fullName email sellerInfo.shopName')
            .populate('category', 'name')
            .sort({ createdAt: -1 });
        res.json(accessories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// @desc    Xóa User
// @route   DELETE /api/admin/users/:id
const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if(user) {
            await user.deleteOne();
            res.json({ message: 'Đã xóa người dùng' });
        } else {
            res.status(404).json({ message: 'Không tìm thấy người dùng' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}


// @desc    Lấy tất cả đánh giá trên sàn (Admin)
// @route   GET /api/admin/reviews
// @access  Private/Admin
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

// @desc    Xóa đánh giá vi phạm (Admin)
// @route   DELETE /api/admin/reviews/:id
// @access  Private/Admin
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

// @desc    Lấy tất cả khiếu nại (Admin)
// @route   GET /api/admin/reports
// @access  Private/Admin
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

// @desc    Xử lý khiếu nại (Đổi trạng thái thành resolved)
// @route   PUT /api/admin/reports/:id/resolve
// @access  Private/Admin
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

// @desc    Lấy toàn bộ đơn hàng
// @route   GET /api/admin/orders
// @access  Private/Admin
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
  getAllPetsAdmin,
  getAllAccessoriesAdmin,
  deleteUser,
  getAllReviews,
  deleteReview,
  getAllReports,
  resolveReport,
  getAllOrders 
};