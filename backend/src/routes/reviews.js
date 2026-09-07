const express = require('express');
const {
  listApprovedReviews,
  listAllReviews,
  submitReview,
  approveReview,
  deleteReview,
} = require('../controllers/reviewController');
const { protect, requireRole } = require('../middleware/auth');

const router = express.Router();
router.get('/', listApprovedReviews);
router.post('/', submitReview);
router.get('/admin', protect, requireRole('admin', 'super_admin'), listAllReviews);
router.put('/:id/approve', protect, requireRole('admin', 'super_admin'), approveReview);
router.delete('/:id', protect, requireRole('admin', 'super_admin'), deleteReview);

module.exports = router;
