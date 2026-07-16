const express = require('express');
const router  = express.Router();

const testimonialController = require('../controllers/testimonialController');
const { requireAuth }       = require('../middleware/auth');

// Public
router.get('/testimonials', testimonialController.getTestimonials);

// Admin
router.post('/testimonials',       requireAuth, testimonialController.createTestimonial);
router.put('/testimonials/:id',    requireAuth, testimonialController.updateTestimonial);
router.delete('/testimonials/:id', requireAuth, testimonialController.deleteTestimonial);

module.exports = router;
