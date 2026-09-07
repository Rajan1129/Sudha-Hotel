const express = require('express');
const {
  quoteBooking,
  createBooking,
  confirmPayment,
  getBooking,
  listBookings,
  updateBookingStatus,
  deleteBooking,
} = require('../controllers/bookingController');
const { protect, requireRole } = require('../middleware/auth');

const router = express.Router();
router.post('/quote', quoteBooking);
router.post('/', createBooking);
router.post('/:id/confirm-payment', protect, requireRole('admin', 'super_admin'), confirmPayment);
router.get('/:id', getBooking);
router.get('/', protect, requireRole('admin', 'super_admin'), listBookings);
router.put('/:id/status', protect, requireRole('admin', 'super_admin'), updateBookingStatus);
router.delete('/:id', protect, requireRole('admin', 'super_admin'), deleteBooking);

module.exports = router;
