const axios = require('axios');

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET || 'sk_test_placeholder';

exports.initializePayment = async (email, amount, metadata = {}) => {
    try {
        const response = await axios.post('https://api.paystack.co/transaction/initialize', {
            email,
            amount: amount * 100, // Paystack uses Kobo/Cent
            metadata
        }, {
            headers: {
                Authorization: `Bearer ${PAYSTACK_SECRET}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Payment initialization failed');
    }
};

exports.verifyPayment = async (reference) => {
    try {
        const response = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
            headers: {
                Authorization: `Bearer ${PAYSTACK_SECRET}`
            }
        });
        return response.data.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Payment verification failed');
    }
};
