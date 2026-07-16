const express = require('express');
const router  = express.Router();

const brideController = require('../controllers/brideController');
const { requireAuth } = require('../middleware/auth');

// Public
router.get('/brides', brideController.getBrides);

// Admin
router.post('/brides',                 requireAuth, brideController.createBride);
router.post('/brides/reorder',         requireAuth, brideController.reorderBrides);
router.patch('/brides/:id/gallery',    requireAuth, brideController.updateGallery);
router.put('/brides/:id',              requireAuth, brideController.updateBride);
router.delete('/brides/:id',           requireAuth, brideController.deleteBride);

module.exports = router;
