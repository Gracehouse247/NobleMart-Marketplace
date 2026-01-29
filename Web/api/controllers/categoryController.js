const db = require('../db');

exports.getAllCategories = async (req, res) => {
    try {
        const [categories] = await db.query(
            'SELECT * FROM categories WHERE is_active = TRUE ORDER BY display_order ASC'
        );
        res.json(categories);
    } catch (error) {
        console.error('Get Categories Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getCategoryBySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        const [categories] = await db.query(
            'SELECT * FROM categories WHERE slug = ? AND is_active = TRUE',
            [slug]
        );

        if (categories.length === 0) {
            return res.status(404).json({ message: 'Category not found' });
        }

        res.json(categories[0]);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
