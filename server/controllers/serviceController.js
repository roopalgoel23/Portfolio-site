const Service = require('../models/Service');

/**
 * GET /api/services
 */
exports.getServices = async (_req, res, next) => {
  try {
    const services = await Service.find().sort({ order: 1, createdAt: 1 });
    res.json(services);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/services  (admin)
 */
exports.createService = async (req, res, next) => {
  try {
    const { title, description, priceRange, icon, order } = req.body;
    if (!title) return res.status(400).json({ message: 'Title is required.' });

    const service = await Service.create({ title, description, priceRange, icon, order });
    res.status(201).json(service);
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/services/:id  (admin)
 */
exports.updateService = async (req, res, next) => {
  try {
    const { title, description, priceRange, icon, order } = req.body;

    const service = await Service.findByIdAndUpdate(
      req.params.id,
      { title, description, priceRange, icon, order },
      { new: true, runValidators: true }
    );

    if (!service) return res.status(404).json({ message: 'Service not found.' });
    res.json(service);
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/services/:id  (admin)
 */
exports.deleteService = async (req, res, next) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);
    if (!service) return res.status(404).json({ message: 'Service not found.' });
    res.json({ message: 'Service deleted.' });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/services/reorder  (admin)
 * Body: { order: [{ id, order }, ...] }
 */
exports.reorderServices = async (req, res, next) => {
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

    await Service.bulkWrite(ops);
    res.json({ message: 'Services reordered.' });
  } catch (err) {
    next(err);
  }
};
