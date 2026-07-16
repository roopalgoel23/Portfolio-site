const express = require('express');
const router  = express.Router();

const contentController = require('../controllers/contentController');
const { requireAuth }   = require('../middleware/auth');
const { uploadSingleImage, uploadMultipleImages, uploadSingleFile } = require('../middleware/upload');

// Public
router.get('/content', contentController.getContent);

// Admin
router.put('/content', requireAuth, contentController.updateContent);
router.post('/content/hero-image',  requireAuth, uploadSingleImage,    contentController.uploadHeroImage);
router.post('/content/about-images', requireAuth, uploadMultipleImages, contentController.uploadAboutImages);

// Generic file upload — returns { path: '/uploads/filename.ext' }
router.post('/upload', requireAuth, uploadSingleFile, (_req, res) => {
  if (!_req.file) return res.status(400).json({ message: 'No file uploaded.' });
  res.json({ path: `/uploads/${_req.file.filename}` });
});

module.exports = router;
