const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
require('dotenv').config();

const app = express();

// Middleware
app.use(compression()); // Compress all responses
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Static files with 7-day cache
app.use('/uploads', express.static('uploads', {
    maxAge: '7d',
    etag: true
}));

// Routes
app.use('/auth', require('./routes/auth'));
app.use('/categories', require('./routes/categories'));
app.use('/products', require('./routes/products'));
app.use('/content', require('./routes/content'));
app.use('/seo', require('./routes/seo'));
app.use('/properties', require('./routes/properties'));
app.use('/vendors', require('./routes/vendors'));
app.use('/orders', require('./routes/orders'));
app.use('/wallets', require('./routes/wallets'));
app.use('/admin', require('./routes/admin'));
app.use('/webhooks', require('./routes/webhooks'));

// Base Route
app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to NobleMart API',
        version: '1.0.0',
        status: 'Operational'
    });
});

// Health Check
app.get('/health', async (req, res) => {
    try {
        const db = require('./db');
        const [rows] = await db.query('SELECT 1 + 1 AS result');
        res.json({ status: 'OK', database: 'Connected', timestamp: new Date() });
    } catch (error) {
        res.status(500).json({ status: 'Error', error: error.message });
    }
});

// Error Handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : {}
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`NobleMart API is running on port ${PORT}`);
});

module.exports = app; // For cPanel Node.js Selector
