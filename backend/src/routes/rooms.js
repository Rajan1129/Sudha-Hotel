const express = require('express');
const { listRooms, getRoom, createRoom, updateRoom, deleteRoom } = require('../controllers/roomController');
const { protect, requireRole } = require('../middleware/auth');

const router = express.Router();
router.get('/', listRooms);
router.get('/:id', getRoom);
router.post('/', protect, requireRole('admin', 'super_admin'), createRoom);
router.put('/:id', protect, requireRole('admin', 'super_admin'), updateRoom);
router.delete('/:id', protect, requireRole('admin', 'super_admin'), deleteRoom);

module.exports = router;
