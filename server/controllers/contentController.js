const SiteContent = require('../models/SiteContent');
const { uploadToCloudinary, deleteFromCloudinary } = require('../middleware/upload');

/**
 * GET /api/content
 * Returns the single site-content document (creates a blank one if none exists).
 */
exports.getContent = async (_req, res, next) => {
  try {
    let content = await SiteContent.findOne();
    if (!content) {
      content = await SiteContent.create({});
    }
    res.json(content);
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/content  (admin)
 */
exports.updateContent = async (req, res, next) => {
  try {
    const updateFields = [
      'heroKicker', 'heroTitle', 'heroSubtitle',
      'aboutTitle', 'aboutBody',
      'whatsapp', 'email', 'instagram'
    ];

    const update = {};
    updateFields.forEach((f) => {
      if (req.body[f] !== undefined) update[f] = req.body[f];
    });

    let content = await SiteContent.findOne();

    if (!content) {
      content = new SiteContent(update);
    } else {
      Object.assign(content, update);
    }

    await content.save();
    res.json(content);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/content/hero-image  (admin)  – multer single
 */
exports.uploadHeroImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file uploaded.' });
    }

    // Upload to Cloudinary
    const result = await uploadToCloudinary(req.file, 'portfolio/content', 'image');
    const imageUrl = result.url;

    let content = await SiteContent.findOne();

    // Delete old hero image from Cloudinary if it was a Cloudinary URL
    if (content && content.heroImage && content.heroImage.includes('cloudinary')) {
      try {
        const oldPublicId = content.heroImage.split('/').slice(-2).join('/').split('.')[0];
        if (oldPublicId) await deleteFromCloudinary(oldPublicId, 'image');
      } catch (_) { /* best-effort cleanup */ }
    }

    if (!content) {
      content = new SiteContent({ heroImage: imageUrl });
    } else {
      content.heroImage = imageUrl;
    }

    await content.save();
    res.json({ message: 'Hero image uploaded', heroImage: imageUrl });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/content/about-images/:index  (admin)
 * Remove a single about image by index (also deletes from Cloudinary).
 */
exports.deleteAboutImage = async (req, res, next) => {
  try {
    const { index } = req.params;
    const idx = parseInt(index, 10);

    let content = await SiteContent.findOne();
    if (!content) {
      return res.status(404).json({ message: 'Content not found.' });
    }
    if (isNaN(idx) || idx < 0 || idx >= content.aboutImages.length) {
      return res.status(400).json({ message: 'Invalid image index.' });
    }

    const imageUrl = content.aboutImages[idx];

    // Delete from Cloudinary if it's a Cloudinary URL
    if (imageUrl && imageUrl.includes('cloudinary')) {
      try {
        const oldPublicId = imageUrl.split('/').slice(-2).join('/').split('.')[0];
        if (oldPublicId) await deleteFromCloudinary(oldPublicId, 'image');
      } catch (_) { /* best-effort cleanup */ }
    }

    content.aboutImages.splice(idx, 1);
    await content.save();
    res.json({ message: 'About image removed', aboutImages: content.aboutImages });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/content/hero-image  (admin)
 * Remove the hero image (also deletes from Cloudinary).
 */
exports.deleteHeroImage = async (req, res, next) => {
  try {
    let content = await SiteContent.findOne();
    if (!content) {
      return res.status(404).json({ message: 'Content not found.' });
    }

    // Delete from Cloudinary if it's a Cloudinary URL
    if (content.heroImage && content.heroImage.includes('cloudinary')) {
      try {
        const oldPublicId = content.heroImage.split('/').slice(-2).join('/').split('.')[0];
        if (oldPublicId) await deleteFromCloudinary(oldPublicId, 'image');
      } catch (_) { /* best-effort cleanup */ }
    }

    content.heroImage = '';
    await content.save();
    res.json({ message: 'Hero image removed', heroImage: '' });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/content/about-images  (admin)  – multer array max 3
 */
exports.uploadAboutImages = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No image files uploaded.' });
    }

    // Upload all files to Cloudinary
    const uploadPromises = req.files.map((f) => uploadToCloudinary(f, 'portfolio/content', 'image'));
    const results = await Promise.all(uploadPromises);
    const newImages = results.map((r) => r.url);

    let content = await SiteContent.findOne();
    if (!content) {
      content = new SiteContent({ aboutImages: newImages });
    } else {
      content.aboutImages = [...content.aboutImages, ...newImages];
    }

    await content.save();
    res.json({ message: 'About images uploaded', aboutImages: content.aboutImages });
  } catch (err) {
    next(err);
  }
};
