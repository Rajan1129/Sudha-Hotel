const Review = require('../models/Review');

async function listApprovedReviews(req, res) {
  const reviews = await Review.find({ approved: true }).sort({ createdAt: -1 }).limit(20);
  res.json({ reviews });
}

async function listAllReviews(req, res) {
  const reviews = await Review.find().sort({ createdAt: -1 });
  res.json({ reviews });
}

async function submitReview(req, res) {
  const { guestName, subtitle, rating, comment } = req.body;
  if (!guestName || !rating || !comment) {
    return res.status(400).json({ message: 'Name, rating and feedback are required.' });
  }
  const review = await Review.create({ guestName, subtitle, rating, comment, approved: false });
  res.status(201).json({ review, message: 'Thank you! Your review will appear once verified.' });
}

async function approveReview(req, res) {
  const review = await Review.findByIdAndUpdate(req.params.id, { approved: true }, { new: true });
  if (!review) return res.status(404).json({ message: 'Review not found.' });
  res.json({ review });
}

async function deleteReview(req, res) {
  const review = await Review.findByIdAndDelete(req.params.id);
  if (!review) return res.status(404).json({ message: 'Review not found.' });
  res.json({ message: 'Review deleted.' });
}

module.exports = { listApprovedReviews, listAllReviews, submitReview, approveReview, deleteReview };
