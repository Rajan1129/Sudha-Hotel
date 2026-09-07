const mongoose = require('mongoose');

async function connectDB() {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/sudha_hotel';
  mongoose.set('strictQuery', true);
  try {
    await mongoose.connect(uri);
    console.log('[db] MongoDB connected successfully');
  } catch (err) {
    console.error('[db] MongoDB connection failed:', err.message);
    process.exit(1);
  }
}

module.exports = connectDB;
