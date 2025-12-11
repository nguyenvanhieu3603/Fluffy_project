const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reason: { type: String, required: true },
  status: { type: String, enum: ['pending', 'resolved'], default: 'pending' },
  resolvedAt: Date,
  adminNote: String
}, { timestamps: true });

const Report = mongoose.model('Report', reportSchema);
module.exports = Report;