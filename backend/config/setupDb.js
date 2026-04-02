const mysql = require('mysql2/promise');
require('dotenv').config();

async function ensureColumn(connection, tableName, columnName, definition) {
  const [rows] = await connection.query(
    `SELECT COUNT(*) AS count
     FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
    [process.env.DB_NAME, tableName, columnName]
  );

  if (!rows[0].count) {
    await connection.query(`ALTER TABLE \`${tableName}\` ADD COLUMN ${definition}`);
  }
}

async function ensureDemoUser(connection, bcrypt, user) {
  const hashed = await bcrypt.hash(user.password, 12);
  await connection.query(`
    INSERT INTO users (name, email, password, role, phone, avatar, is_active, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      name = VALUES(name),
      password = VALUES(password),
      role = VALUES(role),
      phone = VALUES(phone),
      avatar = VALUES(avatar),
      is_active = VALUES(is_active)
  `, [
    user.name,
    user.email,
    hashed,
    user.role || 'user',
    user.phone || null,
    user.avatar || null,
    user.is_active ?? true,
    user.created_at,
  ]);
}

async function setupDatabase() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  });

  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\``);
  await connection.query(`USE \`${process.env.DB_NAME}\``);

  // Users table
  await connection.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(150) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role ENUM('user','admin') DEFAULT 'user',
      phone VARCHAR(20),
      avatar VARCHAR(255),
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  // Categories table
  await connection.query(`
    CREATE TABLE IF NOT EXISTS categories (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      slug VARCHAR(120) UNIQUE NOT NULL,
      description TEXT,
      image VARCHAR(255),
      parent_id INT DEFAULT NULL,
      sort_order INT DEFAULT 0,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
    )
  `);

  // Products table
  await connection.query(`
    CREATE TABLE IF NOT EXISTS products (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(200) NOT NULL,
      slug VARCHAR(220) UNIQUE NOT NULL,
      description TEXT,
      short_description VARCHAR(500),
      price DECIMAL(10,2) NOT NULL,
      sale_price DECIMAL(10,2) DEFAULT NULL,
      stock INT DEFAULT 0,
      sku VARCHAR(100) UNIQUE,
      category_id INT,
      images JSON,
      weight VARCHAR(50),
      dimensions VARCHAR(100),
      chakra VARCHAR(100),
      zodiac VARCHAR(100),
      element VARCHAR(100),
      healing_properties TEXT,
      origin VARCHAR(100),
      is_featured BOOLEAN DEFAULT FALSE,
      is_active BOOLEAN DEFAULT TRUE,
      rating DECIMAL(3,2) DEFAULT 0,
      review_count INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
    )
  `);

  // Addresses table
  await connection.query(`
    CREATE TABLE IF NOT EXISTS addresses (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      type ENUM('shipping','billing') DEFAULT 'shipping',
      full_name VARCHAR(100),
      phone VARCHAR(20),
      address_line1 VARCHAR(255),
      address_line2 VARCHAR(255),
      city VARCHAR(100),
      state VARCHAR(100),
      postal_code VARCHAR(20),
      country VARCHAR(100) DEFAULT 'India',
      is_default BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Orders table
  await connection.query(`
    CREATE TABLE IF NOT EXISTS orders (
      id INT AUTO_INCREMENT PRIMARY KEY,
      order_number VARCHAR(50) UNIQUE NOT NULL,
      user_id INT,
      status ENUM('pending','confirmed','processing','shipped','delivered','cancelled','refunded') DEFAULT 'pending',
      payment_status ENUM('pending','paid','failed','refunded') DEFAULT 'pending',
      payment_method VARCHAR(50),
      subtotal DECIMAL(10,2),
      discount DECIMAL(10,2) DEFAULT 0,
      shipping_cost DECIMAL(10,2) DEFAULT 0,
      tax DECIMAL(10,2) DEFAULT 0,
      total DECIMAL(10,2),
      shipping_address JSON,
      billing_address JSON,
      notes TEXT,
      tracking_number VARCHAR(100),
      stripe_session_id VARCHAR(255) DEFAULT NULL,
      stripe_payment_intent_id VARCHAR(255) DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    )
  `);
  await ensureColumn(connection, 'orders', 'stripe_session_id', '`stripe_session_id` VARCHAR(255) DEFAULT NULL');
  await ensureColumn(connection, 'orders', 'stripe_payment_intent_id', '`stripe_payment_intent_id` VARCHAR(255) DEFAULT NULL');

  // Order items table
  await connection.query(`
    CREATE TABLE IF NOT EXISTS order_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      order_id INT NOT NULL,
      product_id INT,
      product_name VARCHAR(200),
      product_image VARCHAR(255),
      quantity INT NOT NULL,
      price DECIMAL(10,2) NOT NULL,
      total DECIMAL(10,2) NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
    )
  `);

  // Wishlist table
  await connection.query(`
    CREATE TABLE IF NOT EXISTS wishlist (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      product_id INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY unique_wishlist (user_id, product_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    )
  `);

  // Reviews table
  await connection.query(`
    CREATE TABLE IF NOT EXISTS reviews (
      id INT AUTO_INCREMENT PRIMARY KEY,
      product_id INT NOT NULL,
      user_id INT NOT NULL,
      rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
      title VARCHAR(200),
      body TEXT,
      is_approved BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Coupons table
  await connection.query(`
    CREATE TABLE IF NOT EXISTS coupons (
      id INT AUTO_INCREMENT PRIMARY KEY,
      code VARCHAR(50) UNIQUE NOT NULL,
      type ENUM('percentage','fixed') DEFAULT 'percentage',
      value DECIMAL(10,2) NOT NULL,
      min_order_amount DECIMAL(10,2) DEFAULT 0,
      max_uses INT DEFAULT NULL,
      used_count INT DEFAULT 0,
      is_active BOOLEAN DEFAULT TRUE,
      expires_at DATETIME,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Banners table
  await connection.query(`
    CREATE TABLE IF NOT EXISTS banners (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(200),
      subtitle VARCHAR(300),
      image VARCHAR(255),
      link VARCHAR(255),
      sort_order INT DEFAULT 0,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS menus (
      id INT AUTO_INCREMENT PRIMARY KEY,
      menu_key VARCHAR(50) NOT NULL,
      parent_id INT DEFAULT NULL,
      title VARCHAR(120) NOT NULL,
      link VARCHAR(255) DEFAULT NULL,
      sort_order INT DEFAULT 0,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (parent_id) REFERENCES menus(id) ON DELETE CASCADE
    )
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS stripe_checkout_sessions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      session_id VARCHAR(255) UNIQUE NOT NULL,
      user_id INT DEFAULT NULL,
      payload JSON NOT NULL,
      is_processed BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    )
  `);

  const [menuRows] = await connection.query('SELECT COUNT(*) AS count FROM menus');
  if (!menuRows[0].count) {
    const insertMenuItem = async (menuKey, title, link, sortOrder, parentId = null) => {
      const [result] = await connection.query(
        'INSERT INTO menus (menu_key, parent_id, title, link, sort_order, is_active) VALUES (?, ?, ?, ?, ?, TRUE)',
        [menuKey, parentId, title, link, sortOrder]
      );
      return result.insertId;
    };

    const braceletsId = await insertMenuItem('shop', 'Bracelets', null, 1);
    await insertMenuItem('shop', 'All Bracelets', '/shop?search=bracelet', 1, braceletsId);
    await insertMenuItem('shop', 'Intention Bracelets', '/shop?search=intention bracelet', 2, braceletsId);
    await insertMenuItem('shop', 'Zodiac Bracelets', '/shop?search=zodiac bracelet', 3, braceletsId);
    await insertMenuItem('shop', 'Numerology Bracelets', '/shop?search=numerology bracelet', 4, braceletsId);
    await insertMenuItem('shop', 'Chakra Bracelets', '/shop?search=chakra bracelet', 5, braceletsId);

    const jewelleryId = await insertMenuItem('shop', 'Jewellery', null, 2);
    await insertMenuItem('shop', 'Japa Malas', '/shop?search=japa mala', 1, jewelleryId);
    await insertMenuItem('shop', 'Pendants', '/shop/crystal-pendants', 2, jewelleryId);
    await insertMenuItem('shop', 'Silver Pendants', '/shop?search=silver pendant', 3, jewelleryId);
    await insertMenuItem('shop', 'Rings & Earrings', '/shop?search=crystal ring', 4, jewelleryId);
    await insertMenuItem('shop', 'Neck Pieces', '/shop?search=necklace', 5, jewelleryId);

    const crystalsId = await insertMenuItem('shop', 'Crystals', null, 3);
    await insertMenuItem('shop', 'Raw Stones', '/shop/raw-crystals', 1, crystalsId);
    await insertMenuItem('shop', 'Tumble Stones', '/shop/tumbled-stones', 2, crystalsId);
    await insertMenuItem('shop', 'Spheres', '/shop/crystal-spheres', 3, crystalsId);
    await insertMenuItem('shop', 'Clusters & Geodes', '/shop/crystal-clusters', 4, crystalsId);
    await insertMenuItem('shop', '7 Chakra Crystals', '/shop/chakra-sets', 5, crystalsId);

    const decorId = await insertMenuItem('shop', 'Decor & Care', null, 4);
    await insertMenuItem('shop', 'Crystal Trees', '/shop?search=crystal tree', 1, decorId);
    await insertMenuItem('shop', 'Lamps & Candle Holders', '/shop?search=lamp', 2, decorId);
    await insertMenuItem('shop', 'Self Care Tools', '/shop?search=roller', 3, decorId);
    await insertMenuItem('shop', 'Smudging', '/shop?search=smudging', 4, decorId);
    await insertMenuItem('shop', 'Gift Hampers', '/shop/gift-sets', 5, decorId);

    await insertMenuItem('quick', 'Gift Sets', '/shop/gift-sets', 1);
    await insertMenuItem('quick', 'Services', '/services/crystal-consultation', 2);
    await insertMenuItem('quick', 'Blog', '/blog', 3);
    await insertMenuItem('quick', 'Contact', '/contact', 4);

    await insertMenuItem('help', 'Sizing & Details', '/faq', 1);
    await insertMenuItem('help', 'Returns, Exchange & Refund policy', '/returns', 2);
    await insertMenuItem('help', 'FAQ', '/faq', 3);
    await insertMenuItem('help', 'Privacy Policy', '/privacy', 4);
    await insertMenuItem('help', 'Terms & Conditions', '/terms', 5);
    await insertMenuItem('help', 'Disclaimers', '/disclaimers', 6);
    await insertMenuItem('help', 'Shipping Policy', '/shipping', 7);
    await insertMenuItem('help', 'Blog', '/blog', 8);
  }

  // Insert default admin user
  const bcrypt = require('bcryptjs');
  const hashedPassword = await bcrypt.hash('Password@123', 12);
  await connection.query(`
    UPDATE users
    SET name = 'Admin', email = 'admin@gmail.com', password = ?, role = 'admin'
    WHERE email = 'admin@crystalstore.com'
  `, [hashedPassword]);
  await connection.query(`
    INSERT INTO users (name, email, password, role)
    VALUES ('Admin', 'admin@gmail.com', ?, 'admin')
    ON DUPLICATE KEY UPDATE
      name = VALUES(name),
      password = VALUES(password),
      role = VALUES(role),
      is_active = TRUE
  `, [hashedPassword]);

  // Insert default categories
  await connection.query(`
    INSERT IGNORE INTO categories (name, slug, description) VALUES
    ('Tumbled Stones', 'tumbled-stones', 'Polished and tumbled healing crystals'),
    ('Raw Crystals', 'raw-crystals', 'Natural raw and rough crystals'),
    ('Crystal Pendants', 'crystal-pendants', 'Beautiful crystal pendants and necklaces'),
    ('Crystal Clusters', 'crystal-clusters', 'Natural crystal cluster formations'),
    ('Crystal Spheres', 'crystal-spheres', 'Polished crystal spheres and balls'),
    ('Gift Sets', 'gift-sets', 'Curated crystal gift collections'),
    ('Sage & Cleansing', 'sage-cleansing', 'Sage bundles and cleansing tools'),
    ('Chakra Sets', 'chakra-sets', 'Complete chakra balancing crystal sets')
  `);

  // Insert sample products
  const [categories] = await connection.query('SELECT id, slug FROM categories');
  const catMap = {};
  categories.forEach(c => { catMap[c.slug] = c.id; });

  await connection.query(`
    INSERT IGNORE INTO products (name, slug, description, short_description, price, sale_price, stock, sku, category_id, images, chakra, zodiac, element, healing_properties, origin, is_featured, rating, review_count) VALUES
    ('Amethyst Tumbled Stone', 'amethyst-tumbled-stone', 'Beautiful purple amethyst tumbled stone known for its calming and spiritual properties. Perfect for meditation and stress relief.', 'Calming purple amethyst for spiritual growth', 299.00, 249.00, 50, 'AMT001', ?, '["https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=500"]', 'Crown, Third Eye', 'Pisces, Aquarius', 'Water', 'Calming, intuition, spiritual awareness, stress relief', 'Brazil', TRUE, 4.8, 124),
    ('Rose Quartz Heart', 'rose-quartz-heart', 'A beautiful heart-shaped rose quartz crystal, the stone of unconditional love. Promotes self-love, compassion, and emotional healing.', 'Stone of love and compassion', 499.00, NULL, 30, 'RQH001', ?, '["https://images.unsplash.com/photo-1518301181949-fd2a09558d2b?w=500"]', 'Heart', 'Taurus, Libra', 'Water', 'Love, compassion, emotional healing, self-love', 'Madagascar', TRUE, 4.9, 89),
    ('Black Tourmaline Raw', 'black-tourmaline-raw', 'Powerful protection crystal that creates a shield against negative energies. Essential for EMF protection and grounding.', 'Ultimate protection and grounding crystal', 399.00, 349.00, 45, 'BTR001', ?, '["https://images.unsplash.com/photo-1604881988758-f76ad2f7aac1?w=500"]', 'Root', 'Capricorn, Scorpio', 'Earth', 'Protection, grounding, EMF shielding, cleansing', 'Brazil', TRUE, 4.7, 156),
    ('Clear Quartz Point', 'clear-quartz-point', 'Master healer crystal that amplifies energy and intention. Perfect for manifestation, clarity, and amplifying other crystals.', 'Master healer and amplifier', 349.00, NULL, 60, 'CQP001', ?, '["https://images.unsplash.com/photo-1567225557594-88d73398014a?w=500"]', 'All Chakras', 'All Signs', 'All Elements', 'Amplification, clarity, manifestation, healing', 'Brazil', TRUE, 4.8, 201),
    ('Lapis Lazuli Pendant', 'lapis-lazuli-pendant', 'Stunning deep blue lapis lazuli pendant that enhances wisdom, truth, and communication. Set in 925 sterling silver.', 'Wisdom and truth crystal pendant', 799.00, 699.00, 25, 'LLP001', ?, '["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500"]', 'Throat, Third Eye', 'Sagittarius, Capricorn', 'Water', 'Wisdom, truth, communication, intuition', 'Afghanistan', FALSE, 4.6, 67),
    ('Selenite Wand', 'selenite-wand', 'Pure white selenite wand for energy cleansing and charging other crystals. Creates a peaceful and serene environment.', 'Cleansing and charging crystal tool', 449.00, NULL, 35, 'SEW001', ?, '["https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=500"]', 'Crown', 'Taurus, Cancer', 'Air', 'Cleansing, charging, mental clarity, angelic connection', 'Morocco', FALSE, 4.7, 93),
    ('7 Chakra Gift Set', '7-chakra-gift-set', 'Complete set of 7 chakra crystals including Red Jasper, Carnelian, Citrine, Green Aventurine, Blue Apatite, Lapis Lazuli, and Amethyst.', 'Complete healing crystal starter set', 1299.00, 999.00, 20, 'CKS001', ?, '["https://images.unsplash.com/photo-1573408301185-9519f94816b5?w=500"]', 'All Chakras', 'All Signs', 'All Elements', 'Chakra balancing, complete healing, spiritual growth', 'Various', TRUE, 4.9, 312),
    ('Citrine Cluster', 'citrine-cluster', 'Natural citrine cluster, the stone of abundance and manifestation. Attracts prosperity, success, and positive energy.', 'Stone of abundance and success', 899.00, 749.00, 15, 'CTC001', ?, '["https://images.unsplash.com/photo-1617040619263-41c5a9ca7521?w=500"]', 'Solar Plexus', 'Aries, Leo, Libra', 'Fire', 'Abundance, manifestation, confidence, joy', 'Brazil', TRUE, 4.8, 178)
  `, [
    catMap['tumbled-stones'], catMap['tumbled-stones'], catMap['raw-crystals'],
    catMap['raw-crystals'], catMap['crystal-pendants'], catMap['raw-crystals'],
    catMap['gift-sets'], catMap['crystal-clusters']
  ]);

  const demoUsers = [
    {
      name: 'Priya Sharma',
      email: 'priya.demo@ascrystal.com',
      password: 'Password@123',
      phone: '+91 9876500011',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&q=80',
      created_at: '2025-10-12 10:00:00',
    },
    {
      name: 'Rahul Mehta',
      email: 'rahul.demo@ascrystal.com',
      password: 'Password@123',
      phone: '+91 9876500012',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&q=80',
      created_at: '2025-11-03 14:20:00',
    },
    {
      name: 'Anita Kapoor',
      email: 'anita.demo@ascrystal.com',
      password: 'Password@123',
      phone: '+91 9876500013',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&q=80',
      created_at: '2025-12-18 11:45:00',
    },
    {
      name: 'Vikram Sethi',
      email: 'vikram.demo@ascrystal.com',
      password: 'Password@123',
      phone: '+91 9876500014',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&q=80',
      created_at: '2026-01-09 09:30:00',
    },
    {
      name: 'Neha Jain',
      email: 'neha.demo@ascrystal.com',
      password: 'Password@123',
      phone: '+91 9876500015',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&q=80',
      created_at: '2026-02-21 16:10:00',
    },
  ];

  for (const user of demoUsers) {
    await ensureDemoUser(connection, bcrypt, user);
  }

  const [productRows] = await connection.query('SELECT id, slug, name, price, sale_price, category_id, images FROM products');
  const [userRows] = await connection.query('SELECT id, email, name FROM users WHERE role = "user"');
  const productBySlug = Object.fromEntries(productRows.map((row) => [row.slug, row]));
  const userByEmail = Object.fromEntries(userRows.map((row) => [row.email, row]));

  await connection.query(`
    INSERT INTO coupons (code, type, value, min_order_amount, max_uses, used_count, is_active, expires_at)
    VALUES
      ('WELCOME10', 'percentage', 10, 999, 200, 12, TRUE, '2026-12-31 23:59:59'),
      ('CRYSTAL200', 'fixed', 200, 1499, 100, 8, TRUE, '2026-10-31 23:59:59'),
      ('GIFT15', 'percentage', 15, 1999, 50, 6, TRUE, '2026-11-30 23:59:59')
    ON DUPLICATE KEY UPDATE
      value = VALUES(value),
      min_order_amount = VALUES(min_order_amount),
      max_uses = VALUES(max_uses),
      is_active = VALUES(is_active),
      expires_at = VALUES(expires_at)
  `);

  const demoOrders = [
    {
      order_number: 'ASD1001',
      user_email: 'priya.demo@ascrystal.com',
      status: 'delivered',
      payment_status: 'paid',
      payment_method: 'cod',
      discount: 0,
      shipping_cost: 0,
      tax: 224.82,
      total: 1473.82,
      tracking_number: 'TRK1001',
      created_at: '2025-10-15 12:00:00',
      items: [{ slug: '7-chakra-gift-set', quantity: 1 }, { slug: 'selenite-wand', quantity: 1 }],
      shipping_address: { full_name: 'Priya Sharma', phone: '+91 9876500011', email: 'priya.demo@ascrystal.com', address_line1: '21 Lotus Residency', city: 'Mumbai', state: 'Maharashtra', postal_code: '400001', country: 'India' },
    },
    {
      order_number: 'ASD1002',
      user_email: 'rahul.demo@ascrystal.com',
      status: 'shipped',
      payment_status: 'paid',
      payment_method: 'stripe',
      discount: 120,
      shipping_cost: 0,
      tax: 186.12,
      total: 1220.12,
      tracking_number: 'TRK1002',
      created_at: '2025-11-08 15:45:00',
      items: [{ slug: 'citrine-cluster', quantity: 1 }, { slug: 'clear-quartz-point', quantity: 1 }],
      shipping_address: { full_name: 'Rahul Mehta', phone: '+91 9876500012', email: 'rahul.demo@ascrystal.com', address_line1: '88 Pearl Heights', city: 'Pune', state: 'Maharashtra', postal_code: '411001', country: 'India' },
    },
    {
      order_number: 'ASD1003',
      user_email: 'anita.demo@ascrystal.com',
      status: 'processing',
      payment_status: 'paid',
      payment_method: 'razorpay',
      discount: 0,
      shipping_cost: 99,
      tax: 188.82,
      total: 1237.82,
      tracking_number: null,
      created_at: '2025-12-22 18:20:00',
      items: [{ slug: 'lapis-lazuli-pendant', quantity: 1 }, { slug: 'rose-quartz-heart', quantity: 1 }],
      shipping_address: { full_name: 'Anita Kapoor', phone: '+91 9876500013', email: 'anita.demo@ascrystal.com', address_line1: '102 Garden View', city: 'Delhi', state: 'Delhi', postal_code: '110001', country: 'India' },
    },
    {
      order_number: 'ASD1004',
      user_email: 'vikram.demo@ascrystal.com',
      status: 'pending',
      payment_status: 'pending',
      payment_method: 'cod',
      discount: 0,
      shipping_cost: 99,
      tax: 125.82,
      total: 923.82,
      tracking_number: null,
      created_at: '2026-01-12 10:15:00',
      items: [{ slug: 'black-tourmaline-raw', quantity: 1 }, { slug: 'selenite-wand', quantity: 1 }],
      shipping_address: { full_name: 'Vikram Sethi', phone: '+91 9876500014', email: 'vikram.demo@ascrystal.com', address_line1: '55 Ocean Enclave', city: 'Bengaluru', state: 'Karnataka', postal_code: '560001', country: 'India' },
    },
    {
      order_number: 'ASD1005',
      user_email: 'neha.demo@ascrystal.com',
      status: 'delivered',
      payment_status: 'paid',
      payment_method: 'stripe',
      discount: 75,
      shipping_cost: 99,
      tax: 121.32,
      total: 894.32,
      tracking_number: 'TRK1005',
      created_at: '2026-02-03 13:05:00',
      items: [{ slug: 'amethyst-tumbled-stone', quantity: 2 }, { slug: 'rose-quartz-heart', quantity: 1 }],
      shipping_address: { full_name: 'Neha Jain', phone: '+91 9876500015', email: 'neha.demo@ascrystal.com', address_line1: '14 Harmony Apartments', city: 'Jaipur', state: 'Rajasthan', postal_code: '302001', country: 'India' },
    },
    {
      order_number: 'ASD1006',
      user_email: 'priya.demo@ascrystal.com',
      status: 'confirmed',
      payment_status: 'paid',
      payment_method: 'razorpay',
      discount: 0,
      shipping_cost: 99,
      tax: 152.82,
      total: 1100.82,
      tracking_number: null,
      created_at: '2026-02-19 17:30:00',
      items: [{ slug: 'citrine-cluster', quantity: 1 }, { slug: 'amethyst-tumbled-stone', quantity: 1 }],
      shipping_address: { full_name: 'Priya Sharma', phone: '+91 9876500011', email: 'priya.demo@ascrystal.com', address_line1: '21 Lotus Residency', city: 'Mumbai', state: 'Maharashtra', postal_code: '400001', country: 'India' },
    },
    {
      order_number: 'ASD1007',
      user_email: 'rahul.demo@ascrystal.com',
      status: 'cancelled',
      payment_status: 'failed',
      payment_method: 'stripe',
      discount: 0,
      shipping_cost: 99,
      tax: 125.82,
      total: 923.82,
      tracking_number: null,
      created_at: '2026-03-02 11:40:00',
      items: [{ slug: 'black-tourmaline-raw', quantity: 1 }, { slug: 'selenite-wand', quantity: 1 }],
      shipping_address: { full_name: 'Rahul Mehta', phone: '+91 9876500012', email: 'rahul.demo@ascrystal.com', address_line1: '88 Pearl Heights', city: 'Pune', state: 'Maharashtra', postal_code: '411001', country: 'India' },
    },
    {
      order_number: 'ASD1008',
      user_email: 'anita.demo@ascrystal.com',
      status: 'delivered',
      payment_status: 'paid',
      payment_method: 'cod',
      discount: 0,
      shipping_cost: 99,
      tax: 305.82,
      total: 2103.82,
      tracking_number: 'TRK1008',
      created_at: '2026-03-14 09:50:00',
      items: [{ slug: '7-chakra-gift-set', quantity: 1 }, { slug: 'lapis-lazuli-pendant', quantity: 1 }, { slug: 'amethyst-tumbled-stone', quantity: 1 }],
      shipping_address: { full_name: 'Anita Kapoor', phone: '+91 9876500013', email: 'anita.demo@ascrystal.com', address_line1: '102 Garden View', city: 'Delhi', state: 'Delhi', postal_code: '110001', country: 'India' },
    },
  ];

  for (const order of demoOrders) {
    const user = userByEmail[order.user_email];
    if (!user) continue;

    await connection.query(`
      INSERT IGNORE INTO orders (
        order_number, user_id, status, payment_status, payment_method,
        subtotal, discount, shipping_cost, tax, total,
        shipping_address, billing_address, notes, tracking_number, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      order.order_number,
      user.id,
      order.status,
      order.payment_status,
      order.payment_method,
      parseFloat((order.total - order.shipping_cost - order.tax + order.discount).toFixed(2)),
      order.discount,
      order.shipping_cost,
      order.tax,
      order.total,
      JSON.stringify(order.shipping_address),
      JSON.stringify(order.shipping_address),
      'Demo seeded order',
      order.tracking_number,
      order.created_at,
      order.created_at,
    ]);

    const [[savedOrder]] = await connection.query('SELECT id FROM orders WHERE order_number = ?', [order.order_number]);
    if (!savedOrder) continue;

    for (const item of order.items) {
      const product = productBySlug[item.slug];
      if (!product) continue;
      const unitPrice = Number(product.sale_price || product.price);
      const images = typeof product.images === 'string' ? JSON.parse(product.images || '[]') : (product.images || []);

      await connection.query(`
        INSERT IGNORE INTO order_items (order_id, product_id, product_name, product_image, quantity, price, total)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [savedOrder.id, product.id, product.name, images[0] || null, item.quantity, unitPrice, unitPrice * item.quantity]);
    }
  }

  const demoReviews = [
    ['priya.demo@ascrystal.com', 'amethyst-tumbled-stone', 5, 'Beautiful quality', 'The finish and color are lovely. Perfect for meditation and gifting.', 1, '2026-01-18 10:20:00'],
    ['rahul.demo@ascrystal.com', 'black-tourmaline-raw', 4, 'Strong grounding energy', 'Looks authentic and arrived packed well. Great piece for desk protection.', 1, '2026-01-28 14:40:00'],
    ['anita.demo@ascrystal.com', '7-chakra-gift-set', 5, 'Perfect starter kit', 'Very good presentation and useful for beginners who want a full chakra set.', 1, '2026-02-08 16:05:00'],
    ['neha.demo@ascrystal.com', 'lapis-lazuli-pendant', 4, 'Elegant pendant', 'The pendant feels premium and the color is rich. Nice for daily wear.', 0, '2026-03-04 12:30:00'],
  ];

  for (const [email, slug, rating, title, body, isApproved, createdAt] of demoReviews) {
    const user = userByEmail[email];
    const product = productBySlug[slug];
    if (!user || !product) continue;
    await connection.query(`
      INSERT IGNORE INTO reviews (product_id, user_id, rating, title, body, is_approved, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [product.id, user.id, rating, title, body, isApproved, createdAt]);
  }

  await connection.query(`
    UPDATE products p
    SET
      review_count = (
        SELECT COUNT(*)
        FROM reviews r
        WHERE r.product_id = p.id AND r.is_approved = TRUE
      ),
      rating = (
        SELECT COALESCE(ROUND(AVG(r.rating), 2), 0)
        FROM reviews r
        WHERE r.product_id = p.id AND r.is_approved = TRUE
      )
  `);

  const demoWishlist = [
    ['priya.demo@ascrystal.com', 'citrine-cluster'],
    ['rahul.demo@ascrystal.com', 'clear-quartz-point'],
    ['anita.demo@ascrystal.com', 'lapis-lazuli-pendant'],
    ['neha.demo@ascrystal.com', '7-chakra-gift-set'],
  ];

  for (const [email, slug] of demoWishlist) {
    const user = userByEmail[email];
    const product = productBySlug[slug];
    if (!user || !product) continue;
    await connection.query('INSERT IGNORE INTO wishlist (user_id, product_id) VALUES (?, ?)', [user.id, product.id]);
  }

  console.log('✅ Database setup complete!');
  console.log('Admin credentials: admin@gmail.com / Password@123');
  await connection.end();
}

setupDatabase().catch(console.error);
