const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    guestName: { type: String, required: true, trim: true },
    subtitle: { type: String, default: '' }, // e.g. "Stayed with family - Delhi to Dharamshala trip"
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    approved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Review', reviewSchema);
