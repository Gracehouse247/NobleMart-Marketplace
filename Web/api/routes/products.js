const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticate, authorize } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Multer Config for Products
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, `prod-${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`)
});
const upload = multer({ storage });

// Public Routes
router.get('/', productController.getProducts);
router.get('/:slug', productController.getProductBySlug);

// Vendor Routes
router.get('/vendor/all', authenticate, authorize('vendor'), productController.getVendorProducts);
router.post('/vendor/add', authenticate, authorize('vendor'), upload.array('images', 5), productController.createProduct);
router.put('/vendor/:id', authenticate, authorize('vendor'), productController.updateProduct);
router.delete('/vendor/:id', authenticate, authorize('vendor'), productController.deleteProduct);

module.exports = router;
