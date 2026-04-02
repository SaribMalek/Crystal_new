const Stripe = require('stripe');
const pool = require('../config/db');
const { sendOrderPlacedEmail, sendOrderStatusEmail } = require('../services/emailService');

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

const generateOrderNumber = () => 'ASC' + Date.now() + Math.floor(Math.random() * 1000);

const buildOrderTotals = async (conn, items, couponCode) => {
  let subtotal = 0;
  let discount = 0;

  for (const item of items) {
    const [products] = await conn.query(
      'SELECT id, price, sale_price, stock FROM products WHERE id = ? AND is_active = 1',
      [item.product_id]
    );
    if (!products.length) throw new Error(`Product ${item.product_id} not found`);
    if (products[0].stock < item.quantity) throw new Error(`Insufficient stock for product ${item.product_id}`);
    const price = products[0].sale_price || products[0].price;
    subtotal += price * item.quantity;
  }

  if (couponCode) {
    const [coupons] = await conn.query(
      `SELECT * FROM coupons
       WHERE code = ? AND is_active = 1
       AND (expires_at IS NULL OR expires_at > NOW())
       AND (max_uses IS NULL OR used_count < max_uses)`,
      [couponCode]
    );
    if (coupons.length && subtotal >= coupons[0].min_order_amount) {
      discount = coupons[0].type === 'percentage'
        ? subtotal * coupons[0].value / 100
        : coupons[0].value;
      await conn.query('UPDATE coupons SET used_count = used_count + 1 WHERE id = ?', [coupons[0].id]);
    }
  }

  const shippingCost = subtotal > 999 ? 0 : 99;
  const tax = parseFloat(((subtotal - discount) * 0.18).toFixed(2));
  const total = parseFloat((subtotal - discount + shippingCost + tax).toFixed(2));

  return { subtotal, discount, shippingCost, tax, total };
};

const createOrderRecord = async (conn, payload, extra = {}) => {
  const {
    userId = null,
    items,
    shippingAddress,
    billingAddress,
    paymentMethod,
    couponCode,
    notes,
    customerEmail,
    customerName,
  } = payload;

  const { subtotal, discount, shippingCost, tax, total } = await buildOrderTotals(conn, items, couponCode);
  const orderNumber = generateOrderNumber();

  const [orderResult] = await conn.query(
    `INSERT INTO orders (
      order_number, user_id, status, payment_status, payment_method,
      subtotal, discount, shipping_cost, tax, total,
      shipping_address, billing_address, notes, tracking_number,
      stripe_session_id, stripe_payment_intent_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      orderNumber,
      userId,
      extra.status || 'pending',
      extra.paymentStatus || 'pending',
      paymentMethod,
      subtotal,
      discount,
      shippingCost,
      tax,
      total,
      JSON.stringify(shippingAddress),
      JSON.stringify(billingAddress || shippingAddress),
      notes || null,
      extra.trackingNumber || null,
      extra.stripeSessionId || null,
      extra.stripePaymentIntentId || null,
    ]
  );

  for (const item of items) {
    const [products] = await conn.query(
      'SELECT name, images, price, sale_price FROM products WHERE id = ?',
      [item.product_id]
    );
    const product = products[0];
    const price = product.sale_price || product.price;
    const images = typeof product.images === 'string' ? JSON.parse(product.images || '[]') : product.images;

    await conn.query(
      'INSERT INTO order_items (order_id, product_id, product_name, product_image, quantity, price, total) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [orderResult.insertId, item.product_id, product.name, images?.[0] || null, item.quantity, price, price * item.quantity]
    );

    await conn.query('UPDATE products SET stock = stock - ? WHERE id = ?', [item.quantity, item.product_id]);
  }

  await sendOrderPlacedEmail({
    email: customerEmail,
    name: customerName,
    orderNumber,
    total,
  });

  return { orderId: orderResult.insertId, orderNumber, total };
};

exports.createOrder = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const { items, shipping_address, billing_address, payment_method, coupon_code, notes } = req.body;
    const customerEmail = req.user?.email || shipping_address?.email || billing_address?.email || req.body.email || null;
    const customerName = req.user?.name || shipping_address?.full_name || billing_address?.full_name || req.body.name || 'Customer';

    if (!items || !items.length) {
      return res.status(400).json({ success: false, message: 'No items in order' });
    }

    const result = await createOrderRecord(conn, {
      userId: req.user?.id || null,
      items,
      shippingAddress: shipping_address,
      billingAddress: billing_address,
      paymentMethod: payment_method,
      couponCode: coupon_code,
      notes,
      customerEmail,
      customerName,
    }, {
      status: payment_method === 'stripe' ? 'confirmed' : 'pending',
      paymentStatus: payment_method === 'stripe' ? 'paid' : 'pending',
    });

    await conn.commit();
    res.status(201).json({ success: true, order_number: result.orderNumber, order_id: result.orderId, total: result.total });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ success: false, message: err.message });
  } finally {
    conn.release();
  }
};

exports.createStripeCheckoutSession = async (req, res) => {
  if (!stripe) {
    return res.status(400).json({ success: false, message: 'Stripe is not configured on the server yet' });
  }

  const conn = await pool.getConnection();
  try {
    const { items, shipping_address, billing_address, coupon_code, notes } = req.body;
    if (!items || !items.length) {
      return res.status(400).json({ success: false, message: 'No items in order' });
    }

    const lineItems = [];
    for (const item of items) {
      const [products] = await conn.query(
        'SELECT id, name, price, sale_price FROM products WHERE id = ? AND is_active = 1',
        [item.product_id]
      );
      if (!products.length) throw new Error(`Product ${item.product_id} not found`);
      const product = products[0];
      const unitAmount = Math.round(Number(product.sale_price || product.price) * 100);
      lineItems.push({
        price_data: {
          currency: 'inr',
          product_data: { name: product.name },
          unit_amount: unitAmount,
        },
        quantity: item.quantity,
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems,
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/order-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/checkout`,
      customer_email: req.user?.email || shipping_address?.email || req.body.email || undefined,
      metadata: {
        source: 'as-crystal-store',
      },
    });

    await conn.query(
      'INSERT INTO stripe_checkout_sessions (session_id, user_id, payload) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE payload = VALUES(payload), user_id = VALUES(user_id)',
      [session.id, req.user?.id || null, JSON.stringify({
        userId: req.user?.id || null,
        items,
        shippingAddress: shipping_address,
        billingAddress: billing_address,
        paymentMethod: 'stripe',
        couponCode: coupon_code || null,
        notes: notes || null,
        customerEmail: req.user?.email || shipping_address?.email || req.body.email || null,
        customerName: req.user?.name || shipping_address?.full_name || req.body.name || 'Customer',
      })]
    );

    res.json({ success: true, url: session.url, sessionId: session.id });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  } finally {
    conn.release();
  }
};

exports.confirmStripeCheckoutSession = async (req, res) => {
  if (!stripe) {
    return res.status(400).json({ success: false, message: 'Stripe is not configured on the server yet' });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const { session_id } = req.body;
    if (!session_id) {
      return res.status(400).json({ success: false, message: 'Missing Stripe session id' });
    }

    const session = await stripe.checkout.sessions.retrieve(session_id);
    if (session.payment_status !== 'paid') {
      throw new Error('Stripe payment is not completed');
    }

    const [existingOrders] = await conn.query(
      'SELECT id, order_number FROM orders WHERE stripe_session_id = ? LIMIT 1',
      [session_id]
    );
    if (existingOrders.length) {
      await conn.commit();
      return res.json({ success: true, order_id: existingOrders[0].id, order_number: existingOrders[0].order_number, existing: true });
    }

    const [sessionRows] = await conn.query(
      'SELECT * FROM stripe_checkout_sessions WHERE session_id = ? LIMIT 1',
      [session_id]
    );
    if (!sessionRows.length) throw new Error('Checkout session data not found');

    const saved = sessionRows[0];
    const payload = typeof saved.payload === 'string' ? JSON.parse(saved.payload) : saved.payload;

    const result = await createOrderRecord(conn, payload, {
      status: 'confirmed',
      paymentStatus: 'paid',
      stripeSessionId: session.id,
      stripePaymentIntentId: session.payment_intent || null,
    });

    await conn.query(
      'UPDATE stripe_checkout_sessions SET is_processed = TRUE WHERE session_id = ?',
      [session_id]
    );

    await conn.commit();
    res.json({ success: true, order_id: result.orderId, order_number: result.orderNumber });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ success: false, message: err.message });
  } finally {
    conn.release();
  }
};

exports.getOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;
    const where = req.user.role === 'admin' ? [] : ['o.user_id = ?'];
    const params = req.user.role === 'admin' ? [] : [req.user.id];

    if (status) {
      where.push('o.status = ?');
      params.push(status);
    }
    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const [rows] = await pool.query(
      `SELECT o.*, u.name as user_name, u.email as user_email,
       (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as item_count
       FROM orders o LEFT JOIN users u ON o.user_id = u.id
       ${whereClause} ORDER BY o.created_at DESC LIMIT ? OFFSET ?`,
      [...params, parseInt(limit, 10), parseInt(offset, 10)]
    );

    const [count] = await pool.query(`SELECT COUNT(*) as total FROM orders o ${whereClause}`, params);
    res.json({ success: true, orders: rows, total: count[0].total, page: parseInt(page, 10), pages: Math.ceil(count[0].total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getOrder = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT o.*, u.name as user_name, u.email as user_email
       FROM orders o LEFT JOIN users u ON o.user_id = u.id WHERE o.id = ?`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ success: false, message: 'Order not found' });
    if (req.user.role !== 'admin' && rows[0].user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const [items] = await pool.query('SELECT * FROM order_items WHERE order_id = ?', [req.params.id]);
    res.json({ success: true, order: { ...rows[0], items } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, payment_status, tracking_number } = req.body;
    const [[existingOrder]] = await pool.query(
      `SELECT o.*, u.name as user_name, u.email as user_email
       FROM orders o LEFT JOIN users u ON o.user_id = u.id WHERE o.id = ?`,
      [req.params.id]
    );
    if (!existingOrder) return res.status(404).json({ success: false, message: 'Order not found' });

    const updates = [];
    const values = [];
    if (status) { updates.push('status = ?'); values.push(status); }
    if (payment_status) { updates.push('payment_status = ?'); values.push(payment_status); }
    if (tracking_number) { updates.push('tracking_number = ?'); values.push(tracking_number); }
    if (!updates.length) return res.status(400).json({ success: false, message: 'Nothing to update' });

    values.push(req.params.id);
    await pool.query(`UPDATE orders SET ${updates.join(', ')} WHERE id = ?`, values);

    if (status && status !== existingOrder.status) {
      await sendOrderStatusEmail({
        email: existingOrder.user_email,
        name: existingOrder.user_name,
        orderNumber: existingOrder.order_number,
        status,
        trackingNumber: tracking_number || existingOrder.tracking_number,
      });
    }

    res.json({ success: true, message: 'Order updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const [[totalOrders]] = await pool.query('SELECT COUNT(*) as count FROM orders');
    const [[totalRevenue]] = await pool.query('SELECT SUM(total) as sum FROM orders WHERE payment_status = "paid"');
    const [[totalProducts]] = await pool.query('SELECT COUNT(*) as count FROM products WHERE is_active = 1');
    const [[totalUsers]] = await pool.query('SELECT COUNT(*) as count FROM users WHERE role = "user"');
    const [recentOrders] = await pool.query(
      'SELECT o.*, u.name as user_name FROM orders o LEFT JOIN users u ON o.user_id = u.id ORDER BY o.created_at DESC LIMIT 5'
    );
    const [topProducts] = await pool.query(
      `SELECT p.name, SUM(oi.quantity) as sold, SUM(oi.total) as revenue
       FROM order_items oi JOIN products p ON oi.product_id = p.id
       GROUP BY oi.product_id ORDER BY sold DESC LIMIT 5`
    );
    const [monthlySales] = await pool.query(
      `SELECT DATE_FORMAT(created_at, '%Y-%m') as month, COUNT(*) as orders, SUM(total) as revenue
       FROM orders WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
       GROUP BY month ORDER BY month`
    );

    res.json({
      success: true,
      stats: {
        totalOrders: totalOrders.count,
        totalRevenue: totalRevenue.sum || 0,
        totalProducts: totalProducts.count,
        totalUsers: totalUsers.count,
      },
      recentOrders,
      topProducts,
      monthlySales,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
