const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    price: { type: Number, required: true, min: 0 },
    category: { type: String, default: 'Signature' }, // e.g. Chef's Signature, Una Highway Specialties
    emoji: { type: String, default: '🍽️' },
    icon: { type: String, default: 'ramen_dining' }, // material symbol name
    isVeg: { type: Boolean, default: true }, // Veg vs Non-Veg
    image: { type: String, default: '' },
    inStock: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('MenuItem', menuItemSchema);
