const SiteContent = require('../models/SiteContent');

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

    const imageUrl = `/uploads/${req.file.filename}`;

    let content = await SiteContent.findOne();
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
 * POST /api/content/about-images  (admin)  – multer array max 3
 */
exports.uploadAboutImages = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No image files uploaded.' });
    }

    const newImages = req.files.map((f) => `/uploads/${f.filename}`);

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
