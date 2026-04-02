const pool = require('../config/db');

exports.addReview = async (req, res) => {
  try {
    const { rating, title, body } = req.body;
    const { productId } = req.params;
    const [existing] = await pool.query('SELECT id FROM reviews WHERE product_id = ? AND user_id = ?', [productId, req.user.id]);
    if (existing.length) return res.status(400).json({ success: false, message: 'You already reviewed this product' });
    await pool.query(
      'INSERT INTO reviews (product_id, user_id, rating, title, body) VALUES (?, ?, ?, ?, ?)',
      [productId, req.user.id, rating, title, body]
    );
    res.status(201).json({ success: true, message: 'Review submitted for approval' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getReviews = async (req, res) => {
  try {
    const { approved } = req.query;
    let where = 'r.product_id = ?';
    const params = [req.params.productId];
    if (approved !== undefined) { where += ' AND r.is_approved = ?'; params.push(approved === 'true' ? 1 : 0); }
    const [rows] = await pool.query(
      `SELECT r.*, u.name as user_name FROM reviews r JOIN users u ON r.user_id = u.id WHERE ${where} ORDER BY r.created_at DESC`,
      params
    );
    res.json({ success: true, reviews: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.approveReview = async (req, res) => {
  try {
    await pool.query('UPDATE reviews SET is_approved = 1 WHERE id = ?', [req.params.id]);
    // Update product rating
    const [review] = await pool.query('SELECT product_id FROM reviews WHERE id = ?', [req.params.id]);
    if (review.length) {
      const [[stats]] = await pool.query(
        'SELECT AVG(rating) as avg_rating, COUNT(*) as count FROM reviews WHERE product_id = ? AND is_approved = 1',
        [review[0].product_id]
      );
      await pool.query('UPDATE products SET rating = ?, review_count = ? WHERE id = ?',
        [stats.avg_rating || 0, stats.count, review[0].product_id]);
    }
    res.json({ success: true, message: 'Review approved' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    await pool.query('DELETE FROM reviews WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Review deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getPendingReviews = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT r.*, u.name as user_name, p.name as product_name
       FROM reviews r JOIN users u ON r.user_id = u.id JOIN products p ON r.product_id = p.id
       WHERE r.is_approved = 0 ORDER BY r.created_at DESC`
    );
    res.json({ success: true, reviews: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
