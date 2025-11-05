const pool = require('../config/database');
const bcrypt = require('bcryptjs');

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');
    
    await createTables();

    await seedUsers();

    await seedProducts();

    await seedPortfolio();

    await seedWatchlist();

    await seedNotifications();

    await seedKYC();

    await seedAuditLogs();

    console.log('✅ Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
  } finally {
    await pool.end();
  }
};

const createTables = async () => {
  console.log('📋 Creating database tables...');

  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      phone VARCHAR(15),
      role VARCHAR(20) DEFAULT 'user',
      wallet_balance DECIMAL(15,2) DEFAULT 100000.00,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      name VARCHAR(200) UNIQUE NOT NULL,
      category VARCHAR(100) NOT NULL,
      price DECIMAL(10,2) NOT NULL,
      description TEXT,
      pe_ratio DECIMAL(8,2),
      market_cap BIGINT,
      volume BIGINT,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS kyc (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(100) NOT NULL,
      pan_number VARCHAR(10) UNIQUE NOT NULL,
      address TEXT NOT NULL,
      phone VARCHAR(15) NOT NULL,
      id_image_path VARCHAR(500),
      status VARCHAR(20) DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS transactions (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
      type VARCHAR(10) NOT NULL CHECK (type IN ('buy', 'sell')),
      units DECIMAL(15,4) NOT NULL,
      price_per_unit DECIMAL(10,2) NOT NULL,
      total_amount DECIMAL(15,2) NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS watchlist (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
      created_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(user_id, product_id)
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS portfolio (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
      quantity DECIMAL(15,4) NOT NULL DEFAULT 0,
      average_price DECIMAL(10,2) NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(user_id, product_id)
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS notifications (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      type VARCHAR(50) NOT NULL,
      title VARCHAR(200) NOT NULL,
      message TEXT NOT NULL,
      data JSONB,
      is_read BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      action VARCHAR(100) NOT NULL,
      resource VARCHAR(100) NOT NULL,
      resource_id INTEGER,
      details JSONB,
      ip_address INET,
      user_agent TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);

  console.log('✅ Database tables created successfully!');
};

const seedUsers = async () => {
  console.log('👥 Seeding users...');

  const hashedPassword = await bcrypt.hash('password123', 12);

  const users = [
    {
      name: 'Admin User',
      email: 'admin@tradingapp.com',
      password: hashedPassword,
      role: 'admin',
      wallet_balance: 1000000.00
    },
    {
      name: 'John Doe',
      email: 'john@example.com',
      password: hashedPassword,
      role: 'user',
      wallet_balance: 100000.00
    },
    {
      name: 'Jane Smith',
      email: 'jane@example.com',
      password: hashedPassword,
      role: 'user',
      wallet_balance: 150000.00
    }
  ];

  for (const user of users) {
    await pool.query(`
      INSERT INTO users (name, email, password, role, wallet_balance)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (email) DO NOTHING
    `, [user.name, user.email, user.password, user.role, user.wallet_balance]);
  }

  console.log('✅ Users seeded successfully!');
};

const seedProducts = async () => {
  console.log('📈 Seeding products...');

  const products = [
    {
      name: 'Reliance Industries Ltd',
      category: 'Stocks',
      price: 2450.75,
      description: 'Leading Indian conglomerate with interests in petrochemicals, refining, oil, and telecommunications.',
      pe_ratio: 18.5,
      market_cap: 16500000000000,
      volume: 2500000
    },
    {
      name: 'TCS (Tata Consultancy Services)',
      category: 'Stocks',
      price: 3850.25,
      description: 'Global IT services, consulting and business solutions organization.',
      pe_ratio: 25.8,
      market_cap: 14000000000000,
      volume: 1800000
    },
    {
      name: 'HDFC Bank Ltd',
      category: 'Stocks',
      price: 1650.50,
      description: 'Leading private sector bank in India with strong retail and corporate banking presence.',
      pe_ratio: 22.3,
      market_cap: 12000000000000,
      volume: 3200000
    },
    {
      name: 'SBI Bluechip Fund',
      category: 'Mutual Funds',
      price: 125.45,
      description: 'Large-cap equity mutual fund focusing on blue-chip companies.',
      pe_ratio: null,
      market_cap: 85000000000,
      volume: 150000
    },
    {
      name: 'Axis Long Term Equity Fund',
      category: 'Mutual Funds',
      price: 89.75,
      description: 'ELSS (Equity Linked Savings Scheme) with tax benefits under Section 80C.',
      pe_ratio: null,
      market_cap: 45000000000,
      volume: 95000
    },
    {
      name: 'Infosys Ltd',
      category: 'Stocks',
      price: 1850.80,
      description: 'Global leader in next-generation digital services and consulting.',
      pe_ratio: 28.2,
      market_cap: 7800000000000,
      volume: 2100000
    },
    {
      name: 'ICICI Prudential Technology Fund',
      category: 'Mutual Funds',
      price: 156.30,
      description: 'Technology-focused mutual fund investing in IT and tech companies.',
      pe_ratio: null,
      market_cap: 32000000000,
      volume: 75000
    }
  ];

  for (const product of products) {
    // Check if product already exists
    const existingProduct = await pool.query('SELECT id FROM products WHERE name = $1', [product.name]);
    
    if (existingProduct.rows.length === 0) {
      await pool.query(`
        INSERT INTO products (name, symbol, category, current_price, description, pe_ratio, market_cap, volume, risk_level, is_active)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `, [
        product.name, 
        product.name.replace(/\s+/g, '').substring(0, 10), // Generate symbol from name
        product.category, 
        product.price, 
        product.description, 
        product.pe_ratio, 
        product.market_cap, 
        product.volume,
        'Medium', // Default risk level
        true // Default active status
      ]);
      console.log(`  ✅ Added product: ${product.name}`);
    } else {
      console.log(`  ⏭️  Product already exists: ${product.name}`);
    }
  }

  console.log('✅ Products seeded successfully!');
};

const seedPortfolio = async () => {
  console.log('💼 Seeding portfolio...');

  // Get actual user IDs from database
  const usersResult = await pool.query('SELECT id FROM users ORDER BY id');
  const userIds = usersResult.rows.map(row => row.id);
  
  console.log(`  📋 Found users: ${userIds.join(', ')}`);

  const portfolioData = [
    {
      user_id: userIds[0], // Admin user
      product_id: 5, // Reliance Industries
      quantity: 5.0,
      average_price: 2450.75
    },
    {
      user_id: userIds[0], // Admin user
      product_id: 6, // TCS
      quantity: 2.0,
      average_price: 3850.25
    },
    {
      user_id: userIds[1], // John Doe
      product_id: 7, // HDFC Bank
      quantity: 10.0,
      average_price: 1650.50
    },
    {
      user_id: userIds[1], // John Doe
      product_id: 8, // SBI Bluechip Fund
      quantity: 100.0,
      average_price: 125.45
    },
    {
      user_id: userIds[2], // Jane Smith
      product_id: 9, // Axis Long Term Equity
      quantity: 50.0,
      average_price: 89.75
    }
  ];

  for (const holding of portfolioData) {
    await pool.query(`
      INSERT INTO portfolio (user_id, product_id, quantity, average_price)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (user_id, product_id) DO NOTHING
    `, [holding.user_id, holding.product_id, holding.quantity, holding.average_price]);
  }

  console.log('✅ Portfolio seeded successfully!');
};

const seedWatchlist = async () => {
  console.log('👀 Seeding watchlist...');

  // Get actual user IDs from database
  const usersResult = await pool.query('SELECT id FROM users ORDER BY id');
  const userIds = usersResult.rows.map(row => row.id);

  const watchlistData = [
    { user_id: userIds[0], product_id: 7 }, // Admin watching HDFC Bank
    { user_id: userIds[0], product_id: 10 }, // Admin watching Infosys
    { user_id: userIds[1], product_id: 5 }, // John watching Reliance
    { user_id: userIds[1], product_id: 6 }, // John watching TCS
    { user_id: userIds[2], product_id: 8 }, // Jane watching SBI Bluechip
    { user_id: userIds[2], product_id: 9 }  // Jane watching Axis Fund
  ];

  for (const item of watchlistData) {
    await pool.query(`
      INSERT INTO watchlist (user_id, product_id)
      VALUES ($1, $2)
      ON CONFLICT (user_id, product_id) DO NOTHING
    `, [item.user_id, item.product_id]);
  }

  console.log('✅ Watchlist seeded successfully!');
};

const seedNotifications = async () => {
  console.log('🔔 Seeding notifications...');

  // Get actual user IDs from database
  const usersResult = await pool.query('SELECT id FROM users ORDER BY id');
  const userIds = usersResult.rows.map(row => row.id);

  const notifications = [
    {
      user_id: userIds[0], // Admin user
      type: 'order',
      title: 'Order Executed',
      message: 'Your buy order for Reliance Industries Ltd has been executed successfully.',
      data: JSON.stringify({ order_id: 1, product_name: 'Reliance Industries Ltd' })
    },
    {
      user_id: userIds[0], // Admin user
      type: 'alert',
      title: 'Price Alert Triggered',
      message: 'TCS has reached your target price of ₹3800.00',
      data: JSON.stringify({ alert_id: 1, product_name: 'TCS', target_price: 3800 })
    },
    {
      user_id: userIds[1], // John Doe
      type: 'system',
      title: 'Welcome to TradingApp',
      message: 'Welcome to our trading platform! Start exploring our products.',
      data: JSON.stringify({ welcome: true })
    },
    {
      user_id: userIds[1], // John Doe
      type: 'transaction',
      title: 'Transaction Successful',
      message: 'Your purchase of HDFC Bank Ltd shares has been completed.',
      data: JSON.stringify({ transaction_id: 1, product_name: 'HDFC Bank Ltd' })
    },
    {
      user_id: userIds[2], // Jane Smith
      type: 'order',
      title: 'Order Pending',
      message: 'Your sell order for SBI Bluechip Fund is pending execution.',
      data: JSON.stringify({ order_id: 2, product_name: 'SBI Bluechip Fund' })
    }
  ];

  for (const notification of notifications) {
    await pool.query(`
      INSERT INTO notifications (user_id, type, title, message, data, is_read)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [
      notification.user_id,
      notification.type,
      notification.title,
      notification.message,
      notification.data,
      Math.random() > 0.5 // Random read/unread status
    ]);
  }

  console.log('✅ Notifications seeded successfully!');
};

const seedKYC = async () => {
  console.log('📋 Seeding KYC...');

  // Get actual user IDs from database
  const usersResult = await pool.query('SELECT id, name, email FROM users WHERE role = "user" ORDER BY id');
  const userIds = usersResult.rows;

  const kycData = [
    {
      user_id: userIds[0].id, // John Doe
      name: userIds[0].name,
      email: userIds[0].email,
      pan_number: 'ABCDE1234F',
      address: '123 Main Street, Mumbai, Maharashtra 400001',
      phone: '9876543210',
      status: 'approved'
    },
    {
      user_id: userIds[1].id, // Jane Smith
      name: userIds[1].name,
      email: userIds[1].email,
      pan_number: 'FGHIJ5678K',
      address: '456 Park Avenue, Delhi, Delhi 110001',
      phone: '9876543211',
      status: 'pending'
    }
  ];

  for (const kyc of kycData) {
    await pool.query(`
      INSERT INTO kyc (user_id, name, email, pan_number, address, phone, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (pan_number) DO NOTHING
    `, [
      kyc.user_id,
      kyc.name,
      kyc.email,
      kyc.pan_number,
      kyc.address,
      kyc.phone,
      kyc.status
    ]);
  }

  console.log('✅ KYC seeded successfully!');
};

const seedAuditLogs = async () => {
  console.log('📊 Seeding audit logs...');

  // Get actual user IDs from database
  const usersResult = await pool.query('SELECT id FROM users ORDER BY id');
  const userIds = usersResult.rows.map(row => row.id);

  const auditLogs = [
    {
      user_id: userIds[0], // Admin user
      action: 'LOGIN',
      resource: 'user',
      resource_id: userIds[0],
      details: JSON.stringify({ ip_address: '127.0.0.1', user_agent: 'Mozilla/5.0' }),
      ip_address: '127.0.0.1',
      user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    },
    {
      user_id: userIds[0], // Admin user
      action: 'CREATE_ORDER',
      resource: 'order',
      resource_id: 1,
      details: JSON.stringify({ product_id: 5, quantity: 5, order_type: 'buy' }),
      ip_address: '127.0.0.1',
      user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    },
    {
      user_id: userIds[1], // John Doe
      action: 'LOGIN',
      resource: 'user',
      resource_id: userIds[1],
      details: JSON.stringify({ ip_address: '192.168.1.100', user_agent: 'Mozilla/5.0' }),
      ip_address: '192.168.1.100',
      user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
    },
    {
      user_id: userIds[1], // John Doe
      action: 'BUY_PRODUCT',
      resource: 'transaction',
      resource_id: 1,
      details: JSON.stringify({ product_id: 7, units: 10, total_amount: 16505.00 }),
      ip_address: '192.168.1.100',
      user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
    },
    {
      user_id: userIds[2], // Jane Smith
      action: 'SUBMIT_KYC',
      resource: 'kyc',
      resource_id: 1,
      details: JSON.stringify({ pan_number: 'FGHIJ5678K', status: 'pending' }),
      ip_address: '10.0.0.50',
      user_agent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36'
    }
  ];

  for (const log of auditLogs) {
    await pool.query(`
      INSERT INTO audit_logs (user_id, action, resource, resource_id, details, ip_address, user_agent)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [
      log.user_id,
      log.action,
      log.resource,
      log.resource_id,
      log.details,
      log.ip_address,
      log.user_agent
    ]);
  }

  console.log('✅ Audit logs seeded successfully!');
};

if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };
