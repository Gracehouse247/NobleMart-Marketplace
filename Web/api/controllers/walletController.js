const db = require('../db');

exports.getWalletDetails = async (req, res) => {
    try {
        const userId = req.user.id;

        // 1. Get Wallet
        const [wallets] = await db.query('SELECT * FROM wallets WHERE user_id = ?', [userId]);

        if (wallets.length === 0) {
            // Create wallet if it doesn't exist (safety)
            await db.query('INSERT INTO wallets (user_id, balance) VALUES (?, 0)', [userId]);
            return res.json({ balance: 0, pending_balance: 0, transactions: [] });
        }

        const wallet = wallets[0];

        // 2. Get Transactions
        const [transactions] = await db.query(
            'SELECT * FROM wallet_transactions WHERE wallet_id = ? ORDER BY created_at DESC LIMIT 50',
            [wallet.id]
        );

        res.json({
            balance: wallet.balance,
            pending_balance: wallet.pending_balance || 0,
            transactions: transactions
        });
    } catch (error) {
        console.error('Get Wallet Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.requestWithdrawal = async (req, res) => {
    try {
        const userId = req.user.id;
        const { amount, bank_name, account_number, account_name } = req.body;

        if (amount < 1000) {
            return res.status(400).json({ message: 'Minimum withdrawal amount is ₦1,000' });
        }

        const [wallets] = await db.query('SELECT * FROM wallets WHERE user_id = ?', [userId]);
        if (wallets.length === 0 || wallets[0].balance < amount) {
            return res.status(400).json({ message: 'Insufficient balance' });
        }

        const wallet = wallets[0];

        // 1. Create Transaction (Pending Withdrawal)
        await db.query(
            `INSERT INTO wallet_transactions (wallet_id, amount, type, status, description, metadata) 
             VALUES (?, ?, 'withdrawal', 'pending', ?, ?)`,
            [
                wallet.id,
                amount,
                `Withdrawal to ${bank_name}`,
                JSON.stringify({ account_number, account_name, bank_name })
            ]
        );

        // 2. Deduct from Balance
        await db.query('UPDATE wallets SET balance = balance - ? WHERE id = ?', [amount, wallet.id]);

        res.json({ message: 'Withdrawal request submitted successfully' });
    } catch (error) {
        console.error('Withdrawal Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
