const express = require('express');
const {
  listVenues,
  listVenuesAdmin,
  createVenue,
  updateVenue,
  deleteVenue,
} = require('../controllers/venueController');
const { protect, requireRole } = require('../middleware/auth');

const router = express.Router();
router.get('/', listVenues);
router.get('/admin', protect, requireRole('admin', 'super_admin'), listVenuesAdmin);
router.post('/', protect, requireRole('admin', 'super_admin'), createVenue);
router.put('/:id', protect, requireRole('admin', 'super_admin'), updateVenue);
router.delete('/:id', protect, requireRole('admin', 'super_admin'), deleteVenue);

module.exports = router;
