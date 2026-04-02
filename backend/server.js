const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/users', require('./routes/users'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/coupons', require('./routes/coupons'));
app.use('/api/menus', require('./routes/menus'));

app.get('/api/health', (req, res) => res.json({ status: 'Crystal Store API running' }));
app.get('/admin', (req, res) => {
  res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/admin`);
});
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Crystal Store API running',
    frontend: process.env.FRONTEND_URL || 'http://localhost:3000',
    admin: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/admin`,
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🔮 Crystal Store API running on port ${PORT}`));
