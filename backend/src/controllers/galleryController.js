const Gallery = require('../models/Gallery');

// GET /api/gallery
exports.getGalleryItems = async (req, res) => {
  const { category } = req.query;
  const filter = {};
  if (category && category !== 'All') {
    filter.category = category;
  }
  const items = await Gallery.find(filter).sort({ sortOrder: 1, createdAt: -1 });
  res.json({ success: true, count: items.length, items });
};

// POST /api/gallery (Admin)
exports.createGalleryItem = async (req, res) => {
  const item = await Gallery.create(req.body);
  res.status(201).json({ success: true, item });
};

// DELETE /api/gallery/:id (Admin)
exports.deleteGalleryItem = async (req, res) => {
  const item = await Gallery.findById(req.params.id);
  if (!item) {
    return res.status(404).json({ message: 'Gallery item not found' });
  }
  await item.deleteOne();
  res.json({ success: true, message: 'Gallery item deleted' });
};
