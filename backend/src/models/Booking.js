const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    bookingCode: { type: String, required: true, unique: true }, // e.g. SH-8842
    room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
    roomSnapshot: {
      name: String,
      category: String,
      basePrice: Number,
      taxPercent: Number,
    },
    checkIn: { type: Date, required: true },
    checkOut: { type: Date, required: true },
    nights: { type: Number, required: true, min: 1 },
    roomsBooked: { type: Number, required: true, min: 1, default: 1 },
    adults: { type: Number, required: true, min: 1 },
    children: { type: Number, default: 0 },

    guestName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    countryCode: { type: String, default: '+91' },
    specialRequests: { type: String, default: '' },

    promoCode: { type: String, default: '' },
    discountAmount: { type: Number, default: 0 },
    addOns: [
      {
        code: String,
        name: String,
        price: Number,
        quantity: Number,
      },
    ],
    addOnsTotal: { type: Number, default: 0 },
    roomSubtotal: { type: Number, required: true },
    taxAmount: { type: Number, required: true },
    totalAmount: { type: Number, required: true },

    paymentMethod: { type: String, enum: ['upi_qr', 'pay_at_hotel', 'razorpay'], default: 'upi_qr' },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'refunded'], default: 'pending' },
    upiTransactionRef: { type: String, default: '' },
    paymentProofImage: { type: String, default: '' },

    bookingStatus: {
      type: String,
      enum: ['pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

bookingSchema.index({ room: 1, checkIn: 1, checkOut: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
