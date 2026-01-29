const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');
const { authenticate, authorize } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/blog/'),
    filename: (req, file, cb) => cb(null, `blog-${Date.now()}${path.extname(file.originalname)}`)
});
const upload = multer({ storage });

router.get('/', blogController.getPosts);
router.get('/:slug', blogController.getPostBySlug);
router.post('/add', authenticate, authorize('admin'), upload.single('featured_image'), blogController.createPost);

module.exports = router;
