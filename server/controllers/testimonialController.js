const Testimonial = require('../models/Testimonial');

/**
 * GET /api/testimonials
 */
exports.getTestimonials = async (_req, res, next) => {
  try {
    const testimonials = await Testimonial.find().sort({ order: 1, createdAt: 1 });
    res.json(testimonials);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/testimonials  (admin)
 */
exports.createTestimonial = async (req, res, next) => {
  try {
    const { clientName, occasion, rating, review, photo, order } = req.body;
    if (!clientName) return res.status(400).json({ message: 'Client name is required.' });

    const testimonial = await Testimonial.create({
      clientName, occasion, rating, review, photo, order
    });
    res.status(201).json(testimonial);
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/testimonials/:id  (admin)
 */
exports.updateTestimonial = async (req, res, next) => {
  try {
    const { clientName, occasion, rating, review, photo, order } = req.body;

    const testimonial = await Testimonial.findByIdAndUpdate(
      req.params.id,
      { clientName, occasion, rating, review, photo, order },
      { new: true, runValidators: true }
    );

    if (!testimonial) return res.status(404).json({ message: 'Testimonial not found.' });
    res.json(testimonial);
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/testimonials/:id  (admin)
 */
exports.deleteTestimonial = async (req, res, next) => {
  try {
    const testimonial = await Testimonial.findByIdAndDelete(req.params.id);
    if (!testimonial) return res.status(404).json({ message: 'Testimonial not found.' });
    res.json({ message: 'Testimonial deleted.' });
  } catch (err) {
    next(err);
  }
};
