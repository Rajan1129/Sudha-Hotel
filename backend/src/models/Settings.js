const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema(
  {
    singleton: { type: String, default: 'main', unique: true },
    hotelName: { type: String, default: 'Sudha Hotel & Restaurant' },
    address: { type: String, default: 'M4G9+P36 Sudha hotel, Una - Amb Rd, Pratap Nagar, Amb, Himachal Pradesh 177203' },
    phone: { type: String, default: '094187 03201' },
    whatsapp: { type: String, default: '094187 03201' },
    checkinPolicy: { type: String, default: '12:00 PM' },
    checkoutPolicy: { type: String, default: '11:00 AM' },
    latitude: { type: String, default: '' },
    longitude: { type: String, default: '' },
    gstin: { type: String, default: '' },
    upiId: { type: String, default: '9805720962@ptyes' },
    upiQrImage: { type: String, default: '/uploads/owner_upi_qr.jpg' },
    googleRating: { type: Number, default: 3.9 },
    googleReviewCount: { type: Number, default: 188 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Settings', settingsSchema);
