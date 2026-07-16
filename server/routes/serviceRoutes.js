const express = require('express');
const router  = express.Router();

const serviceController = require('../controllers/serviceController');
const { requireAuth }   = require('../middleware/auth');

// Public
router.get('/services', serviceController.getServices);

// Admin
router.post('/services',          requireAuth, serviceController.createService);
router.post('/services/reorder',  requireAuth, serviceController.reorderServices);
router.put('/services/:id',       requireAuth, serviceController.updateService);
router.delete('/services/:id',    requireAuth, serviceController.deleteService);

module.exports = router;
