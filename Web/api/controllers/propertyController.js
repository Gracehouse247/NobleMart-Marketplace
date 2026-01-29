const db = require('../db');

exports.getProperties = async (req, res) => {
    try {
        const { type, location, minPrice, maxPrice, sort } = req.query;

        let query = `
            SELECT p.*, v.shop_name 
            FROM properties p
            JOIN vendors v ON p.vendor_id = v.id
            WHERE p.status = 'available'
        `;
        const params = [];

        if (type) {
            query += ' AND p.property_type = ?';
            params.push(type);
        }

        if (location) {
            query += ' AND p.location LIKE ?';
            params.push(`%${location}%`);
        }

        if (minPrice) {
            query += ' AND p.price >= ?';
            params.push(minPrice);
        }

        if (maxPrice) {
            query += ' AND p.price <= ?';
            params.push(maxPrice);
        }

        if (sort === 'price_asc') query += ' ORDER BY p.price ASC';
        else if (sort === 'price_desc') query += ' ORDER BY p.price DESC';
        else query += ' ORDER BY p.created_at DESC';

        const [properties] = await db.query(query, params);
        res.json(properties);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getPropertyBySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        const [properties] = await db.query(
            'SELECT p.*, v.shop_name, v.address as vendor_address FROM properties p JOIN vendors v ON p.vendor_id = v.id WHERE p.slug = ?',
            [slug]
        );

        if (properties.length === 0) return res.status(404).json({ message: 'Property not found' });
        res.json(properties[0]);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.createProperty = async (req, res) => {
    try {
        const userId = req.user.id;
        const { title, description, price, location, property_type, bedrooms, bathrooms, area_sqft, amenities } = req.body;

        const [vendors] = await db.query('SELECT id FROM vendors WHERE user_id = ?', [userId]);
        if (vendors.length === 0) return res.status(404).json({ message: 'Vendor profile not found' });
        const vendorId = vendors[0].id;

        const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now();
        const images = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];

        await db.query(
            `INSERT INTO properties (vendor_id, title, slug, description, price, location, property_type, bedrooms, bathrooms, area_sqft, images, amenities) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [vendorId, title, slug, description, price, location, property_type, bedrooms, bathrooms, area_sqft, JSON.stringify(images), JSON.stringify(amenities)]
        );

        res.status(201).json({ message: 'Property listed successfully', slug });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
