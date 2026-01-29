const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/vendor/all', authenticate, authorize('vendor'), orderController.getVendorOrders);
router.put('/vendor/status/:orderId', authenticate, authorize('vendor'), orderController.updateOrderStatus);
router.post('/create', authenticate, orderController.createOrder);
router.get('/my-orders', authenticate, orderController.getCustomerOrders);

module.exports = router;
