const db = require('../db');

exports.getVendorOrders = async (req, res) => {
    try {
        const userId = req.user.id;

        // Get Vendor ID
        const [vendors] = await db.query('SELECT id FROM vendors WHERE user_id = ?', [userId]);
        if (vendors.length === 0) return res.status(404).json({ message: 'Vendor profile not found' });
        const vendorId = vendors[0].id;

        const [orders] = await db.query(
            `SELECT o.*, oi.quantity, oi.unit_price, p.name as product_name, p.images, u.full_name as customer_name
             FROM orders o
             JOIN order_items oi ON o.id = oi.order_id
             JOIN products p ON oi.product_id = p.id
             JOIN users u ON o.user_id = u.id
             WHERE p.vendor_id = ?
             ORDER BY o.created_at DESC`,
            [vendorId]
        );

        res.json(orders);
    } catch (error) {
        console.error('Get Vendor Orders Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.updateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;
        const userId = req.user.id;

        // Verify that at least one item in the order belongs to this vendor
        const [ownership] = await db.query(
            `SELECT oi.id FROM order_items oi 
             JOIN products p ON oi.product_id = p.id 
             JOIN vendors v ON p.vendor_id = v.id
             WHERE oi.order_id = ? AND v.user_id = ?`,
            [orderId, userId]
        );

        if (ownership.length === 0) return res.status(403).json({ message: 'Unauthorized' });

        await db.query('UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [status, orderId]);

        // Logic for wallet credits could go here if status changed to 'delivered'

        res.json({ message: 'Order status updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.createOrder = async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const userId = req.user ? req.user.id : null;
        const { shipping_name, shipping_phone, shipping_address, items } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ message: 'Cart is empty' });
        }

        const vendorOrders = {};
        items.forEach(item => {
            if (!vendorOrders[item.vendor_id]) {
                vendorOrders[item.vendor_id] = {
                    vendor_id: item.vendor_id,
                    total: 0,
                    items: []
                };
            }
            vendorOrders[item.vendor_id].items.push(item);
            vendorOrders[item.vendor_id].total += (item.price * item.quantity);
        });

        const orderIds = [];
        for (const vId in vendorOrders) {
            const vOrder = vendorOrders[vId];

            const [orderResult] = await connection.query(
                `INSERT INTO orders (user_id, vendor_id, total_amount, shipping_address, status, payment_status) 
                 VALUES (?, ?, ?, ?, 'pending', 'pending')`,
                [userId || 1, vOrder.vendor_id, vOrder.total, `${shipping_name}, ${shipping_phone}, ${shipping_address}`]
            );

            const orderId = orderResult.insertId;
            orderIds.push(orderId);

            for (const item of vOrder.items) {
                await connection.query(
                    'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
                    [orderId, item.id, item.quantity, item.price]
                );
            }
        }

        // 3. Initialize Paystack
        const { initializePayment } = require('../utils/payment');
        const totalToPay = items.reduce((sum, i) => sum + (i.price * i.quantity), 0);

        const payLink = await initializePayment(
            req.user?.email || 'guest@noblemart.com',
            totalToPay,
            { order_ids: orderIds }
        );

        await connection.commit();
        res.status(201).json({
            message: 'Order initialized',
            orders: orderIds,
            payment_url: payLink.data.authorization_url,
            reference: payLink.data.reference
        });

    } catch (error) {
        await connection.rollback();
        console.error('Create Order Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    } finally {
        connection.release();
    }
};

exports.getCustomerOrders = async (req, res) => {
    try {
        const userId = req.user.id;
        const [orders] = await db.query(
            `SELECT o.*, v.shop_name 
             FROM orders o 
             JOIN vendors v ON o.vendor_id = v.id 
             WHERE o.user_id = ? 
             ORDER BY o.created_at DESC`,
            [userId]
        );

        // Fetch items for each order
        for (let order of orders) {
            const [items] = await db.query(
                `SELECT oi.*, p.name, p.images 
                 FROM order_items oi 
                 JOIN products p ON oi.product_id = p.id 
                 WHERE oi.order_id = ?`,
                [order.id]
            );
            order.items = items;
        }

        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
