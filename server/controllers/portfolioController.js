const PortfolioItem = require('../models/PortfolioItem');

/**
 * GET /api/portfolio?category=
 */
exports.getPortfolio = async (req, res, next) => {
  try {
    const { category } = req.query;
    const filter = category ? { category } : {};
    const items = await PortfolioItem.find(filter).sort({ order: 1, createdAt: 1 });
    res.json(items);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/portfolio  (admin)
 */
exports.createPortfolioItem = async (req, res, next) => {
  try {
    const { type, category, src, videoUrl, caption, order } = req.body;
    if (!type || !category) {
      return res.status(400).json({ message: 'Type and category are required.' });
    }

    const item = await PortfolioItem.create({ type, category, src, videoUrl, caption, order });
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/portfolio/:id  (admin)
 */
exports.updatePortfolioItem = async (req, res, next) => {
  try {
    const { type, category, src, videoUrl, caption, order } = req.body;

    const item = await PortfolioItem.findByIdAndUpdate(
      req.params.id,
      { type, category, src, videoUrl, caption, order },
      { new: true, runValidators: true }
    );

    if (!item) return res.status(404).json({ message: 'Portfolio item not found.' });
    res.json(item);
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/portfolio/:id  (admin)
 */
exports.deletePortfolioItem = async (req, res, next) => {
  try {
    const item = await PortfolioItem.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: 'Portfolio item not found.' });
    res.json({ message: 'Portfolio item deleted.' });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/portfolio/reorder  (admin)
 */
exports.reorderPortfolio = async (req, res, next) => {
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

    await PortfolioItem.bulkWrite(ops);
    res.json({ message: 'Portfolio reordered.' });
  } catch (err) {
    next(err);
  }
};
