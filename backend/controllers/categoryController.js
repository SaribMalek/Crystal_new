const pool = require('../config/db');

exports.getCategories = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT c.*, COUNT(p.id) as product_count
       FROM categories c LEFT JOIN products p ON c.id = p.category_id AND p.is_active = 1
       WHERE c.is_active = 1 GROUP BY c.id ORDER BY c.sort_order, c.name`
    );
    res.json({ success: true, categories: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getCategory = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM categories WHERE slug = ?', [req.params.slug]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Category not found' });
    res.json({ success: true, category: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { name, description, parent_id, sort_order } = req.body;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const image = req.file ? `/uploads/products/${req.file.filename}` : null;
    const [result] = await pool.query(
      'INSERT INTO categories (name, slug, description, image, parent_id, sort_order) VALUES (?, ?, ?, ?, ?, ?)',
      [name, slug, description, image, parent_id || null, sort_order || 0]
    );
    res.status(201).json({ success: true, message: 'Category created', id: result.insertId });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { name, description, sort_order, is_active } = req.body;
    const image = req.file ? `/uploads/products/${req.file.filename}` : undefined;
    const updates = ['name = ?', 'description = ?', 'sort_order = ?', 'is_active = ?'];
    const values = [name, description, sort_order || 0, is_active !== undefined ? is_active : 1];
    if (image) { updates.push('image = ?'); values.push(image); }
    values.push(req.params.id);
    await pool.query(`UPDATE categories SET ${updates.join(', ')} WHERE id = ?`, values);
    res.json({ success: true, message: 'Category updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    await pool.query('UPDATE categories SET is_active = 0 WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
