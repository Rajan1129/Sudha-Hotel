const express = require('express');
const { getSummary } = require('../controllers/dashboardController');
const { protect, requireRole } = require('../middleware/auth');

const router = express.Router();
router.get('/summary', protect, requireRole('admin', 'super_admin'), getSummary);

module.exports = router;
