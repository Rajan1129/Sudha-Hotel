const mongoose = require('mongoose');

const inquirySchema = new mongoose.Schema(
  {
    guestName: { type: String, default: 'Guest' },
    channel: { type: String, enum: ['whatsapp', 'web', 'phone'], default: 'web' },
    message: { type: String, required: true },
    status: { type: String, enum: ['unread', 'resolved'], default: 'unread' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Inquiry', inquirySchema);
