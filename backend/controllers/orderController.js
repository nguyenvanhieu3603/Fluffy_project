const Order = require('../models/orderModel');
const Notification = require('../models/notificationModel');
const Pet = require('../models/petModel');
const Coupon = require('../models/couponModel'); // Import Coupon Model

// @desc    Tạo đơn hàng mới
// @route   POST /api/orders
const addOrderItems = async (req, res) => {
  try {
    const {
      orderItems,
      shippingInfo,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      totalPrice,
      couponCode, // Nhận thêm mã giảm giá từ Frontend
      discountAmount // Nhận số tiền giảm để lưu (cần verify lại ở server cho chắc)
    } = req.body;

    if (orderItems && orderItems.length === 0) {
      return res.status(400).json({ message: 'Không có sản phẩm nào trong giỏ hàng' });
    } else {
      const firstItem = orderItems[0];
      const sellerId = firstItem.seller._id || firstItem.seller; 

      if (req.user._id.toString() === sellerId.toString()) {
          return res.status(400).json({ message: 'Bạn không thể tự đặt mua sản phẩm của chính mình.' });
      }

      // 1. TRỪ TỒN KHO
      for (const item of orderItems) {
          const product = await Pet.findById(item.pet);
          if (!product) return res.status(404).json({ message: `Sản phẩm ${item.name} không tồn tại` });
          if (product.stock < item.quantity) return res.status(400).json({ message: `Sản phẩm ${item.name} không đủ số lượng` });
          
          product.stock = product.stock - item.quantity;
          await product.save();
      }

      // 2. XỬ LÝ COUPON (NẾU CÓ)
      let finalDiscount = 0;
      let couponInfo = {};

      if (couponCode) {
          const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
          
          // Kiểm tra tính hợp lệ của coupon lần cuối tại Server (để tránh hack ở client)
          if (coupon && coupon.isActive && coupon.expiryDate > Date.now() && coupon.usageCount < coupon.usageLimit && itemsPrice >= coupon.minOrderValue) {
              
              // Tính toán lại số tiền giảm
              if (coupon.discountType === 'percent') {
                  finalDiscount = (itemsPrice * coupon.discountValue) / 100;
              } else {
                  finalDiscount = coupon.discountValue;
              }

              // Tăng số lượt sử dụng
              coupon.usageCount += 1;
              await coupon.save();

              couponInfo = {
                  code: couponCode,
                  discount: finalDiscount
              };
          }
      }

      // Tính lại totalPrice ở Server để đảm bảo an toàn
      const calculatedTotal = itemsPrice + shippingPrice - finalDiscount;

      const order = new Order({
        orderItems,
        user: req.user._id, 
        customer: req.user._id, 
        seller: sellerId,
        shippingInfo,
        paymentMethod,
        coupon: couponInfo, // Lưu thông tin coupon
        prices: { 
            itemsPrice, 
            shippingPrice, 
            totalPrice: calculatedTotal // Dùng giá đã tính toán lại
        },
        status: 'pending'
      });

      const createdOrder = await order.save();
      res.status(201).json(createdOrder);
    }
  } catch (error) {
    console.error("Lỗi tạo đơn hàng:", error); 
    res.status(500).json({ message: error.message });
  }
};

// ... (Giữ nguyên các hàm khác getOrderById, getMyOrders, v.v...)
// Bạn chỉ cần copy hàm addOrderItems ở trên thay vào file cũ

const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
        .populate('customer', 'fullName email')
        .populate('seller', 'fullName sellerInfo.shopName email');

    if (order) {
      res.json(order);
    } else {
      res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ customer: req.user._id }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const getSellerOrders = async (req, res) => {
  try {
    const orders = await Order.find({ seller: req.user._id })
      .populate('customer', 'fullName email') 
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      if (order.customer.toString() !== req.user._id.toString()) {
          return res.status(403).json({ message: 'Bạn không có quyền hủy đơn hàng này' });
      }
      if (order.status !== 'pending') {
          return res.status(400).json({ message: 'Không thể hủy đơn hàng đã được xác nhận hoặc đang giao.' });
      }
      
      order.status = 'cancelled';
      order.cancelledAt = Date.now();
      await order.save();

      for (const item of order.orderItems) {
          const product = await Pet.findById(item.pet);
          if (product) {
              product.stock = product.stock + item.quantity;
              await product.save();
          }
      }

      res.json(order);
    } else {
      res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (order) {
      if (order.seller.toString() !== req.user._id.toString()) {
          return res.status(403).json({ message: 'Bạn không có quyền quản lý đơn hàng này' });
      }

      if (status === 'cancelled' && order.status !== 'cancelled') {
          for (const item of order.orderItems) {
              const product = await Pet.findById(item.pet);
              if (product) {
                  product.stock += item.quantity;
                  await product.save();
              }
          }
      }

      order.status = status;
      if (status === 'delivered') {
          order.deliveredAt = Date.now();
      }

      await order.save();

      const orderIdStr = order._id.toString(); 

      let title = '';
      let message = '';

      switch (status) {
          case 'confirmed':
              title = 'Đơn hàng đã được xác nhận';
              message = `Shop đã xác nhận đơn hàng #${orderIdStr.slice(-6).toUpperCase()} của bạn và đang chuẩn bị hàng.`;
              break;
          case 'shipping':
              title = 'Đơn hàng đang được giao';
              message = `Shipper đã lấy đơn hàng #${orderIdStr.slice(-6).toUpperCase()}. Vui lòng chú ý điện thoại.`;
              break;
          case 'delivered':
              title = 'Giao hàng thành công';
              message = `Đơn hàng #${orderIdStr.slice(-6).toUpperCase()} đã giao thành công. Hãy đánh giá sản phẩm nhé!`;
              break;
          case 'cancelled':
              title = 'Đơn hàng đã bị hủy';
              message = `Rất tiếc, đơn hàng #${orderIdStr.slice(-6).toUpperCase()} đã bị hủy.`;
              break;
      }

      if (title) {
          await Notification.create({
              user: order.customer,
              title: title,
              message: message,
              type: 'order',
              link: `/order/${order._id}`
          });
      }

      res.json(order);
    } else {
      res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getSellerStats = async (req, res) => {
  try {
    const sellerId = req.user._id;
    const totalOrders = await Order.countDocuments({ seller: sellerId });
    const totalProducts = await Pet.countDocuments({ seller: sellerId });
    const pendingOrders = await Order.countDocuments({ seller: sellerId, status: 'pending' });
    
    const revenueOrders = await Order.find({ 
        seller: sellerId, 
        status: { $in: ['delivered', 'completed'] } 
    });
    
    const totalRevenue = revenueOrders.reduce((acc, order) => acc + order.prices.totalPrice, 0);

    const monthlyRevenue = [];
    const today = new Date();

    for (let i = 5; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const monthName = `Tháng ${d.getMonth() + 1}`;
        const year = d.getFullYear();
        
        const monthOrders = revenueOrders.filter(order => {
            const orderDate = new Date(order.createdAt);
            return orderDate.getMonth() === d.getMonth() && orderDate.getFullYear() === year;
        });
        const monthSales = monthOrders.reduce((acc, order) => acc + order.prices.totalPrice, 0);
        monthlyRevenue.push({ name: monthName, sales: monthSales });
    }

    res.json({ totalOrders, totalProducts, pendingOrders, totalRevenue, monthlyRevenue });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const confirmReceived = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      if (order.customer.toString() !== req.user._id.toString()) {
          return res.status(403).json({ message: 'Bạn không có quyền thao tác đơn hàng này' });
      }

      if (order.status !== 'delivered') {
          return res.status(400).json({ message: 'Đơn hàng chưa được giao đến nơi hoặc đã hoàn thành.' });
      }

      order.status = 'completed';
      order.completedAt = Date.now();
      
      const updatedOrder = await order.save();

      const orderIdStr = order._id.toString(); 

      await Notification.create({
          user: order.seller,
          title: 'Đơn hàng hoàn tất',
          message: `Khách hàng đã xác nhận nhận được đơn hàng #${orderIdStr.slice(-6).toUpperCase()}. Doanh thu đã được ghi nhận.`,
          type: 'order',
          link: '/seller/orders' 
      });

      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }
  } catch (error) {
    console.error("Lỗi confirmReceived:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addOrderItems,
  getOrderById,
  getMyOrders,
  cancelOrder,
  getSellerOrders,
  updateOrderStatus,
  getSellerStats,
  confirmReceived
};