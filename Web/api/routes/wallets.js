const express = require('express');
const router = express.Router();
const walletController = require('../controllers/walletController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/details', authenticate, authorize('vendor'), walletController.getWalletDetails);
router.post('/withdraw', authenticate, authorize('vendor'), walletController.requestWithdrawal);

module.exports = router;
