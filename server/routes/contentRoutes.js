const express = require('express');
const router  = express.Router();

const contentController = require('../controllers/contentController');
const { requireAuth }   = require('../middleware/auth');
const { uploadSingleImage, uploadMultipleImages, uploadSingleFile, uploadToCloudinary, checkCloudinaryLimits } = require('../middleware/upload');

// Public
router.get('/content', contentController.getContent);

// Admin
router.put('/content', requireAuth, contentController.updateContent);
router.post('/content/hero-image',  requireAuth, uploadSingleImage,    contentController.uploadHeroImage);
router.post('/content/about-images', requireAuth, uploadMultipleImages, contentController.uploadAboutImages);

// Generic file upload — uploads to Cloudinary and returns { path, publicId, bytes, resourceType }
router.post('/upload', requireAuth, uploadSingleFile, checkCloudinaryLimits, async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded.' });
    const result = await uploadToCloudinary(req.file, 'portfolio', 'auto');
    res.json({
      path:         result.url,
      publicId:     result.publicId,
      bytes:        result.bytes,
      resourceType: result.resourceType
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
