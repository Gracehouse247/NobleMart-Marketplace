const express = require('express');
const router = express.Router();
const vendorController = require('../controllers/vendorController');
const { authenticate, authorize } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, `kyc-${Date.now()}${path.extname(file.originalname)}`)
});
const upload = multer({ storage });

// Vendor Endpoints
router.post('/submit-kyc', authenticate, authorize('vendor'), upload.single('document'), vendorController.submitKYC);
router.get('/verification-status', authenticate, authorize('vendor'), vendorController.getVerificationStatus);
router.get('/stats', authenticate, authorize('vendor'), vendorController.getDashboardStats);
router.post('/promote-product', authenticate, authorize('vendor'), vendorController.promoteProduct);

// Admin Endpoints
router.get('/admin/pending', authenticate, authorize('admin'), vendorController.adminListPending);
router.post('/admin/review/:vendorId', authenticate, authorize('admin'), vendorController.adminReviewVendor);

module.exports = router;
