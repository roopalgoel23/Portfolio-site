const express    = require('express');
const router     = express.Router();

const storageController = require('../controllers/storageController');
const { requireAuth }   = require('../middleware/auth');
const { uploadSingleFile, checkCloudinaryLimits } = require('../middleware/upload');

// All storage routes require admin auth
router.use(requireAuth);

// Storage usage stats
router.get('/storage/usage', storageController.getUsage);

// List resources with filtering & sorting
router.get('/storage/resources', storageController.getResources);

// Delete a resource (wildcard to capture publicIds with slashes)
router.delete('/storage/resources/*', storageController.deleteResource);

// Compress media
router.post('/storage/compress', uploadSingleFile, checkCloudinaryLimits, storageController.compressMedia);

module.exports = router;
