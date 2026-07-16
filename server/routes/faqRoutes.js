const express = require('express');
const router  = express.Router();

const faqController = require('../controllers/faqController');
const { requireAuth } = require('../middleware/auth');

// Public
router.get('/faqs', faqController.getFAQs);

// Admin
router.post('/faqs',          requireAuth, faqController.createFAQ);
router.post('/faqs/reorder',  requireAuth, faqController.reorderFAQs);
router.put('/faqs/:id',       requireAuth, faqController.updateFAQ);
router.delete('/faqs/:id',    requireAuth, faqController.deleteFAQ);

module.exports = router;
