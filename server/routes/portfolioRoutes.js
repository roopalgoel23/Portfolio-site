const express = require('express');
const router  = express.Router();

const portfolioController = require('../controllers/portfolioController');
const { requireAuth }     = require('../middleware/auth');

// Public
router.get('/portfolio', portfolioController.getPortfolio);

// Admin
router.post('/portfolio',          requireAuth, portfolioController.createPortfolioItem);
router.post('/portfolio/reorder',  requireAuth, portfolioController.reorderPortfolio);
router.put('/portfolio/:id',       requireAuth, portfolioController.updatePortfolioItem);
router.delete('/portfolio/:id',    requireAuth, portfolioController.deletePortfolioItem);

module.exports = router;
