const pool = require('../config/db');

exports.getReportsOverview = async (req, res) => {
  try {
    const [[salesSummary]] = await pool.query(`
      SELECT
        COUNT(*) as total_orders,
        SUM(total) as gross_revenue,
        SUM(CASE WHEN payment_status = 'paid' THEN total ELSE 0 END) as paid_revenue,
        SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) as delivered_orders
      FROM orders
    `);

    const [salesByMonth] = await pool.query(`
      SELECT DATE_FORMAT(created_at, '%Y-%m') as month, COUNT(*) as orders, SUM(total) as revenue
      FROM orders
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
      GROUP BY month
      ORDER BY month
    `);

    const [salesByStatus] = await pool.query(`
      SELECT status, COUNT(*) as count, SUM(total) as revenue
      FROM orders
      GROUP BY status
      ORDER BY count DESC
    `);

    const [topCategories] = await pool.query(`
      SELECT c.name, COUNT(oi.id) as items_sold, SUM(oi.total) as revenue
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      LEFT JOIN categories c ON p.category_id = c.id
      GROUP BY c.id, c.name
      ORDER BY revenue DESC
      LIMIT 6
    `);

    const [topCustomers] = await pool.query(`
      SELECT u.name, u.email, COUNT(o.id) as orders, SUM(o.total) as spent
      FROM orders o
      JOIN users u ON o.user_id = u.id
      GROUP BY u.id, u.name, u.email
      ORDER BY spent DESC
      LIMIT 8
    `);

    res.json({
      success: true,
      summary: salesSummary,
      salesByMonth,
      salesByStatus,
      topCategories,
      topCustomers,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.exportOrdersCsv = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        o.order_number,
        u.name as customer_name,
        u.email as customer_email,
        o.status,
        o.payment_status,
        o.payment_method,
        o.total,
        o.tracking_number,
        o.created_at
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
    `);

    const headers = [
      'order_number',
      'customer_name',
      'customer_email',
      'status',
      'payment_status',
      'payment_method',
      'total',
      'tracking_number',
      'created_at',
    ];

    const escapeCsv = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;
    const csv = [
      headers.join(','),
      ...rows.map((row) => headers.map((header) => escapeCsv(row[header])).join(',')),
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="orders-report.csv"');
    res.send(csv);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
