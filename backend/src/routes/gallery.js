const express = require('express');
const router = express.Router();
const { getGalleryItems, createGalleryItem, deleteGalleryItem } = require('../controllers/galleryController');
const { protect } = require('../middleware/auth');

router.get('/', getGalleryItems);
router.post('/', protect, createGalleryItem);
router.delete('/:id', protect, deleteGalleryItem);

module.exports = router;
