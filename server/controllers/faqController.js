const FAQ = require('../models/FAQ');

/**
 * GET /api/faqs
 */
exports.getFAQs = async (_req, res, next) => {
  try {
    const faqs = await FAQ.find().sort({ order: 1, createdAt: 1 });
    res.json(faqs);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/faqs  (admin)
 */
exports.createFAQ = async (req, res, next) => {
  try {
    const { question, answer, order } = req.body;
    if (!question || !answer) {
      return res.status(400).json({ message: 'Question and answer are required.' });
    }

    const faq = await FAQ.create({ question, answer, order });
    res.status(201).json(faq);
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/faqs/:id  (admin)
 */
exports.updateFAQ = async (req, res, next) => {
  try {
    const { question, answer, order } = req.body;

    const faq = await FAQ.findByIdAndUpdate(
      req.params.id,
      { question, answer, order },
      { new: true, runValidators: true }
    );

    if (!faq) return res.status(404).json({ message: 'FAQ not found.' });
    res.json(faq);
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/faqs/:id  (admin)
 */
exports.deleteFAQ = async (req, res, next) => {
  try {
    const faq = await FAQ.findByIdAndDelete(req.params.id);
    if (!faq) return res.status(404).json({ message: 'FAQ not found.' });
    res.json({ message: 'FAQ deleted.' });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/faqs/reorder  (admin)
 */
exports.reorderFAQs = async (req, res, next) => {
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

    await FAQ.bulkWrite(ops);
    res.json({ message: 'FAQs reordered.' });
  } catch (err) {
    next(err);
  }
};
