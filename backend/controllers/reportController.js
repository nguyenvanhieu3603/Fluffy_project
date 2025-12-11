const Report = require('../models/Report.js');
const Order = require('../models/Order.js');



// Logic TẠO KHIẾU NẠI (POST /api/v1/reports)
// Yêu cầu: Customer (đã đăng nhập)
exports.createReport = async (req, res) => {
  try {
    const { orderId, reason, images } = req.body;
    const customerId = req.user._id;

    // 1. Kiểm tra đơn hàng
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }

    // 2. Bảo mật: Chỉ chủ đơn hàng mới được khiếu nại
    if (order.customer.toString() !== customerId.toString()) {
      return res.status(403).json({ message: 'Bạn không có quyền khiếu nại đơn hàng này' });
    }
    
    // 3. (Tùy chọn) Logic: Chỉ cho khiếu nại đơn đã giao
    // if (order.status !== 'delivered') {
    //     return res.status(400).json({ message: 'Bạn chỉ có thể khiếu nại đơn hàng đã được giao' });
    // }

    // 4. Kiểm tra xem đã khiếu nại đơn này chưa
    const reportExists = await Report.findOne({ order: orderId });
    if (reportExists) {
      return res.status(400).json({ message: 'Bạn đã khiếu nại đơn hàng này rồi' });
    }

    // 5. (OK) Tạo khiếu nại
    const report = await Report.create({
      order: orderId,
      customer: customerId,
      seller: order.seller, // Lấy ID seller từ đơn hàng
      reason,
      images,
      status: 'pending',
    });
    
    // 6. (Nên làm) Cập nhật trạng thái Order thành 'reported'
    order.status = 'reported';
    await order.save();

    res.status(201).json({
      success: true,
      message: 'Gửi khiếu nại thành công. Admin sẽ xem xét.',
      report,
    });
  } catch (error) {
    console.error('Lỗi khi tạo khiếu nại:', error.message);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};




// Logic LẤY CÁC KHIẾU NẠI (GET /api/v1/reports)
// Yêu cầu: Admin
exports.getAllReports = async (req, res) => {
  try {
    // Mặc định lọc các đơn 'pending'
    const filter = req.query.status ? { status: req.query.status } : { status: 'pending' };

    const reports = await Report.find(filter)
      .populate('customer', 'fullName email')
      .populate('seller', 'sellerInfo.shopName')
      .populate('order', 'status prices.totalPrice')
      .sort({ createdAt: 1 }); // Ưu tiên cái cũ nhất

    res.status(200).json({
      success: true,
      count: reports.length,
      reports,
    });
  } catch (error)
 {
    console.error('Lỗi khi lấy khiếu nại:', error.message);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};

// Logic GIẢI QUYẾT KHIẾU NẠI (PUT /api/v1/reports/:id/resolve)
// Yêu cầu: Admin
exports.resolveReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminNote } = req.body; // Admin có thể thêm ghi chú

    const report = await Report.findById(id);
    if (!report) {
      return res.status(404).json({ message: 'Không tìm thấy khiếu nại' });
    }

    if (report.status === 'resolved') {
      return res.status(400).json({ message: 'Khiếu nại này đã được giải quyết' });
    }

    report.status = 'resolved';
    report.resolvedAt = Date.now();
    if (adminNote) {
      report.adminNote = adminNote;
    }

    await report.save();
    
  

    res.status(200).json({
      success: true,
      message: 'Đã giải quyết khiếu nại thành công',
      report,
    });
  } catch (error) {
    console.error('Lỗi khi giải quyết khiếu nại:', error.message);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};