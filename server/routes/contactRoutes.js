const express = require('express');
const router  = express.Router();

const contactController = require('../controllers/contactController');
const { requireAuth }   = require('../middleware/auth');

// Public
router.post('/contact', contactController.sendContact);

// Admin-only — manage enquiries
router.get('/enquiries', requireAuth, contactController.getEnquiries);
router.put('/enquiries/:id/read', requireAuth, contactController.markEnquiryRead);
router.delete('/enquiries/:id', requireAuth, contactController.deleteEnquiry);

module.exports = router;
