const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

exports.register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ success: false, message: 'Please provide name, email and password' });

    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length) return res.status(400).json({ success: false, message: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 12);
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, phone) VALUES (?, ?, ?, ?)',
      [name, email, hashed, phone || null]
    );

    const token = signToken(result.insertId);
    res.status(201).json({
      success: true,
      token,
      user: { id: result.insertId, name, email, role: 'user' },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Please provide email and password' });

    const [rows] = await pool.query('SELECT * FROM users WHERE email = ? AND is_active = 1', [email]);
    if (!rows.length) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const token = signToken(user.id);
    const { password: _, ...safeUser } = user;
    res.json({ success: true, token, user: safeUser });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, avatar } = req.body;
    await pool.query('UPDATE users SET name = ?, phone = ?, avatar = ? WHERE id = ?', [
      name,
      phone || null,
      avatar || null,
      req.user.id,
    ]);
    const [rows] = await pool.query('SELECT id, name, email, role, phone, avatar, is_active, created_at, updated_at FROM users WHERE id = ?', [req.user.id]);
    res.json({ success: true, message: 'Profile updated', user: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const [rows] = await pool.query('SELECT password FROM users WHERE id = ?', [req.user.id]);
    const match = await bcrypt.compare(currentPassword, rows[0].password);
    if (!match) return res.status(400).json({ success: false, message: 'Current password incorrect' });

    const hashed = await bcrypt.hash(newPassword, 12);
    await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashed, req.user.id]);
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
