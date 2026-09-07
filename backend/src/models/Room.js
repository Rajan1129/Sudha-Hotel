const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true }, // e.g. Heritage Suite, Family Room
    tagline: { type: String, default: '' }, // e.g. "Private Balcony · Valley & Deodar View"
    badge: { type: String, default: '' }, // e.g. "Popular Choice", "Family Preferred", "Best Value"
    description: { type: String, default: '' },
    images: { type: [String], default: [] },
    sizeSqft: { type: Number, default: 0 },
    bedType: { type: String, default: '' }, // e.g. "1 King Bed"
    maxAdults: { type: Number, default: 2 },
    maxChildren: { type: Number, default: 0 },
    amenities: { type: [String], default: [] }, // e.g. ["Fast Wi-Fi", "24/7 Hot Geyser"]
    totalUnits: { type: Number, required: true, min: 0 },
    basePrice: { type: Number, required: true, min: 0 }, // per night, in INR
    taxPercent: { type: Number, default: 12 }, // Himachal Hospitality GST
    freeCancellation: { type: Boolean, default: true },
    status: { type: String, enum: ['active', 'maintenance', 'inactive'], default: 'active' },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

roomSchema.index({ status: 1 });

module.exports = mongoose.model('Room', roomSchema);
