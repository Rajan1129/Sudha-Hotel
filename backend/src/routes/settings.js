const express = require('express');
const { getSettings, updateSettings } = require('../controllers/settingsController');
const { protect, requireRole } = require('../middleware/auth');

const router = express.Router();
router.get('/', getSettings);
router.put('/', protect, requireRole('admin', 'super_admin'), updateSettings);

module.exports = router;
