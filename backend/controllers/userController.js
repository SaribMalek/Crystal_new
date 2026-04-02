const pool = require('../config/db');

exports.getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const offset = (page - 1) * limit;
    let where = ['role = "user"'];
    let params = [];
    if (search) { where.push('(name LIKE ? OR email LIKE ?)'); params.push(`%${search}%`, `%${search}%`); }
    const [rows] = await pool.query(
      `SELECT id, name, email, phone, is_active, created_at FROM users WHERE ${where.join(' AND ')} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), parseInt(offset)]
    );
    const [count] = await pool.query(`SELECT COUNT(*) as total FROM users WHERE ${where.join(' AND ')}`, params);
    res.json({ success: true, users: rows, total: count[0].total });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.toggleUserStatus = async (req, res) => {
  try {
    await pool.query('UPDATE users SET is_active = NOT is_active WHERE id = ? AND role = "user"', [req.params.id]);
    res.json({ success: true, message: 'User status updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, is_active FROM users WHERE id = ? AND role = "user" LIMIT 1',
      [req.params.id]
    );

    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (rows[0].is_active) {
      return res.status(400).json({
        success: false,
        message: 'Deactivate the user first before deleting the account',
      });
    }

    await pool.query('DELETE FROM users WHERE id = ? AND role = "user"', [req.params.id]);
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getWishlist = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.*, c.name as category_name FROM wishlist w
       JOIN products p ON w.product_id = p.id
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE w.user_id = ? AND p.is_active = 1`,
      [req.user.id]
    );
    res.json({ success: true, wishlist: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.toggleWishlist = async (req, res) => {
  try {
    const [existing] = await pool.query('SELECT id FROM wishlist WHERE user_id = ? AND product_id = ?', [req.user.id, req.params.productId]);
    if (existing.length) {
      await pool.query('DELETE FROM wishlist WHERE user_id = ? AND product_id = ?', [req.user.id, req.params.productId]);
      return res.json({ success: true, action: 'removed' });
    }
    await pool.query('INSERT INTO wishlist (user_id, product_id) VALUES (?, ?)', [req.user.id, req.params.productId]);
    res.json({ success: true, action: 'added' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAddresses = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC', [req.user.id]);
    res.json({ success: true, addresses: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.addAddress = async (req, res) => {
  try {
    const { type, full_name, phone, address_line1, address_line2, city, state, postal_code, country, is_default } = req.body;
    if (is_default) await pool.query('UPDATE addresses SET is_default = 0 WHERE user_id = ?', [req.user.id]);
    const [result] = await pool.query(
      'INSERT INTO addresses (user_id, type, full_name, phone, address_line1, address_line2, city, state, postal_code, country, is_default) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [req.user.id, type || 'shipping', full_name, phone, address_line1, address_line2, city, state, postal_code, country || 'India', is_default ? 1 : 0]
    );
    res.status(201).json({ success: true, message: 'Address added', id: result.insertId });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteAddress = async (req, res) => {
  try {
    await pool.query('DELETE FROM addresses WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    res.json({ success: true, message: 'Address deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
