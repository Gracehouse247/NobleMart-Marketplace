const express = require('express');
const router = express.Router();
const propertyController = require('../controllers/propertyController');
const { authenticate, authorize } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, `prop-${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`)
});
const upload = multer({ storage });

router.get('/', propertyController.getProperties);
router.get('/:slug', propertyController.getPropertyBySlug);
router.post('/add', authenticate, authorize('vendor'), upload.array('images', 10), propertyController.createProperty);

module.exports = router;
