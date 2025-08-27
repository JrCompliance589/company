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
initializeDatabase();

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
  console.log(`💾 Connected to database: ${dbConfig.database} at ${dbConfig.host}:${dbConfig.port}`);
});