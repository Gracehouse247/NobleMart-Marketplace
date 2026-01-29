const db = require('../db');

exports.getAdminStats = async (req, res) => {
    try {
        const [totalVendors] = await db.query('SELECT COUNT(*) as count FROM vendors');
        const [pendingVendors] = await db.query('SELECT COUNT(*) as count FROM vendors WHERE status = "pending"');
        const [totalProducts] = await db.query('SELECT COUNT(*) as count FROM products');
        const [totalOrders] = await db.query('SELECT COUNT(*) as count FROM orders');
        const [totalRevenue] = await db.query('SELECT SUM(total_amount) as total FROM orders WHERE status = "delivered"');

        res.json({
            total_vendors: totalVendors[0].count,
            pending_vendors: pendingVendors[0].count,
            total_products: totalProducts[0].count,
            total_orders: totalOrders[0].count,
            total_revenue: totalRevenue[0].total || 0
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getPendingVendors = async (req, res) => {
    try {
        const [vendors] = await db.query(
            `SELECT v.*, u.full_name, u.email 
             FROM vendors v 
             JOIN users u ON v.user_id = u.id 
             WHERE v.status = 'pending' 
             ORDER BY v.created_at ASC`
        );
        res.json(vendors);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.verifyVendor = async (req, res) => {
    try {
        const { vendorId } = req.params;
        const { status, notes } = req.body; // 'active' or 'rejected'

        if (!['active', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        await db.query(
            'UPDATE vendors SET status = ?, verification_notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [status, notes, vendorId]
        );

        res.json({ message: `Vendor ${status} successfully` });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getAllVendors = async (req, res) => {
    try {
        const [vendors] = await db.query(
            `SELECT v.*, u.full_name, u.email 
             FROM vendors v 
             JOIN users u ON v.user_id = u.id 
             ORDER BY v.created_at DESC`
        );
        res.json(vendors);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
