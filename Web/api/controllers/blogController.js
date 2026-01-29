const db = require('../db');

exports.getPosts = async (req, res) => {
    try {
        const { category, search } = req.query;
        let query = 'SELECT p.*, u.full_name as author_name FROM blog_posts p JOIN users u ON p.author_id = u.id WHERE p.status = "published"';
        const params = [];

        if (category) {
            query += ' AND p.category = ?';
            params.push(category);
        }

        if (search) {
            query += ' AND (p.title LIKE ? OR p.content LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }

        query += ' ORDER BY p.created_at DESC';

        const [posts] = await db.query(query, params);
        res.json(posts);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getPostBySlug = async (req, res) => {
    try {
        const [posts] = await db.query(
            'SELECT p.*, u.full_name as author_name FROM blog_posts p JOIN users u ON p.author_id = u.id WHERE p.slug = ? AND p.status = "published"',
            [req.params.slug]
        );

        if (posts.length === 0) return res.status(404).json({ message: 'Post not found' });
        res.json(posts[0]);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.createPost = async (req, res) => {
    try {
        const { title, content, excerpt, category, tags, status } = req.body;
        const author_id = req.user.id;
        const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now();
        const featured_image = req.file ? `/uploads/blog/${req.file.filename}` : null;

        await db.query(
            'INSERT INTO blog_posts (author_id, title, slug, content, excerpt, featured_image, category, tags, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [author_id, title, slug, content, excerpt, featured_image, category, tags, status || 'published']
        );

        res.status(201).json({ message: 'Post created successfully', slug });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
