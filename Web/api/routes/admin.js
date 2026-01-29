const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/stats', authenticate, authorize('admin'), adminController.getAdminStats);
router.get('/vendors/pending', authenticate, authorize('admin'), adminController.getPendingVendors);
router.get('/vendors/all', authenticate, authorize('admin'), adminController.getAllVendors);
router.put('/vendors/verify/:vendorId', authenticate, authorize('admin'), adminController.verifyVendor);

module.exports = router;
