import express, { Request, Response, NextFunction } from 'express';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();

// Basic middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: 'http://localhost:5173', // Vite frontend URL
  credentials: true, // Allow cookies
}));

// Request logging
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log('Request body:', req.body);
  next();
});

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || '103.109.7.120',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'my-secret-pw',
  database: process.env.DB_NAME || 'masterdatabase',
  port: parseInt(process.env.DB_PORT || '3307'),
};

console.log('Database config:', {
  host: dbConfig.host,
  user: dbConfig.user,
  database: dbConfig.database,
  port: dbConfig.port,
});

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test database connection
async function testConnection() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    console.log(`✅ Connected to MySQL database: ${dbConfig.database} at ${dbConfig.host}:${dbConfig.port}`);
    await connection.end();
  } catch (error: any) {
    console.error('❌ Database connection failed:', error.message);
  }
}

// Initialize database table
async function initializeDatabase() {
  try {
    const connection = await pool.getConnection();
    
    // Check if table exists and its structure
    try {
      const [columns] = await connection.query('DESCRIBE users_login');
      console.log('📋 Current table structure:', columns);
    } catch (error) {
      console.log('📋 Table does not exist yet, will create it');
    }
    
    // Create table if it doesn't exist
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users_login (
        id INT AUTO_INCREMENT PRIMARY KEY,
        full_name VARCHAR(132) NOT NULL,
        email VARCHAR(132) UNIQUE NOT NULL,
        password VARCHAR(255),
        is_verified TINYINT(1) DEFAULT 0,
        is_admin TINYINT(1) DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Add or modify columns
    try {
      const [columns] = await connection.query('DESCRIBE users_login');
      const hasGoogleId = (columns as any[]).some(col => col.Field === 'google_id');
      const hasSessionActive = (columns as any[]).some(col => col.Field === 'session_active');
      const hasFirstName = (columns as any[]).some(col => col.Field === 'first_name');
      const hasFullName = (columns as any[]).some(col => col.Field === 'full_name');
      const hasIsAdmin = (columns as any[]).some(col => col.Field === 'is_admin');
      
      // Add google_id if missing
      if (!hasGoogleId) {
        await connection.query('ALTER TABLE users_login ADD COLUMN google_id VARCHAR(255) UNIQUE');
        console.log('✅ Added google_id column');
      }
      
      // Add session_active if missing
      if (!hasSessionActive) {
        await connection.query('ALTER TABLE users_login ADD COLUMN session_active TINYINT(1) DEFAULT 0');
        console.log('✅ Added session_active column');
      }
      
      // Add is_admin if missing
      if (!hasIsAdmin) {
        await connection.query('ALTER TABLE users_login ADD COLUMN is_admin TINYINT(1) DEFAULT 0');
        console.log('✅ Added is_admin column');
      }
      
      // Remove first_name if it exists
      if (hasFirstName) {
        await connection.query('ALTER TABLE users_login DROP COLUMN first_name');
        console.log('✅ Removed first_name column');
      }
      
      // Add or modify full_name if missing or incorrect
      if (!hasFullName) {
        await connection.query('ALTER TABLE users_login ADD COLUMN full_name VARCHAR(132) NOT NULL');
        console.log('✅ Added full_name column');
      } else {
        // Ensure full_name is NOT NULL
        await connection.query('ALTER TABLE users_login MODIFY COLUMN full_name VARCHAR(132) NOT NULL');
        console.log('✅ Modified full_name to NOT NULL');
      }
    } catch (error: any) {
      console.error('❌ Failed to modify table schema:', error.message);
    }
    
    console.log('✅ Users table is ready');
    connection.release();
  } catch (error: any) {
    console.error('❌ Database initialization error:', error.message);
  }
}

// Setup admin account
async function setupAdminAccount() {
  try {
    const connection = await pool.getConnection();
    
    // Check if admin account already exists
    const [existingAdmin] = await connection.query('SELECT * FROM users_login WHERE email = ?', ['admin@gmail.com']);
    
    if ((existingAdmin as any[]).length === 0) {
      // Create admin account
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash('testing456', saltRounds);
      
      await connection.query(
        'INSERT INTO users_login (full_name, email, password, is_verified, is_admin, session_active) VALUES (?, ?, ?, ?, ?, ?)',
        ['Admin User', 'admin@gmail.com', hashedPassword, 1, 1, 0]
      );
      
      console.log('✅ Admin account created: admin@gmail.com');
    } else {
      console.log('✅ Admin account already exists');
    }
    
    connection.release();
  } catch (error: any) {
    console.error('❌ Failed to setup admin account:', error.message);
  }
}

// Check if session_active column exists
async function hasSessionActiveColumn(): Promise<boolean> {
  try {
    const [columns] = await pool.query('DESCRIBE users_login');
    return (columns as any[]).some((col: any) => col.Field === 'session_active');
  } catch (error) {
    console.error('❌ Error checking session_active column:', error);
    return false;
  }
}

// Initialize database on startup
testConnection();
initializeDatabase().then(() => {
  // Setup admin account and orders table after database initialization is complete
  setupAdminAccount();
  initializeOrdersTable();
});

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ 
    message: 'Server is running successfully', 
    port: 3001,
    timestamp: new Date().toISOString(),
  });
});

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Backend API is running on port 3001' });
});

// Sign up endpoint
app.post('/api/signup', async (req: Request, res: Response) => {
  try {
    console.log('📝 Signup attempt with data:', req.body);
    
    const { full_name, email, password } = req.body;

    // Validation
    if (!full_name || !email || !password) {
      console.log('❌ Missing required fields');
      return res.status(400).json({ 
        message: 'All fields are required',
        received: { full_name: !!full_name, email: !!email, password: !!password },
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // Check if user already exists
    const [existingUsers] = await pool.query('SELECT email FROM users_login WHERE email = ?', [email]);
    if ((existingUsers as any[]).length > 0) {
      console.log('❌ Email already exists:', email);
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert user
    const [result] = await pool.query(
      'INSERT INTO users_login (full_name, email, password, is_verified) VALUES (?, ?, ?, ?)',
      [full_name, email, hashedPassword, 0]
    );

    console.log('✅ User created successfully:', email);
    res.status(201).json({ 
      message: 'Account created successfully! Please sign in.',
      userId: (result as any).insertId,
    });

  } catch (error: any) {
    console.error('❌ Signup error:', error.message);
    res.status(500).json({ 
      message: 'Failed to create account. Please try again.',
      error: error.message,
    });
  }
});

// Sign in endpoint
app.post('/api/signin', async (req: Request, res: Response) => {
  try {
    console.log('🔐 Signin attempt with email:', req.body.email);
    
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ 
        message: 'Email and password are required',
        received: { email: !!email, password: !!password },
      });
    }

    // Find user by email
    const [users] = await pool.query('SELECT * FROM users_login WHERE email = ?', [email]);
    const user = (users as any[])[0];

    if (!user) {
      console.log('❌ User not found:', email);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      console.log('❌ Invalid password for user:', email);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Update session status if column exists
    const hasSessionActive = await hasSessionActiveColumn();
    if (hasSessionActive) {
      await pool.query('UPDATE users_login SET session_active = TRUE WHERE id = ?', [user.id]);
    }

    console.log('✅ User signed in successfully:', email);
    res.status(200).json({
      message: 'Sign in successful',
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        is_verified: user.is_verified,
        is_admin: user.is_admin,
        created_at: user.created_at,
      },
    });

  } catch (error: any) {
    console.error('❌ Signin error:', error.message);
    res.status(500).json({ 
      message: 'Failed to sign in. Please try again.',
      error: error.message,
    });
  }
});

// Google Sign-In endpoint
app.post('/api/signin/google', async (req: Request, res: Response) => {
  try {
    console.log('🔐 Google Sign-In attempt with payload:', req.body);

    const { credential } = req.body;
    if (!credential || !credential.email || !credential.sub) {
      console.log('❌ Invalid Google credential provided');
      return res.status(400).json({ message: 'Invalid Google credential provided' });
    }

    const { email, name, sub: google_id } = credential;

    // Check if user exists by email
    let user;
    const [existingUsers] = await pool.query('SELECT * FROM users_login WHERE email = ?', [email]);
    user = (existingUsers as any[])[0];

    if (!user) {
      // Create new user
      const [result] = await pool.query(
        'INSERT INTO users_login (full_name, email, google_id, session_active, is_verified) VALUES (?, ?, ?, ?, ?)',
        [name || 'Google User', email, google_id, true, 1]
      );
      const [newUser] = await pool.query('SELECT * FROM users_login WHERE id = ?', [(result as any).insertId]);
      user = (newUser as any[])[0];
      console.log('✅ Created new user from Google Sign-In:', email);
    } else {
      // Update google_id and session_active if columns exist
      const hasSessionActive = await hasSessionActiveColumn();
      const hasGoogleId = await pool.query('DESCRIBE users_login').then(([columns]) => (columns as any[]).some(col => col.Field === 'google_id'));
      if (hasGoogleId && hasSessionActive) {
        await pool.query('UPDATE users_login SET google_id = ?, session_active = TRUE WHERE email = ?', [google_id, email]);
      } else if (hasGoogleId) {
        await pool.query('UPDATE users_login SET google_id = ? WHERE email = ?', [google_id, email]);
      } else if (hasSessionActive) {
        await pool.query('UPDATE users_login SET session_active = TRUE WHERE email = ?', [email]);
      }
      console.log('✅ Updated user for Google Sign-In:', email);
    }

    console.log('✅ Google Sign-In successful:', email);
    res.status(200).json({
      message: 'Google Sign-In successful',
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        is_verified: user.is_verified,
        created_at: user.created_at,
      },
    });

  } catch (error: any) {
    console.error('❌ Google Sign-In error:', error.message);
    res.status(500).json({ 
      message: 'Failed to sign in with Google. Please try again.',
      error: error.message,
    });
  }
});

// Logout endpoint
app.post('/api/logout', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (email) {
      const hasSessionActive = await hasSessionActiveColumn();
      if (hasSessionActive) {
        await pool.query('UPDATE users_login SET session_active = FALSE WHERE email = ?', [email]);
      }
      console.log('✅ User logged out:', email);
    }
    res.json({ message: 'Logged out successfully' });
  } catch (error: any) {
    console.error('❌ Logout error:', error.message);
    res.status(500).json({ message: 'Failed to log out' });
  }
});

// Admin endpoints
// Get all logged-in users (admin only)
app.get('/api/admin/users', async (req: Request, res: Response) => {
  try {
    const { email } = req.query;
    
    if (!email) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Check if user is admin
    const [users] = await pool.query('SELECT * FROM users_login WHERE email = ? AND is_admin = 1', [email]);
    if ((users as any[]).length === 0) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    // Get all users with session status
    const [allUsers] = await pool.query(`
      SELECT 
        id, 
        full_name, 
        email, 
        is_verified, 
        is_admin, 
        session_active, 
        created_at 
      FROM users_login 
      ORDER BY created_at DESC
    `);

    res.json({ users: allUsers });
  } catch (error: any) {
    console.error('❌ Admin users error:', error.message);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

// Get admin dashboard stats
app.get('/api/admin/stats', async (req: Request, res: Response) => {
  try {
    const { email } = req.query;
    
    if (!email) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Check if user is admin
    const [users] = await pool.query('SELECT * FROM users_login WHERE email = ? AND is_admin = 1', [email]);
    if ((users as any[]).length === 0) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    // Get various stats
    const [totalUsers] = await pool.query('SELECT COUNT(*) as count FROM users_login');
    const [activeUsers] = await pool.query('SELECT COUNT(*) as count FROM users_login WHERE session_active = 1');
    const [verifiedUsers] = await pool.query('SELECT COUNT(*) as count FROM users_login WHERE is_verified = 1');
    const [recentUsers] = await pool.query(`
      SELECT COUNT(*) as count 
      FROM users_login 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
    `);
    const [totalOrders] = await pool.query('SELECT COUNT(*) as count FROM orders');
    const [pendingOrders] = await pool.query('SELECT COUNT(*) as count FROM orders WHERE status = "pending"');
    const [completedOrders] = await pool.query('SELECT COUNT(*) as count FROM orders WHERE status = "completed"');

    res.json({
      stats: {
        totalUsers: (totalUsers as any[])[0].count,
        activeUsers: (activeUsers as any[])[0].count,
        verifiedUsers: (verifiedUsers as any[])[0].count,
        recentUsers: (recentUsers as any[])[0].count,
        totalOrders: (totalOrders as any[])[0].count,
        pendingOrders: (pendingOrders as any[])[0].count,
        completedOrders: (completedOrders as any[])[0].count,
      }
    });
  } catch (error: any) {
    console.error('❌ Admin stats error:', error.message);
    res.status(500).json({ message: 'Failed to fetch stats' });
  }
});

// Manual admin creation endpoint (for development/testing)
app.post('/api/admin/create', async (req: Request, res: Response) => {
  try {
    const { email, password, full_name } = req.body;
    
    if (!email || !password || !full_name) {
      return res.status(400).json({ message: 'Email, password, and full_name are required' });
    }

    // Check if admin already exists
    const [existingAdmin] = await pool.query('SELECT * FROM users_login WHERE email = ?', [email]);
    if ((existingAdmin as any[]).length > 0) {
      return res.status(400).json({ message: 'Admin account already exists' });
    }

    // Create admin account
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    await pool.query(
      'INSERT INTO users_login (full_name, email, password, is_verified, is_admin, session_active) VALUES (?, ?, ?, ?, ?, ?)',
      [full_name, email, hashedPassword, 1, 1, 0]
    );
    
    console.log('✅ Admin account created manually:', email);
    res.status(201).json({ message: 'Admin account created successfully' });
  } catch (error: any) {
    console.error('❌ Manual admin creation error:', error.message);
    res.status(500).json({ message: 'Failed to create admin account' });
  }
});

// Initialize orders table
async function initializeOrdersTable() {
  try {
    const connection = await pool.getConnection();
    
    // Create orders table if it doesn't exist
    await connection.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id VARCHAR(255) UNIQUE NOT NULL,
        user_id INT,
        user_email VARCHAR(255),
        company_cin VARCHAR(255),
        company_name VARCHAR(255),
        status ENUM('pending', 'completed', 'cancelled') DEFAULT 'pending',
        amount DECIMAL(10,2) DEFAULT 0.00,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users_login(id) ON DELETE SET NULL
      )
    `);
    
    console.log('✅ Orders table is ready');
    connection.release();
  } catch (error: any) {
    console.error('❌ Orders table initialization error:', error.message);
  }
}

// Create order endpoint (when user visits pricing from company page)
app.post('/api/orders/create', async (req: Request, res: Response) => {
  try {
    const { user_id, user_email, company_cin, company_name } = req.body;
    
    if (!company_cin) {
      return res.status(400).json({ message: 'Company CIN is required' });
    }

    // Generate order ID using CIN
    const orderId = `ORDER-${company_cin}-${Date.now()}`;
    
    // Check if order already exists for this user and company on the same day
    const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
    const [existingOrders] = await pool.query(
      `SELECT * FROM orders 
       WHERE user_id = ? 
       AND company_cin = ? 
       AND DATE(created_at) = ?`,
      [user_id, company_cin, today]
    );
    
    if ((existingOrders as any[]).length > 0) {
      console.log('🔄 Duplicate order prevented for user:', user_email, 'company:', company_name, 'date:', today);
      return res.status(200).json({ 
        message: 'Order already exists for today',
        order: (existingOrders as any[])[0],
        isDuplicate: true
      });
    }

    // Create new order
    const [result] = await pool.query(
      'INSERT INTO orders (order_id, user_id, user_email, company_cin, company_name, status) VALUES (?, ?, ?, ?, ?, ?)',
      [orderId, user_id, user_email, company_cin, company_name, 'pending']
    );

    console.log('✅ Order created:', orderId);
    res.status(201).json({ 
      message: 'Order created successfully',
      order: {
        id: (result as any).insertId,
        order_id: orderId,
        user_id,
        user_email,
        company_cin,
        company_name,
        status: 'pending'
      }
    });

  } catch (error: any) {
    console.error('❌ Order creation error:', error.message);
    res.status(500).json({ message: 'Failed to create order' });
  }
});

// Get all orders (admin only)
app.get('/api/admin/orders', async (req: Request, res: Response) => {
  try {
    const { email } = req.query;
    
    if (!email) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Check if user is admin
    const [users] = await pool.query('SELECT * FROM users_login WHERE email = ? AND is_admin = 1', [email]);
    if ((users as any[]).length === 0) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    // Get all orders with user details
    const [orders] = await pool.query(`
      SELECT 
        o.id,
        o.order_id,
        o.user_id,
        o.user_email,
        o.company_cin,
        o.company_name,
        o.status,
        o.amount,
        o.created_at,
        o.updated_at,
        u.full_name as user_full_name
      FROM orders o
      LEFT JOIN users_login u ON o.user_id = u.id
      ORDER BY o.created_at DESC
        `);

    res.json({ orders });
  } catch (error: any) {
    console.error('❌ Admin orders error:', error.message);
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
});

// Delete user (admin only)
app.delete('/api/admin/users/:userId', async (req: Request, res: Response) => {
  try {
    const { email } = req.query;
    const { userId } = req.params;
    
    if (!email) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Check if user is admin
    const [users] = await pool.query('SELECT * FROM users_login WHERE email = ? AND is_admin = 1', [email]);
    if ((users as any[]).length === 0) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    // Check if user exists and is not an admin
    const [targetUser] = await pool.query('SELECT * FROM users_login WHERE id = ?', [userId]);
    if ((targetUser as any[]).length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    if ((targetUser as any[])[0].is_admin) {
      return res.status(403).json({ message: 'Cannot delete admin users' });
    }

    // Delete user
    await pool.query('DELETE FROM users_login WHERE id = ?', [userId]);
    
    console.log('✅ User deleted:', userId);
    res.json({ message: 'User deleted successfully' });
  } catch (error: any) {
    console.error('❌ Delete user error:', error.message);
    res.status(500).json({ message: 'Failed to delete user' });
  }
});

// Test endpoint to check orders
app.get('/api/test/orders', async (req: Request, res: Response) => {
  try {
    const [orders] = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');
    res.json({ 
      message: 'Orders test endpoint',
      count: (orders as any[]).length,
      orders: orders 
    });
  } catch (error: any) {
    console.error('❌ Test orders error:', error.message);
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
});

// Cleanup duplicate orders (admin only)
app.post('/api/admin/orders/cleanup', async (req: Request, res: Response) => {
  try {
    const { email } = req.query;
    
    if (!email) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Check if user is admin
    const [users] = await pool.query('SELECT * FROM users_login WHERE email = ? AND is_admin = 1', [email]);
    if ((users as any[]).length === 0) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    // Find and remove duplicate orders (keep the first one for each user-company-date combination)
    const [duplicates] = await pool.query(`
      DELETE o1 FROM orders o1
      INNER JOIN orders o2 
      WHERE o1.id > o2.id 
      AND o1.user_id = o2.user_id 
      AND o1.company_cin = o2.company_cin 
      AND DATE(o1.created_at) = DATE(o2.created_at)
    `);

    console.log('🧹 Cleaned up duplicate orders');
    res.json({ 
      message: 'Duplicate orders cleaned up successfully',
      deletedCount: (duplicates as any).affectedRows || 0
    });
  } catch (error: any) {
    console.error('❌ Cleanup orders error:', error.message);
    res.status(500).json({ message: 'Failed to cleanup orders' });
  }
});

// Update order status (admin only)
app.put('/api/admin/orders/:orderId/status', async (req: Request, res: Response) => {
  try {
    const { email } = req.query;
    const { orderId } = req.params;
    const { status } = req.body;
    
    if (!email) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Check if user is admin
    const [users] = await pool.query('SELECT * FROM users_login WHERE email = ? AND is_admin = 1', [email]);
    if ((users as any[]).length === 0) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    if (!['pending', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    // Update order status
    await pool.query('UPDATE orders SET status = ? WHERE order_id = ?', [status, orderId]);
    
    console.log('✅ Order status updated:', orderId, 'to', status);
    res.json({ message: 'Order status updated successfully' });
  } catch (error: any) {
    console.error('❌ Update order status error:', error.message);
    res.status(500).json({ message: 'Failed to update order status' });
  }
});

// Start server
const PORT = 3001;

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📋 Available endpoints:`);
  console.log(`   GET  http://localhost:${PORT}/`);
  console.log(`   GET  http://localhost:${PORT}/api/health`);
  console.log(`   POST http://localhost:${PORT}/api/signup`);
  console.log(`   POST http://localhost:${PORT}/api/signin`);
  console.log(`   POST http://localhost:${PORT}/api/signin/google`);
  console.log(`   POST http://localhost:${PORT}/api/logout`);
  console.log(`   POST http://localhost:${PORT}/api/orders/create`);
  console.log(`   GET  http://localhost:${PORT}/api/test/orders (test endpoint)`);
  console.log(`   GET  http://localhost:${PORT}/api/admin/users (admin only)`);
  console.log(`   GET  http://localhost:${PORT}/api/admin/stats (admin only)`);
  console.log(`   GET  http://localhost:${PORT}/api/admin/orders (admin only)`);
  console.log(`   DELETE http://localhost:${PORT}/api/admin/users/:id (admin only)`);
  console.log(`   PUT http://localhost:${PORT}/api/admin/orders/:id/status (admin only)`);
  console.log(`   POST http://localhost:${PORT}/api/admin/orders/cleanup (admin only)`);
  console.log(`   POST http://localhost:${PORT}/api/admin/create (manual admin creation)`);
  console.log(`💾 Connected to database: ${dbConfig.database} at ${dbConfig.host}:${dbConfig.port}`);
  console.log(`👑 Admin account: admin@gmail.com / testing456`);
});