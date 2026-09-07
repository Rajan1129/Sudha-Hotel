require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');

const Admin = require('../models/Admin');
const Room = require('../models/Room');
const MenuItem = require('../models/MenuItem');
const Venue = require('../models/Venue');
const Review = require('../models/Review');
const Settings = require('../models/Settings');
const Inquiry = require('../models/Inquiry');
const Gallery = require('../models/Gallery');

const ROOM_IMAGE_1 =
  'https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=1200&auto=format&fit=crop';
const ROOM_IMAGE_2 =
  'https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=1200&auto=format&fit=crop';
const ROOM_IMAGE_3 =
  'https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=1200&auto=format&fit=crop';

const galleryItems = [
  {
    title: 'Executive Pine Valley Suite',
    category: 'Rooms',
    image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=1200&auto=format&fit=crop',
    caption: 'Spacious suite with valley views & King bed',
    featured: true,
    sortOrder: 1,
  },
  {
    title: 'Himalayan Family Suite',
    category: 'Rooms',
    image: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=1200&auto=format&fit=crop',
    caption: 'Generous layout with two queen beds for families',
    featured: true,
    sortOrder: 2,
  },
  {
    title: 'Sudha Kitchen Fresh Tandoor',
    category: 'Dining',
    image: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?q=80&w=1200&auto=format&fit=crop',
    caption: 'Freshly baked naan and tandoori specialties',
    featured: true,
    sortOrder: 3,
  },
  {
    title: 'Authentic Himachali Thali',
    category: 'Dining',
    image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?q=80&w=1200&auto=format&fit=crop',
    caption: 'Traditional Madra, Chana Khatta & aromatic Basmati',
    featured: false,
    sortOrder: 4,
  },
  {
    title: 'Sudha Hotel Highway Exterior',
    category: 'Property',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1600&auto=format&fit=crop',
    caption: 'Convenient property on Una-Amb highway',
    featured: true,
    sortOrder: 5,
  },
  {
    title: 'Courtyard Parking Lawn',
    category: 'Property',
    image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=1200&auto=format&fit=crop',
    caption: 'Monitored secure parking for sedans & SUVs',
    featured: false,
    sortOrder: 6,
  },
  {
    title: 'Grand Banquet Setup',
    category: 'Events',
    image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=1200&auto=format&fit=crop',
    caption: 'Decorated AC banquet hall for weddings & functions',
    featured: true,
    sortOrder: 7,
  },
];

const rooms = [
  {
    name: 'Executive Pine Valley Suite',
    category: 'Heritage Suite',
    tagline: 'Private Balcony · Valley & Deodar View',
    badge: 'Popular Choice',
    description:
      'Floor-to-ceiling windows open onto a private balcony framed by deodar pines, with a plush pocket-spring king bed and a dedicated work desk.',
    images: [ROOM_IMAGE_1],
    sizeSqft: 280,
    bedType: '1 King Bed · Plush Pocket-Spring',
    maxAdults: 2,
    maxChildren: 1,
    amenities: ['Fast Wi-Fi', '24/7 Hot Geyser', 'Electric Kettle', 'Work Desk', 'Sanitized Daily'],
    totalUnits: 3,
    basePrice: 2650,
    taxPercent: 12,
    freeCancellation: true,
    status: 'active',
    sortOrder: 1,
  },
  {
    name: 'Himalayan Family Suite',
    category: 'Family Room',
    tagline: 'Panoramic Balcony & Extra Space',
    badge: 'Family Preferred',
    description:
      'Two dedicated queen beds and a generous layout designed for families, with a double vanity bath and a 4K smart TV for wind-down evenings.',
    images: [ROOM_IMAGE_2],
    sizeSqft: 420,
    bedType: '2 Queen Beds · Dedicated',
    maxAdults: 4,
    maxChildren: 2,
    amenities: ["50\" 4K Smart TV", '24h In-Room Dining', 'Dual Inverter AC', 'Double Vanity Bath'],
    totalUnits: 5,
    basePrice: 4200,
    taxPercent: 12,
    freeCancellation: true,
    status: 'active',
    sortOrder: 2,
  },
  {
    name: 'Comfort Deluxe Twin Room',
    category: 'Twin Room',
    tagline: 'Quiet Courtyard View · Soundproof Windows',
    badge: 'Best Value',
    description:
      'Two individually dressed single beds in a bright, soundproofed room overlooking the courtyard - a favourite with solo pilgrims and colleagues travelling together.',
    images: [ROOM_IMAGE_3],
    sizeSqft: 240,
    bedType: '2 Twin Beds · Individual Mattresses',
    maxAdults: 2,
    maxChildren: 0,
    amenities: ['Air Conditioning', 'Free Wi-Fi', '24/7 Room Service'],
    totalUnits: 4,
    basePrice: 1950,
    taxPercent: 12,
    freeCancellation: false,
    status: 'active',
    sortOrder: 3,
  },
];

const menuItems = [
  {
    name: 'Himachali Dhaam Special',
    description: 'Madra, Maa ki Daal, Khatta, Basmati Rice',
    price: 280,
    category: "Chef's Signature Selections",
    emoji: '🍛',
    icon: 'ramen_dining',
    inStock: true,
    sortOrder: 1,
  },
  {
    name: 'Himachali Kadhi Chawal',
    description: 'Traditional curd tempered with mustard and fenugreek',
    price: 180,
    category: 'Una Highway Specialties',
    emoji: '🥘',
    icon: 'ramen_dining',
    inStock: true,
    sortOrder: 2,
  },
  {
    name: 'Amritsari Kulcha',
    description: 'Crisp clay tandoori kulcha, served hot',
    price: 150,
    category: "Chef's Signature Selections",
    emoji: '🫓',
    icon: 'bakery_dining',
    inStock: true,
    sortOrder: 3,
  },
  {
    name: 'Paneer Butter Masala & Naan',
    description: 'Creamy tomato gravy with 2 butter tandoori naans',
    price: 260,
    category: 'Una Highway Specialties',
    emoji: '🧈',
    icon: 'bakery_dining',
    inStock: true,
    sortOrder: 4,
  },
  {
    name: 'Himalayan Chicken Curry',
    description: 'Slow simmered mountain style chicken with whole spices',
    price: 340,
    category: 'Una Highway Specialties',
    emoji: '🍗',
    icon: 'ramen_dining',
    inStock: true,
    sortOrder: 5,
  },
  {
    name: 'Badam Kheer',
    description: 'Slow-cooked cardamom milk with almonds',
    price: 120,
    category: "Chef's Signature Selections",
    emoji: '🍮',
    icon: 'icecream',
    inStock: true,
    sortOrder: 6,
  },
  {
    name: 'Special Ginger Masala Tea (Pot)',
    description: 'Brewed with fresh hill ginger, cardamom, and clove',
    price: 80,
    category: "Chef's Signature Selections",
    emoji: '🍵',
    icon: 'icecream',
    inStock: true,
    sortOrder: 7,
  },
];

const venues = [
  {
    name: 'Sudha Royal Banquet & Celebration Lawn',
    description: 'Grand stage, floral anniversary decor, AC Hall & buffet catering setup for milestone events in Amb.',
    capacity: 300,
    basePrice: 25000,
    inclusions: ['AC Banquet Hall', 'Stage Decoration', 'Buffet Catering Area', 'Audio DJ System'],
    image:
      'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=1200&auto=format&fit=crop',
    status: 'active',
  },
];

const reviews = [
  {
    guestName: 'Vikram Sharma',
    subtitle: 'Stayed with family · Delhi to Dharamshala trip',
    rating: 5,
    comment:
      'Perfect stop on the Una-Amb highway! Extremely clean rooms with fresh pine scent. The front desk team accommodated our midnight check-in without fuss and served steaming hot chai.',
    approved: true,
  },
  {
    guestName: 'Ananya Kapoor',
    subtitle: 'Chintpurni Pilgrimage traveler',
    rating: 5,
    comment:
      'Super convenient parking for SUVs. Delicious North Indian dinner, especially the fresh paneer and crisp tandoori rotis. Felt secure and serene throughout the night.',
    approved: true,
  },
];

async function seed() {
  await connectDB();

  const adminUsername = (process.env.SEED_ADMIN_USERNAME || 'admin').toLowerCase();
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'SudhaAdmin@123';
  const superUsername = (process.env.SEED_SUPERADMIN_USERNAME || 'superadmin').toLowerCase();
  const superPassword = process.env.SEED_SUPERADMIN_PASSWORD || 'SudhaSuper@123';

  await Promise.all([
    Room.deleteMany({}),
    MenuItem.deleteMany({}),
    Venue.deleteMany({}),
    Review.deleteMany({}),
    Inquiry.deleteMany({}),
    Gallery.deleteMany({}),
  ]);

  await Room.insertMany(rooms);
  await MenuItem.insertMany(menuItems);
  await Venue.insertMany(venues);
  await Review.insertMany(reviews);
  await Gallery.insertMany(galleryItems);

  await Settings.findOneAndUpdate(
    { singleton: 'main' },
    {
      singleton: 'main',
      hotelName: 'Sudha Hotel & Restaurant',
      address: 'M4G9+P36 Sudha hotel, Una - Amb Rd, Pratap Nagar, Amb, Himachal Pradesh 177203',
      phone: '094187 03201',
      whatsapp: '094187 03201',
      checkinPolicy: '12:00 PM',
      checkoutPolicy: '11:00 AM',
      latitude: '31.5451',
      longitude: '76.2003',
      gstin: '',
      upiId: '9805720962@ptyes',
      upiQrImage: '/uploads/owner_upi_qr.jpg',
      googleRating: 3.9,
      googleReviewCount: 188,
    },
    { upsert: true, new: true }
  );

  const existingAdmin = await Admin.findOne({ username: adminUsername });
  if (!existingAdmin) {
    await Admin.create({
      name: 'M. Sharma',
      username: adminUsername,
      passwordHash: await Admin.hashPassword(adminPassword),
      role: 'admin',
    });
  }
  const existingSuper = await Admin.findOne({ username: superUsername });
  if (!existingSuper) {
    await Admin.create({
      name: 'Super Admin Portal',
      username: superUsername,
      passwordHash: await Admin.hashPassword(superPassword),
      role: 'super_admin',
    });
  }

  console.log('[seed] Done!');
  console.log('[seed] Admin accounts initialized successfully');
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('[seed] Failed:', err);
  process.exit(1);
});
