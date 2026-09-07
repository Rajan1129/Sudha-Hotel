const mongoose = require('mongoose');

const venueSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    capacity: { type: Number, required: true, min: 1 },
    basePrice: { type: Number, required: true, min: 0 },
    inclusions: { type: [String], default: [] },
    image: { type: String, default: '' },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Venue', venueSchema);
