const Inquiry = require('../models/Inquiry');

async function listInquiries(req, res) {
  const inquiries = await Inquiry.find().sort({ createdAt: -1 });
  res.json({ inquiries });
}

async function createInquiry(req, res) {
  const { guestName, channel, message } = req.body;
  if (!message) return res.status(400).json({ message: 'Message is required.' });
  const inquiry = await Inquiry.create({ guestName, channel, message });
  res.status(201).json({ inquiry });
}

async function resolveInquiry(req, res) {
  const inquiry = await Inquiry.findByIdAndUpdate(req.params.id, { status: 'resolved' }, { new: true });
  if (!inquiry) return res.status(404).json({ message: 'Inquiry not found.' });
  res.json({ inquiry });
}

async function deleteInquiry(req, res) {
  const inquiry = await Inquiry.findByIdAndDelete(req.params.id);
  if (!inquiry) return res.status(404).json({ message: 'Inquiry not found.' });
  res.json({ message: 'Inquiry deleted successfully.' });
}

async function clearAllInquiries(req, res) {
  await Inquiry.deleteMany({});
  res.json({ message: 'All inquiries cleared successfully.' });
}

module.exports = { listInquiries, createInquiry, resolveInquiry, deleteInquiry, clearAllInquiries };
