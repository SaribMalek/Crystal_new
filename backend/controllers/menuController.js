const pool = require('../config/db');

const MENU_KEYS = ['shop', 'quick', 'help'];

const normalizeMenus = (rows, includeInactive = false) => {
  const filtered = includeInactive ? rows : rows.filter((row) => row.is_active);
  const byId = new Map();
  const structured = { shop: [], quick: [], help: [] };

  filtered.forEach((row) => {
    byId.set(row.id, { ...row, items: [] });
  });

  filtered.forEach((row) => {
    const item = byId.get(row.id);
    if (row.parent_id) {
      const parent = byId.get(row.parent_id);
      if (parent) parent.items.push(item);
    } else if (structured[row.menu_key]) {
      structured[row.menu_key].push(item);
    }
  });

  Object.values(structured).forEach((group) => {
    group.sort((a, b) => a.sort_order - b.sort_order || a.id - b.id);
    group.forEach((item) => item.items.sort((a, b) => a.sort_order - b.sort_order || a.id - b.id));
  });

  return structured;
};

exports.getMenus = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM menus ORDER BY menu_key, parent_id IS NOT NULL, sort_order, id');
    res.json({ success: true, menus: normalizeMenus(rows) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAdminMenus = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT m.*, p.title AS parent_title
       FROM menus m
       LEFT JOIN menus p ON p.id = m.parent_id
       ORDER BY m.menu_key, m.parent_id IS NOT NULL, m.sort_order, m.id`
    );
    res.json({ success: true, items: rows, menus: normalizeMenus(rows, true) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createMenuItem = async (req, res) => {
  try {
    const { menu_key, title, link, parent_id, sort_order, is_active } = req.body;

    if (!MENU_KEYS.includes(menu_key)) {
      return res.status(400).json({ success: false, message: 'Invalid menu key' });
    }
    if (!title) {
      return res.status(400).json({ success: false, message: 'Title is required' });
    }

    let parentId = parent_id || null;
    if (parentId) {
      const [parents] = await pool.query('SELECT id, menu_key FROM menus WHERE id = ?', [parentId]);
      if (!parents.length) {
        return res.status(400).json({ success: false, message: 'Parent menu not found' });
      }
      if (parents[0].menu_key !== menu_key) {
        return res.status(400).json({ success: false, message: 'Parent menu must be in the same section' });
      }
      parentId = parents[0].id;
    }

    const [result] = await pool.query(
      'INSERT INTO menus (menu_key, parent_id, title, link, sort_order, is_active) VALUES (?, ?, ?, ?, ?, ?)',
      [menu_key, parentId, title, link || null, Number(sort_order) || 0, is_active === false || is_active === 'false' ? 0 : 1]
    );

    const [rows] = await pool.query('SELECT * FROM menus WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, item: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { menu_key, title, link, parent_id, sort_order, is_active } = req.body;

    if (!MENU_KEYS.includes(menu_key)) {
      return res.status(400).json({ success: false, message: 'Invalid menu key' });
    }
    if (!title) {
      return res.status(400).json({ success: false, message: 'Title is required' });
    }

    let parentId = parent_id || null;
    if (parentId && Number(parentId) === Number(id)) {
      return res.status(400).json({ success: false, message: 'A menu item cannot be its own parent' });
    }

    if (parentId) {
      const [parents] = await pool.query('SELECT id, menu_key, parent_id FROM menus WHERE id = ?', [parentId]);
      if (!parents.length) {
        return res.status(400).json({ success: false, message: 'Parent menu not found' });
      }
      if (parents[0].menu_key !== menu_key || parents[0].parent_id) {
        return res.status(400).json({ success: false, message: 'Submenus can only be assigned to top-level items in the same section' });
      }
      parentId = parents[0].id;
    }

    await pool.query(
      'UPDATE menus SET menu_key = ?, parent_id = ?, title = ?, link = ?, sort_order = ?, is_active = ? WHERE id = ?',
      [menu_key, parentId, title, link || null, Number(sort_order) || 0, is_active === false || is_active === 'false' ? 0 : 1, id]
    );

    const [rows] = await pool.query('SELECT * FROM menus WHERE id = ?', [id]);
    res.json({ success: true, item: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM menus WHERE id = ?', [id]);
    res.json({ success: true, message: 'Menu item deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
