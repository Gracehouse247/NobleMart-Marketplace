const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyPayment } = require('../utils/payment');

router.post('/paystack', async (req, res) => {
    try {
        const hash = req.headers['x-paystack-signature'];
        // In production, we should verify the signature here

        const event = req.body;
        if (event.event === 'charge.success') {
            const reference = event.data.reference;
            const metadata = event.data.metadata;
            const orderIds = metadata.order_ids;

            // Update Orders to Paid
            await db.query(
                'UPDATE orders SET payment_status = "paid", status = "processing" WHERE id IN (?)',
                [orderIds]
            );

            // Deduct Stock
            for (const orderId of orderIds) {
                const [items] = await db.query('SELECT product_id, quantity FROM order_items WHERE order_id = ?', [orderId]);
                for (const item of items) {
                    await db.query('UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?', [item.quantity, item.product_id]);
                }
            }
        }

        res.sendStatus(200);
    } catch (error) {
        console.error('Webhook Error:', error);
        res.sendStatus(500);
    }
});

module.exports = router;
