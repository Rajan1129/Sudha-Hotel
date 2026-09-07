const express = require('express');
const upload = require('../middleware/uploadMiddleware');
const { protect } = require('../middleware/auth');

const router = express.Router();

// POST /api/upload - handles single image file upload
router.post('/', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded.' });
  }
  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({ url: fileUrl, filename: req.file.filename });
});

// POST /api/upload/multiple - handles multiple image files upload
router.post('/multiple', upload.array('files', 10), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: 'No files uploaded.' });
  }
  const urls = req.files.map((file) => `/uploads/${file.filename}`);
  res.json({ urls });
});

module.exports = router;
