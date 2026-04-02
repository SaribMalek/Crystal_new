const pool = require('../config/db');

const slugify = (value = '') => value
  .toString()
  .toLowerCase()
  .trim()
  .replace(/[^a-z0-9\s-]/g, '')
  .replace(/\s+/g, '-')
  .replace(/-+/g, '-');

async function createUniqueSlug(title, excludeId = null) {
  const baseSlug = slugify(title) || `blog-${Date.now()}`;
  let slug = baseSlug;
  let count = 1;

  while (true) {
    const params = excludeId ? [slug, excludeId] : [slug];
    const [rows] = await pool.query(
      `SELECT id FROM blogs WHERE slug = ? ${excludeId ? 'AND id != ?' : ''} LIMIT 1`,
      params
    );

    if (!rows.length) return slug;
    count += 1;
    slug = `${baseSlug}-${count}`;
  }
}

exports.getBlogs = async (req, res) => {
  try {
    const whereClause = 'WHERE b.is_published = 1';
    const [blogs] = await pool.query(
      `SELECT b.*, u.name AS author_name
       FROM blogs b
       LEFT JOIN users u ON b.author_id = u.id
       ${whereClause}
       ORDER BY COALESCE(b.published_at, b.created_at) DESC, b.id DESC`
    );

    res.json({ success: true, blogs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAdminBlogs = async (req, res) => {
  try {
    const [blogs] = await pool.query(
      `SELECT b.*, u.name AS author_name
       FROM blogs b
       LEFT JOIN users u ON b.author_id = u.id
       ORDER BY COALESCE(b.published_at, b.created_at) DESC, b.id DESC`
    );

    res.json({ success: true, blogs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getBlogBySlug = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT b.*, u.name AS author_name
       FROM blogs b
       LEFT JOIN users u ON b.author_id = u.id
       WHERE b.slug = ? AND b.is_published = 1
       LIMIT 1`,
      [req.params.slug]
    );

    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }

    res.json({ success: true, blog: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAdminBlogById = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM blogs WHERE id = ? LIMIT 1', [req.params.id]);

    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }

    res.json({ success: true, blog: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createBlog = async (req, res) => {
  try {
    const { title, excerpt, content, cover_image, is_featured, is_published, published_at } = req.body;

    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Title and content are required' });
    }

    const slug = await createUniqueSlug(title);
    const publishDate = is_published ? (published_at || new Date()) : null;

    const [result] = await pool.query(
      `INSERT INTO blogs (title, slug, excerpt, content, cover_image, is_featured, is_published, published_at, author_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        slug,
        excerpt || null,
        content,
        cover_image || null,
        is_featured ? 1 : 0,
        is_published ? 1 : 0,
        publishDate,
        req.user.id,
      ]
    );

    res.status(201).json({ success: true, message: 'Blog created successfully', id: result.insertId, slug });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateBlog = async (req, res) => {
  try {
    const { title, excerpt, content, cover_image, is_featured, is_published, published_at } = req.body;
    const [rows] = await pool.query('SELECT * FROM blogs WHERE id = ? LIMIT 1', [req.params.id]);

    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }

    const existing = rows[0];
    const nextTitle = title || existing.title;
    const slug = nextTitle !== existing.title ? await createUniqueSlug(nextTitle, existing.id) : existing.slug;
    const nextPublished = typeof is_published === 'undefined' ? !!existing.is_published : !!is_published;
    const publishDate = nextPublished
      ? (published_at || existing.published_at || new Date())
      : null;

    await pool.query(
      `UPDATE blogs
       SET title = ?, slug = ?, excerpt = ?, content = ?, cover_image = ?, is_featured = ?, is_published = ?, published_at = ?
       WHERE id = ?`,
      [
        nextTitle,
        slug,
        typeof excerpt === 'undefined' ? existing.excerpt : (excerpt || null),
        typeof content === 'undefined' ? existing.content : content,
        typeof cover_image === 'undefined' ? existing.cover_image : (cover_image || null),
        typeof is_featured === 'undefined' ? existing.is_featured : (is_featured ? 1 : 0),
        nextPublished ? 1 : 0,
        publishDate,
        req.params.id,
      ]
    );

    res.json({ success: true, message: 'Blog updated successfully', slug });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteBlog = async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM blogs WHERE id = ?', [req.params.id]);

    if (!result.affectedRows) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }

    res.json({ success: true, message: 'Blog deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
