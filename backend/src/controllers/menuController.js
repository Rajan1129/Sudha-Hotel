const MenuItem = require('../models/MenuItem');

async function listMenu(req, res) {
  const items = await MenuItem.find().sort({ sortOrder: 1, createdAt: 1 });
  res.json({ items });
}

async function createMenuItem(req, res) {
  const item = await MenuItem.create(req.body);
  res.status(201).json({ item });
}

async function updateMenuItem(req, res) {
  const item = await MenuItem.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!item) return res.status(404).json({ message: 'Menu item not found.' });
  res.json({ item });
}

async function deleteMenuItem(req, res) {
  const item = await MenuItem.findByIdAndDelete(req.params.id);
  if (!item) return res.status(404).json({ message: 'Menu item not found.' });
  res.json({ message: 'Menu item deleted.' });
}

module.exports = { listMenu, createMenuItem, updateMenuItem, deleteMenuItem };
