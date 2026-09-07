const express = require('express');
const { listMenu, createMenuItem, updateMenuItem, deleteMenuItem } = require('../controllers/menuController');
const { protect, requireRole } = require('../middleware/auth');

const router = express.Router();
router.get('/', listMenu);
router.post('/', protect, requireRole('admin', 'super_admin'), createMenuItem);
router.put('/:id', protect, requireRole('admin', 'super_admin'), updateMenuItem);
router.delete('/:id', protect, requireRole('admin', 'super_admin'), deleteMenuItem);

module.exports = router;
