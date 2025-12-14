const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { 
      type: String, 
      enum: ['order', 'system', 'promotion'], 
      default: 'order' 
  },
  link: { type: String }, 
  isRead: { type: Boolean, default: false },
}, {
  timestamps: true
});

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;