const FeaturedBride = require('../models/FeaturedBride');

/**
 * GET /api/brides
 */
exports.getBrides = async (_req, res, next) => {
  try {
    const brides = await FeaturedBride.find().sort({ order: 1, createdAt: 1 });
    res.json(brides);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/brides  (admin)
 */
exports.createBride = async (req, res, next) => {
  try {
    const { name, occasion, image, gallery, thumbnailId, order } = req.body;
    if (!name) return res.status(400).json({ message: 'Name is required.' });

    const bride = await FeaturedBride.create({ name, occasion, image, gallery, thumbnailId, order });
    res.status(201).json(bride);
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/brides/:id  (admin)
 */
exports.updateBride = async (req, res, next) => {
  try {
    const { name, occasion, image, gallery, thumbnailId, order } = req.body;

    const bride = await FeaturedBride.findByIdAndUpdate(
      req.params.id,
      { name, occasion, image, gallery, thumbnailId, order },
      { new: true, runValidators: true }
    );

    if (!bride) return res.status(404).json({ message: 'Featured bride not found.' });
    res.json(bride);
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/brides/:id/gallery  (admin) — add or remove gallery items
 * body: { action: 'add' | 'remove', item: {...} }  or { action: 'setThumbnail', thumbnailId }
 */
exports.updateGallery = async (req, res, next) => {
  try {
    const { action } = req.body;
    const bride = await FeaturedBride.findById(req.params.id);
    if (!bride) return res.status(404).json({ message: 'Featured bride not found.' });

    if (action === 'add') {
      const { items } = req.body;
      const toAdd = Array.isArray(items) ? items : [req.body.item];
      toAdd.forEach((it) => {
        if (it && it.src) bride.gallery.push({ type: it.type || 'image', src: it.src, videoUrl: it.videoUrl || '' });
      });
      // Set first gallery item as thumbnail if none set
      if (!bride.thumbnailId && bride.gallery.length > 0) {
        bride.thumbnailId = bride.gallery[0]._id;
        bride.image = bride.gallery[0].src;
      }
    } else if (action === 'remove') {
      const { itemId } = req.body;
      bride.gallery = bride.gallery.filter((g) => g._id.toString() !== itemId);
      // If removed item was thumbnail, pick a new one
      if (bride.thumbnailId && bride.thumbnailId.toString() === itemId) {
        bride.thumbnailId = bride.gallery.length > 0 ? bride.gallery[0]._id : null;
        bride.image = bride.gallery.length > 0 ? bride.gallery[0].src : '';
      }
    } else if (action === 'setThumbnail') {
      const { itemId } = req.body;
      const item = bride.gallery.id(itemId);
      if (item) {
        bride.thumbnailId = item._id;
        bride.image = item.src;
      }
    }

    await bride.save();
    res.json(bride);
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/brides/:id  (admin)
 */
exports.deleteBride = async (req, res, next) => {
  try {
    const bride = await FeaturedBride.findByIdAndDelete(req.params.id);
    if (!bride) return res.status(404).json({ message: 'Featured bride not found.' });
    res.json({ message: 'Featured bride deleted.' });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/brides/reorder  (admin)
 */
exports.reorderBrides = async (req, res, next) => {
  try {
    const { order } = req.body;
    if (!Array.isArray(order)) {
      return res.status(400).json({ message: 'Expected { order: [{ id, order }] }' });
    }

    const ops = order.map(({ id, order: newOrder }) => ({
      updateOne: {
        filter: { _id: id },
        update: { order: newOrder }
      }
    }));

    await FeaturedBride.bulkWrite(ops);
    res.json({ message: 'Brides reordered.' });
  } catch (err) {
    next(err);
  }
};
