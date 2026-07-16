const express = require('express');
const router  = express.Router();

const contactController = require('../controllers/contactController');

// Public
router.post('/contact', contactController.sendContact);

module.exports = router;
