const db = require('../db');

exports.submitKYC = async (req, res) => {
    try {
        const { kyc_type, kyc_number } = req.body;
        const document_url = req.file ? `/uploads/${req.file.filename}` : null;
        const userId = req.user.id;

        // Find vendor by user_id
        const [vendors] = await db.query('SELECT id FROM vendors WHERE user_id = ?', [userId]);
        if (vendors.length === 0) return res.status(404).json({ message: 'Vendor profile not found' });

        const vendorId = vendors[0].id;
        const kycData = JSON.stringify({
            type: kyc_type,
            number: kyc_number,
            document: document_url,
            submitted_at: new Date()
        });

        await db.query(
            'UPDATE vendors SET kyc_data = ?, status = ? WHERE id = ?',
            [kycData, 'pending', vendorId]
        );

        res.json({ message: 'KYC documents submitted successfully. Verification is pending.' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getVerificationStatus = async (req, res) => {
    try {
        const userId = req.user.id;
        const [vendors] = await db.query('SELECT status, verification_notes, kyc_data FROM vendors WHERE user_id = ?', [userId]);

        if (vendors.length === 0) return res.status(404).json({ message: 'Vendor profile not found' });

        res.json({
            status: vendors[0].status,
            notes: vendors[0].verification_notes,
            kyc: vendors[0].kyc_data
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.adminListPending = async (req, res) => {
    try {
        const [pending] = await db.query(
            `SELECT v.id, v.shop_name, v.status, v.kyc_data, u.full_name, u.email 
             FROM vendors v 
             JOIN users u ON v.user_id = u.id 
             WHERE v.status = 'pending'`
        );
        res.json(pending);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.adminReviewVendor = async (req, res) => {
    try {
        const { vendorId } = req.params;
        const { status, remarks } = req.body;

        if (!['active', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status. Use active or rejected.' });
        }

        await db.query(
            'UPDATE vendors SET status = ?, verification_notes = ? WHERE id = ?',
            [status, remarks, vendorId]
        );

        res.json({ message: `Vendor has been ${status}` });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getDashboardStats = async (req, res) => {
    try {
        const userId = req.user.id;

        const [vendors] = await db.query(
            'SELECT id, status, verification_notes, shop_name FROM vendors WHERE user_id = ?',
            [userId]
        );

        if (vendors.length === 0) {
            return res.status(404).json({ message: 'Vendor profile not found' });
        }

        const vendor = vendors[0];

        // Get real stats
        const [productCount] = await db.query('SELECT COUNT(*) as count FROM products WHERE vendor_id = ?', [vendor.id]);
        const [orderCount] = await db.query('SELECT COUNT(*) as count FROM orders WHERE vendor_id = ? AND status = "pending"', [vendor.id]);
        const [revenue] = await db.query('SELECT SUM(total_amount) as total FROM orders WHERE vendor_id = ? AND payment_status = "paid"', [vendor.id]);

        const stats = {
            status: vendor.status,
            verification_notes: vendor.verification_notes,
            shop_name: vendor.shop_name,
            revenue: revenue[0].total || 0,
            pending_orders: orderCount[0].count || 0,
            total_products: productCount[0].count || 0,
            rating: 4.8
        };

        res.json(stats);

    } catch (error) {
        console.error('Stats Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.promoteProduct = async (req, res) => {
    try {
        const { productId, durationDays, amount } = req.body;
        const userId = req.user.id;
        const promotionId = require('uuid').v4();

        // Verify vendor owns product
        const [products] = await db.query(
            'SELECT p.id, v.id as vendor_id FROM products p JOIN vendors v ON p.vendor_id = v.id WHERE p.id = ? AND v.user_id = ?',
            [productId, userId]
        );

        if (products.length === 0) {
            return res.status(403).json({ message: 'Unauthorized or product not found' });
        }

        const vendorId = products[0].vendor_id;

        // Check Wallet Balance
        const [wallets] = await db.query('SELECT id, balance FROM wallets WHERE user_id = ?', [userId]);
        if (wallets[0].balance < amount) {
            return res.status(400).json({ message: 'Insufficient balance' });
        }

        // Process Transaction
        await db.query('UPDATE wallets SET balance = balance - ? WHERE user_id = ?', [amount, userId]);

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + parseInt(durationDays));

        await db.query(
            'UPDATE products SET is_promoted = TRUE, promotion_expires_at = ? WHERE id = ?',
            [expiresAt, productId]
        );

        await db.query(
            'INSERT INTO promotion_logs (id, product_id, vendor_id, amount_paid, duration_days) VALUES (?, ?, ?, ?, ?)',
            [promotionId, productId, vendorId, amount, durationDays]
        );

        res.json({ message: 'Product promoted successfully!', expiresAt });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
