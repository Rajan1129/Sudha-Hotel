const express = require('express');
const { listInquiries, createInquiry, resolveInquiry, deleteInquiry, clearAllInquiries } = require('../controllers/inquiryController');
const { protect, requireRole } = require('../middleware/auth');

const router = express.Router();
router.post('/', createInquiry);
router.get('/', protect, requireRole('admin', 'super_admin'), listInquiries);
router.put('/:id/resolve', protect, requireRole('admin', 'super_admin'), resolveInquiry);
router.delete('/clear-all', protect, requireRole('admin', 'super_admin'), clearAllInquiries);
router.delete('/:id', protect, requireRole('admin', 'super_admin'), deleteInquiry);

module.exports = router;
