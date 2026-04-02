const pool = require('../config/db');

exports.getCoupons = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM coupons ORDER BY created_at DESC');
    res.json({ success: true, coupons: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.validateCoupon = async (req, res) => {
  try {
    const { code, order_amount } = req.body;
    const [rows] = await pool.query(
      'SELECT * FROM coupons WHERE code = ? AND is_active = 1 AND (expires_at IS NULL OR expires_at > NOW()) AND (max_uses IS NULL OR used_count < max_uses)',
      [code]
    );
    if (!rows.length) return res.status(404).json({ success: false, message: 'Invalid or expired coupon' });
    const coupon = rows[0];
    if (order_amount < coupon.min_order_amount)
      return res.status(400).json({ success: false, message: `Minimum order amount is ₹${coupon.min_order_amount}` });
    const discount = coupon.type === 'percentage' ? (order_amount * coupon.value / 100) : coupon.value;
    res.json({ success: true, coupon, discount: parseFloat(discount.toFixed(2)) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createCoupon = async (req, res) => {
  try {
    const { code, type, value, min_order_amount, max_uses, expires_at } = req.body;
    await pool.query(
      'INSERT INTO coupons (code, type, value, min_order_amount, max_uses, expires_at) VALUES (?, ?, ?, ?, ?, ?)',
      [code.toUpperCase(), type, value, min_order_amount || 0, max_uses || null, expires_at || null]
    );
    res.status(201).json({ success: true, message: 'Coupon created' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateCoupon = async (req, res) => {
  try {
    const { is_active } = req.body;
    await pool.query('UPDATE coupons SET is_active = ? WHERE id = ?', [is_active ? 1 : 0, req.params.id]);
    res.json({ success: true, message: 'Coupon updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteCoupon = async (req, res) => {
  try {
    await pool.query('DELETE FROM coupons WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Coupon deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
