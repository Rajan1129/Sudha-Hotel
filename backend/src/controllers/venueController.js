const Venue = require('../models/Venue');

async function listVenues(req, res) {
  const venues = await Venue.find({ status: 'active' }).sort({ createdAt: 1 });
  res.json({ venues });
}

async function listVenuesAdmin(req, res) {
  const venues = await Venue.find().sort({ createdAt: 1 });
  res.json({ venues });
}

async function createVenue(req, res) {
  const venue = await Venue.create(req.body);
  res.status(201).json({ venue });
}

async function updateVenue(req, res) {
  const venue = await Venue.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!venue) return res.status(404).json({ message: 'Venue not found.' });
  res.json({ venue });
}

async function deleteVenue(req, res) {
  const venue = await Venue.findByIdAndDelete(req.params.id);
  if (!venue) return res.status(404).json({ message: 'Venue not found.' });
  res.json({ message: 'Venue deleted.' });
}

module.exports = { listVenues, listVenuesAdmin, createVenue, updateVenue, deleteVenue };
