const db = require('../db');

exports.getProducts = async (req, res) => {
    try {
        const { category, search, minPrice, maxPrice, sort } = req.query;
        let query = `
            SELECT p.*, c.name as category_name, v.shop_name 
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            JOIN vendors v ON p.vendor_id = v.id
            WHERE p.status = 'active'
        `;
        const params = [];

        if (category) {
            query += ' AND (c.slug = ? OR c.id = ?)';
            params.push(category, category);
        }

        if (search) {
            query += ' AND (p.name LIKE ? OR p.description LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }

        if (minPrice) {
            query += ' AND p.price >= ?';
            params.push(minPrice);
        }

        if (maxPrice) {
            query += ' AND p.price <= ?';
            params.push(maxPrice);
        }

        // Sorting
        if (sort === 'price_asc') {
            query += ' ORDER BY p.price ASC';
        } else if (sort === 'price_desc') {
            query += ' ORDER BY p.price DESC';
        } else if (sort === 'newest') {
            query += ' ORDER BY p.created_at DESC';
        } else {
            query += ' ORDER BY p.is_promoted DESC, p.created_at DESC';
        }

        const [products] = await db.query(query, params);
        res.json(products);
    } catch (error) {
        console.error('Get Products Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getProductBySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        const [products] = await db.query(
            `SELECT p.*, c.name as category_name, v.shop_name, v.shop_description, v.shop_logo 
             FROM products p 
             LEFT JOIN categories c ON p.category_id = c.id 
             JOIN vendors v ON p.vendor_id = v.id 
             WHERE p.slug = ?`,
            [slug]
        );

        if (products.length === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json(products[0]);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.createProduct = async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, description, price, stock_quantity, category_id } = req.body;

        // 1. Get Vendor ID
        const [vendors] = await db.query('SELECT id FROM vendors WHERE user_id = ?', [userId]);
        if (vendors.length === 0) return res.status(404).json({ message: 'Vendor profile not found' });
        const vendorId = vendors[0].id;

        // 2. Generate Slug
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now();

        // 3. Handle Images
        const images = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];

        // 4. Insert Product
        await db.query(
            `INSERT INTO products (vendor_id, category_id, name, slug, description, price, stock_quantity, images, status) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [vendorId, category_id, name, slug, description, price, stock_quantity, JSON.stringify(images), 'active']
        );

        res.status(201).json({ message: 'Product created successfully', slug });

    } catch (error) {
        console.error('Create Product Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getVendorProducts = async (req, res) => {
    try {
        const userId = req.user.id;
        const [products] = await db.query(
            `SELECT p.*, c.name as category_name 
             FROM products p 
             LEFT JOIN categories c ON p.category_id = c.id
             JOIN vendors v ON p.vendor_id = v.id
             WHERE v.user_id = ?`,
            [userId]
        );
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const { name, description, price, stock_quantity, category_id, status } = req.body;

        // Verify ownership
        const [products] = await db.query(
            'SELECT p.id FROM products p JOIN vendors v ON p.vendor_id = v.id WHERE p.id = ? AND v.user_id = ?',
            [id, userId]
        );

        if (products.length === 0) return res.status(403).json({ message: 'Unauthorized' });

        await db.query(
            `UPDATE products SET name = ?, description = ?, price = ?, stock_quantity = ?, category_id = ?, status = ?
             WHERE id = ?`,
            [name, description, price, stock_quantity, category_id, status, id]
        );

        res.json({ message: 'Product updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // Verify ownership
        const [products] = await db.query(
            'SELECT p.id FROM products p JOIN vendors v ON p.vendor_id = v.id WHERE p.id = ? AND v.user_id = ?',
            [id, userId]
        );

        if (products.length === 0) return res.status(403).json({ message: 'Unauthorized' });

        await db.query('DELETE FROM products WHERE id = ?', [id]);

        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
