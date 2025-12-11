const Notification = require('../models/notificationModel');

// @desc    Lấy danh sách thông báo của người dùng
// @route   GET /api/notifications
// @access  Private
const getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 }); // Mới nhất lên đầu
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Đánh dấu đã đọc
// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (notification) {
        // Chỉ chủ sở hữu mới được đánh dấu
        if(notification.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Không có quyền' });
        }
        
        notification.isRead = true;
        await notification.save();
        res.json({ message: 'Đã đánh dấu đã đọc' });
    } else {
        res.status(404).json({ message: 'Không tìm thấy thông báo' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
    getMyNotifications,
    markAsRead
};