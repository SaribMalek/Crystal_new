const pool = require('../config/db');

exports.getProducts = async (req, res) => {
  try {
    const {
      page = 1, limit = 12, category, search, sort = 'created_at',
      order = 'DESC', min_price, max_price, featured, chakra
    } = req.query;

    const offset = (page - 1) * limit;
    let where = ['p.is_active = 1'];
    let params = [];

    if (category) { where.push('c.slug = ?'); params.push(category); }
    if (search) { where.push('(p.name LIKE ? OR p.description LIKE ?)'); params.push(`%${search}%`, `%${search}%`); }
    if (min_price) { where.push('p.price >= ?'); params.push(min_price); }
    if (max_price) { where.push('p.price <= ?'); params.push(max_price); }
    if (featured === 'true') { where.push('p.is_featured = 1'); }
    if (chakra) { where.push('p.chakra LIKE ?'); params.push(`%${chakra}%`); }

    const whereClause = where.length ? 'WHERE ' + where.join(' AND ') : '';
    const validSort = ['price', 'created_at', 'name', 'rating', 'review_count'].includes(sort) ? sort : 'created_at';
    const validOrder = ['ASC', 'DESC'].includes(order.toUpperCase()) ? order.toUpperCase() : 'DESC';

    const [rows] = await pool.query(
      `SELECT p.*, c.name as category_name, c.slug as category_slug
       FROM products p LEFT JOIN categories c ON p.category_id = c.id
       ${whereClause}
       ORDER BY p.${validSort} ${validOrder}
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), parseInt(offset)]
    );

    const [countRows] = await pool.query(
      `SELECT COUNT(*) as total FROM products p LEFT JOIN categories c ON p.category_id = c.id ${whereClause}`,
      params
    );

    res.json({
      success: true,
      products: rows,
      total: countRows[0].total,
      page: parseInt(page),
      pages: Math.ceil(countRows[0].total / limit),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getProduct = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.*, c.name as category_name, c.slug as category_slug
       FROM products p LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.slug = ? AND p.is_active = 1`,
      [req.params.slug]
    );
    if (!rows.length) return res.status(404).json({ success: false, message: 'Product not found' });

    const [reviews] = await pool.query(
      `SELECT r.*, u.name as user_name FROM reviews r
       JOIN users u ON r.user_id = u.id
       WHERE r.product_id = ? AND r.is_approved = 1 ORDER BY r.created_at DESC`,
      [rows[0].id]
    );

    const [related] = await pool.query(
      `SELECT p.* FROM products p WHERE p.category_id = ? AND p.id != ? AND p.is_active = 1 LIMIT 4`,
      [rows[0].category_id, rows[0].id]
    );

    res.json({ success: true, product: rows[0], reviews, related });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const {
      name, description, short_description, price, sale_price, stock, sku,
      category_id, weight, dimensions, chakra, zodiac, element, healing_properties,
      origin, is_featured
    } = req.body;

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now();
    const images = req.files ? req.files.map(f => `/uploads/products/${f.filename}`) : [];

    const [result] = await pool.query(
      `INSERT INTO products (name, slug, description, short_description, price, sale_price, stock, sku,
       category_id, images, weight, dimensions, chakra, zodiac, element, healing_properties, origin, is_featured)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, slug, description, short_description, price, sale_price || null, stock || 0, sku,
       category_id || null, JSON.stringify(images), weight, dimensions, chakra, zodiac, element,
       healing_properties, origin, is_featured ? 1 : 0]
    );

    res.status(201).json({ success: true, message: 'Product created', id: result.insertId });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const fields = req.body;
    const updates = [];
    const values = [];

    const allowed = ['name', 'description', 'short_description', 'price', 'sale_price', 'stock', 'sku',
      'category_id', 'weight', 'dimensions', 'chakra', 'zodiac', 'element', 'healing_properties',
      'origin', 'is_featured', 'is_active'];

    allowed.forEach(f => {
      if (fields[f] !== undefined) { updates.push(`${f} = ?`); values.push(fields[f]); }
    });

    if (req.files && req.files.length > 0) {
      const images = req.files.map(f => `/uploads/products/${f.filename}`);
      updates.push('images = ?');
      values.push(JSON.stringify(images));
    }

    if (!updates.length) return res.status(400).json({ success: false, message: 'No fields to update' });

    values.push(id);
    await pool.query(`UPDATE products SET ${updates.join(', ')} WHERE id = ?`, values);
    res.json({ success: true, message: 'Product updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    await pool.query('UPDATE products SET is_active = 0 WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getFeatured = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.*, c.name as category_name FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.is_featured = 1 AND p.is_active = 1 ORDER BY p.rating DESC LIMIT 8`
    );
    res.json({ success: true, products: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
