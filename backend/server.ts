import express, { Request, Response, NextFunction } from 'express';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import cors from 'cors';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
dotenv.config();

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Log Supabase configuration
console.log('Supabase URL:', process.env.SUPABASE_URL);
console.log('Supabase Service Role Key:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'Not set');

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

// Email configuration
const emailConfig = {
  host: 'notify.jrcompliance.com',
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: 'support@verifyvista.com',
    pass: 'IMIshA,%,12'
  }
};

// Create nodemailer transporter
const transporter = nodemailer.createTransport(emailConfig);

// Verify email connection
async function verifyEmailConnection() {
  try {
    await transporter.verify();
    console.log('✅ Email server connection verified');
  } catch (error: any) {
    console.error('❌ Email server connection failed:', error.message);
  }
}

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
    await connection.end();
  } catch (error: any) {
    console.error('❌ Database connection failed:', error.message);
  }
}

// Test Supabase connection
async function testSupabaseConnection() {
  try {
    const { data, error } = await supabase.from('users_login').select('id').limit(1);
    if (error) throw error;
    console.log('✅ Supabase connection successful:', data);
  } catch (error: any) {
    console.error('❌ Supabase connection failed:', error.message, error.details);
  }
}

// Supabase sync function
async function syncToSupabase(userData: any) {
  try {
    const supabaseData = {
      id: userData.id,
      full_name: userData.full_name,
      email: userData.email,
      password: userData.password ?? null,
      is_verified: userData.is_verified ?? false,
      is_admin: userData.is_admin ?? false,
      reset_token: userData.reset_token ?? null,
      reset_token_expires: userData.reset_token_expires ? new Date(userData.reset_token_expires).toISOString() : null,
      verification_token: userData.verification_token ?? null,
      verification_token_expires: userData.verification_token_expires ? new Date(userData.verification_token_expires).toISOString() : null,
      created_at: userData.created_at ? new Date(userData.created_at).toISOString() : new Date().toISOString(),
      google_id: userData.google_id ?? null,
      session_active: userData.session_active ?? false
    };
    const { error } = await supabase.from('users_login').upsert(supabaseData, { onConflict: 'id' });
    if (error) throw error;
    console.log('✅ add user to Supabase:', userData.email);
    return { success: true };
  } catch (error: any) {
    console.error('❌ Supabase add failed:', error.message, error.details);
    throw new Error(`Supabase add failed: ${error.message}`);
  }
}

// Initialize database table
async function initializeDatabase() {
  try {
    const connection = await pool.getConnection();
    
    // Check if table exists and its structure
    try {
      const [columns] = await connection.query('DESCRIBE users_login');
    } catch (error) {
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
        reset_token VARCHAR(255),
        reset_token_expires DATETIME,
        verification_token VARCHAR(255),
        verification_token_expires DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        google_id VARCHAR(255) UNIQUE,
        session_active TINYINT(1) DEFAULT 0
      )
    `);
    
    // Verify table structure
    const [columns] = await connection.query('DESCRIBE users_login');
    console.log('✅ Verified table structure:', columns);
    
    connection.release();
  } catch (error: any) {
    console.error('❌ Database initialization error:', error.message);
  }
}

// Database migration for verification columns
async function migrateDatabase() {
  try {
    const connection = await pool.getConnection();
    
    // Add verification_token column if it doesn't exist
    const [columns] = await connection.query('DESCRIBE users_login');
    const hasVerificationToken = (columns as any[]).some(col => col.Field === 'verification_token');
    if (!hasVerificationToken) {
      await connection.query('ALTER TABLE users_login ADD COLUMN verification_token VARCHAR(255)');
    }

    // Add verification_token_expires column if it doesn't exist
    const hasVerificationTokenExpires = (columns as any[]).some(col => col.Field === 'verification_token_expires');
    if (!hasVerificationTokenExpires) {
      await connection.query('ALTER TABLE users_login ADD COLUMN verification_token_expires DATETIME');
    }

    connection.release();
  } catch (error: any) {
    console.error('❌ Database migration error:', error.message);
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
      
      // Sync to Supabase
      await syncToSupabase({
        full_name: 'Admin User',
        email: 'admin@gmail.com',
        is_verified: 1,
        is_admin: 1,
        session_active: 0,
        created_at: new Date()
      });
      
    } else {
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

// Send email utility function
async function sendEmail(to: string, subject: string, html: string) {
  try {
    const mailOptions = {
      from: 'VerifyVista Support <support@verifyvista.com>',
      to,
      subject,
      html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error('❌ Email sending failed:', error.message);
    return { success: false, error: error.message };
  }
}

// Generate verification email HTML
function generateVerificationEmailHTML(verifyLink: string, userName: string) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>Email Verification - VerifyVista</title>
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;700&display=swap" rel="stylesheet">
    </head>
    <body>
        <div class="tem-body" style="max-width: 80%; font-family: 'Poppins', sans-serif !important; display: grid; margin: 0 auto; overflow: hidden;">
            <!-- HEADER SECTION -->
            <div style="width: 100%; background: url(https://cdn.bitrix24.in/b28507921/sender/6c0/6c0fe7816478e93b3984b02ed5d5aa85/3c763066b22e3b27860611ad671d496d.png); text-align: center; background-size: cover; padding: 30px 0;">
                <img src="https://verifyvista.com/veri.png" 
                     alt="VerifyVista Logo" 
                     style="display: block; width: 25%; margin: 0 auto;">
                <h1 style="color: #fff; font-size: 28px; margin-top: 15px;">Verify Your Email Address</h1>
            </div>
            <!-- MESSAGE BODY -->
            <div class="tem-msg-body" style="background: url(https://cdn.bitrix24.in/b28507921/sender/654/65488d3f66a0a255b953311ba2871495/f50302def8d3e0d5759977bd4f938924.jpg) no-repeat center; background-size: cover; padding: 30px;">
                <div class="tem-msg" style="background: rgba(0,0,0,0.6); border-radius: 15px; padding: 25px;">
                    <h2 style="color: #FFD90F; font-weight: 700; font-size: 22px; margin-top: 0;">Hello ${userName},</h2>
                    <p style="font-size: 16px; color: white; margin-bottom: 15px;">
                        Thank you for signing up with <b>VerifyVista</b>! Please verify your email address to activate your account.
                    </p>
                    <p style="font-size: 16px; color: white; margin-bottom: 20px;">
                        Click the button below to verify your email:
                    </p>
                    <div style="text-align: center; margin: 25px 0;">
                        <a href="${verifyLink}" style="background-color: #FFD90F; color: #002fa5; padding: 14px 35px; text-decoration: none; font-weight: bold; border-radius: 40px; font-size: 18px; display: inline-block;">
                            ✅ Verify Email
                        </a>
                    </div>
                    <p style="font-size: 14px; color: #eee; margin-bottom: 10px;">
                        Or copy & paste this link into your browser:
                    </p>
                    <p style="word-break: break-all; background: #222; padding: 12px; border-radius: 8px; color: #FFD90F; font-size: 14px;">
                        ${verifyLink}
                    </p>
                    <div style="background: rgba(255,217,15,0.1); border: 1px solid #FFD90F; padding: 15px; border-radius: 10px; margin: 20px 0;">
                        <strong style="color: #FFD90F;">⚠️ Important:</strong>
                        <ul style="padding-left: 20px; color: white; font-size: 14px;">
                            <li>This link will expire in <b>24 hours</b> for security reasons</li>
                            <li>If you didn’t sign up, please ignore this email</li>
                            <li>You won’t be able to log in until your email is verified</li>
                        </ul>
                    </div>
                    <p style="font-size: 14px; color: #eee;">
                        Need help? Contact our support team at 
                        <a href="mailto:support@verifyvista.com" style="color: #FFD90F; font-weight: bold;">support@verifyvista.com</a>
                    </p>
                </div>
            </div>
            <!-- FOOTER -->
            <div class="tem-body-ft" style="background: url(https://cdn.bitrix24.in/b28507921/sender/42f/42f940d67fba9c2ef033c11465b00447/6af30d7e3e8774c792db4291b30716ca.jpg) no-repeat center; background-size: cover; text-align: center; padding: 20px;">
                <p style="color: #fff; font-size: 14px; margin-top: 10px;">
                    Best regards,<br><b>The VerifyVista Team</b>
                </p>
                <p style="color: #aaa; font-size: 12px; margin-top: 5px;">
                    This is an automated message. Please do not reply.
                </p>
            </div>
        </div>
    </body>
    </html>
  `;
}

// Generate password reset email HTML
function generateResetEmailHTML(resetLink: string, userName: string) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>Password Reset - VerifyVista</title>
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;700&display=swap" rel="stylesheet">
    </head>
    <body>
        <div class="tem-body" style="max-width: 80%; font-family: 'Poppins', sans-serif !important; display: grid; margin: 0 auto; overflow: hidden;">
            <!-- HEADER SECTION -->
            <div style="width: 100%; background: url(https://cdn.bitrix24.in/b28507921/sender/6c0/6c0fe7816478e93b3984b02ed5d5aa85/3c763066b22e3b27860611ad671d496d.png); text-align: center; background-size: cover; padding: 30px 0;">
                <img src="https://verifyvista.com/veri.png" 
                     alt="VerifyVista Logo" 
                     style="display: block; width: 25%; margin: 0 auto;">
                <h1 style="color: #fff; font-size: 28px; margin-top: 15px;">Password Reset Request</h1>
            </div>
            <!-- MESSAGE BODY -->
            <div class="tem-msg-body" style="background: url(https://cdn.bitrix24.in/b28507921/sender/654/65488d3f66a0a255b953311ba2871495/f50302def8d3e0d5759977bd4f938924.jpg) no-repeat center; background-size: cover; padding: 30px;">
                <div class="tem-msg" style="background: rgba(0,0,0,0.6); border-radius: 15px; padding: 25px;">
                    <h2 style="color: #FFD90F; font-weight: 700; font-size: 22px; margin-top: 0;">Hello ${userName},</h2>
                    <p style="font-size: 16px; color: white; margin-bottom: 15px;">
                        We received a request to reset your password for your <b>VerifyVista</b> account.
                    </p>
                    <p style="font-size: 16px; color: white; margin-bottom: 20px;">
                        If you made this request, click the button below to reset your password:
                    </p>
                    <div style="text-align: center; margin: 25px 0;">
                        <a href="${resetLink}" style="background-color: #FFD90F; color: #002fa5; padding: 14px 35px; text-decoration: none; font-weight: bold; border-radius: 40px; font-size: 18px; display: inline-block;">
                            🔒 Reset Your Password
                        </a>
                    </div>
                    <p style="font-size: 14px; color: #eee; margin-bottom: 10px;">
                        Or copy & paste this link into your browser:
                    </p>
                    <p style="word-break: break-all; background: #222; padding: 12px; border-radius: 8px; color: #FFD90F; font-size: 14px;">
                        ${resetLink}
                    </p>
                    <div style="background: rgba(255,217,15,0.1); border: 1px solid #FFD90F; padding: 15px; border-radius: 10px; margin: 20px 0;">
                        <strong style="color: #FFD90F;">⚠️ Important:</strong>
                        <ul style="padding-left: 20px; color: white; font-size: 14px;">
                            <li>This link will expire in <b>1 hour</b> for security reasons</li>
                            <li>If you didn’t request this reset, please ignore this email</li>
                            <li>Your password won’t change until you set a new one</li>
                        </ul>
                    </div>
                    <p style="font-size: 14px; color: #eee;">
                        Need help? Contact our support team at 
                        <a href="mailto:support@verifyvista.com" style="color: #FFD90F; font-weight: bold;">support@verifyvista.com</a>
                    </p>
                </div>
            </div>
            <!-- FOOTER -->
            <div class="tem-body-ft" style="background: url(https://cdn.bitrix24.in/b28507921/sender/42f/42f940d67fba9c2ef033c11465b00447/6af30d7e3e8774c792db4291b30716ca.jpg) no-repeat center; background-size: cover; text-align: center; padding: 20px;">
                <p style="color: #fff; font-size: 14px; margin-top: 10px;">
                    Best regards,<br><b>The VerifyVista Team</b>
                </p>
                <p style="color: #aaa; font-size: 12px; margin-top: 5px;">
                    This is an automated message. Please do not reply.
                </p>
            </div>
        </div>
    </body>
    </html>
  `;
}

// Initialize database on startup
testConnection();
verifyEmailConnection();
testSupabaseConnection();
initializeDatabase().then(() => {
  // Setup admin account and orders table after database initialization
  setupAdminAccount();
  initializeOrdersTable();
  migrateDatabase();
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

// Test Supabase endpoint
app.post('/api/test/supabase', async (req: Request, res: Response) => {
  try {
    const testData = {
      id: Date.now(),
      full_name: 'Test User',
      email: `test-${Date.now()}@example.com`,
      is_verified: false,
      created_at: new Date().toISOString()
    };
    const { error } = await supabase.from('users_login').insert(testData);
    if (error) throw error;
    res.status(200).json({ message: 'Test data inserted into Supabase', data: testData });
  } catch (error: any) {
    console.error('❌ Test Supabase error:', error.message, error.details);
    res.status(500).json({ message: 'Failed to insert test data', error: error.message });
  }
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

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpires = new Date(Date.now() + 24 * 3600000); // 24 hours

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert user
    const [result] = await pool.query(
      'INSERT INTO users_login (full_name, email, password, is_verified, verification_token, verification_token_expires) VALUES (?, ?, ?, ?, ?, ?)',
      [full_name, email, hashedPassword, 0, verificationToken, verificationTokenExpires]
    );

    // Sync to Supabase
    await syncToSupabase({
      id: (result as any).insertId,
      full_name,
      email,
      password: hashedPassword,
      is_verified: 0,
      verification_token: verificationToken,
      verification_token_expires: verificationTokenExpires,
      created_at: new Date()
    });

    // Send verification email
    const verificationLink = `http://localhost:5173/verify-email?token=${verificationToken}&email=${encodeURIComponent(email)}`;
    const emailHTML = generateVerificationEmailHTML(verificationLink, full_name);
    const emailResult = await sendEmail(
      email,
      'VerifyVista - Verify Your Email Address',
      emailHTML
    );

    if (!emailResult.success) {
      console.error('❌ Failed to send verification email:', emailResult.error);
      return res.status(500).json({ 
        message: 'Account created but failed to send verification email. Please contact support.',
        userId: (result as any).insertId,
      });
    }

    console.log('✅ User created successfully:', email);
    res.status(201).json({ 
      message: 'Account created successfully! Please check your email to verify your account.',
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

    // Check if user is verified
    if (!user.is_verified) {
      console.log('❌ User not verified:', email);
      return res.status(403).json({ 
        message: 'Please verify your email address before signing in. Check your inbox for the verification link.'
      });
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

    // Sync to Supabase
    await syncToSupabase({
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      is_verified: user.is_verified,
      is_admin: user.is_admin,
      session_active: hasSessionActive ? true : false,
      created_at: user.created_at,
      google_id: user.google_id
    });

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

// Forgot Password endpoint
app.post('/api/forgot-password', async (req: Request, res: Response) => {
  try {
    console.log('🔑 Forgot password request for:', req.body.email);
    
    const { email } = req.body;

    // Validation
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // Find user by email
    const [users] = await pool.query('SELECT * FROM users_login WHERE email = ?', [email]);
    const user = (users as any[])[0];

    if (!user) {
      console.log('❌ User not found for password reset:', email);
      return res.status(200).json({ 
        message: 'If an account with that email exists, we have sent a password reset link.' 
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpires = new Date(Date.now() + 3600000); // 1 hour from now

    // Save reset token to database
    await pool.query(
      'UPDATE users_login SET reset_token = ?, reset_token_expires = ? WHERE email = ?',
      [resetToken, resetTokenExpires, email]
    );

    // Sync to Supabase
    await syncToSupabase({
      id: user.id,
      full_name: user.full_name,
      email,
      reset_token: resetToken,
      reset_token_expires: resetTokenExpires
    });

    // Generate reset link
    const resetLink = `http://localhost:3003/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

    // Send email
    const emailHTML = generateResetEmailHTML(resetLink, user.full_name);
    const emailResult = await sendEmail(
      email,
      'VerifyVista - Password Reset Request',
      emailHTML
    );

    if (emailResult.success) {
      console.log('✅ Password reset email sent successfully to:', email);
      res.status(200).json({ 
        message: 'If an account with that email exists, we have sent a password reset link.' 
      });
    } else {
      console.error('❌ Failed to send password reset email:', emailResult.error);
      res.status(500).json({ 
        message: 'Failed to send password reset email. Please try again later.' 
      });
    }

  } catch (error: any) {
    console.error('❌ Forgot password error:', error.message);
    res.status(500).json({ 
      message: 'Failed to process password reset request. Please try again.',
      error: error.message,
    });
  }
});

// Reset Password endpoint
app.post('/api/reset-password', async (req: Request, res: Response) => {
  try {
    console.log('🔄 Password reset attempt for:', req.body.email);
    
    const { email, token, newPassword } = req.body;

    // Validation
    if (!email || !token || !newPassword) {
      return res.status(400).json({ message: 'Email, token, and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // Find user with valid reset token
    const [users] = await pool.query(`
      SELECT * FROM users_login 
      WHERE email = ? 
      AND reset_token = ? 
      AND reset_token_expires > NOW()
    `, [email, token]);

    const user = (users as any[])[0];

    if (!user) {
      console.log('❌ Invalid or expired reset token for:', email);
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Hash new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password and clear reset token
    await pool.query(`
      UPDATE users_login 
      SET password = ?, reset_token = NULL, reset_token_expires = NULL 
      WHERE email = ?
    `, [hashedPassword, email]);

    // Sync to Supabase
    await syncToSupabase({
      id: user.id,
      full_name: user.full_name,
      email,
      password: hashedPassword,
      reset_token: null,
      reset_token_expires: null
    });

    console.log('✅ Password reset successfully for:', email);
    res.status(200).json({ message: 'Password reset successfully. You can now sign in with your new password.' });

  } catch (error: any) {
    console.error('❌ Reset password error:', error.message);
    res.status(500).json({ 
      message: 'Failed to reset password. Please try again.',
      error: error.message,
    });
  }
});

// Verify reset token endpoint
app.post('/api/verify-reset-token', async (req: Request, res: Response) => {
  try {
    const { email, token } = req.body;

    if (!email || !token) {
      return res.status(400).json({ message: 'Email and token are required' });
    }

    // Find user with valid reset token
    const [users] = await pool.query(`
      SELECT email, full_name FROM users_login 
      WHERE email = ? 
      AND reset_token = ? 
      AND reset_token_expires > NOW()
    `, [email, token]);

    const user = (users as any[])[0];

    if (!user) {
      return res.status(400).json({ 
        message: 'Invalid or expired reset token',
        valid: false 
      });
    }

    res.status(200).json({ 
      message: 'Reset token is valid',
      valid: true,
      user: {
        email: user.email,
        full_name: user.full_name
      }
    });

  } catch (error: any) {
    console.error('❌ Verify reset token error:', error.message);
    res.status(500).json({ 
      message: 'Failed to verify reset token',
      error: error.message,
    });
  }
});

// Verify email endpoint
app.post('/api/verify-email', async (req: Request, res: Response) => {
  try {
    console.log('📧 Email verification attempt for:', req.body.email);
    
    const { email, token } = req.body;

    // Validation
    if (!email || !token) {
      return res.status(400).json({ message: 'Email and token are required' });
    }

    // Find user with valid verification token
    const [users] = await pool.query(`
      SELECT * FROM users_login 
      WHERE email = ? 
      AND verification_token = ? 
      AND verification_token_expires > NOW()
    `, [email, token]);

    const user = (users as any[])[0];

    if (!user) {
      console.log('❌ Invalid or expired verification token for:', email);
      return res.status(400).json({ message: 'Invalid or expired verification token' });
    }

    // Mark user as verified and clear verification token
    await pool.query(`
      UPDATE users_login 
      SET is_verified = 1, verification_token = NULL, verification_token_expires = NULL 
      WHERE email = ?
    `, [email]);

    // Sync to Supabase
    await syncToSupabase({
      id: user.id,
      full_name: user.full_name,
      email,
      is_verified: 1,
      verification_token: null,
      verification_token_expires: null
    });

    console.log('✅ Email verified successfully for:', email);
    res.status(200).json({ 
      message: 'Email verified successfully. You can now sign in.',
      user: {
        email: user.email,
        full_name: user.full_name
      }
    });

  } catch (error: any) {
    console.error('❌ Email verification error:', error.message);
    res.status(500).json({ 
      message: 'Failed to verify email. Please try again.',
      error: error.message,
    });
  }
});

// Resend verification email endpoint
app.post('/api/resend-verification', async (req: Request, res: Response) => {
  try {
    console.log('📧 Resend verification request for:', req.body.email);
    
    const { email } = req.body;

    // Validation
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // Find user by email
    const [users] = await pool.query('SELECT * FROM users_login WHERE email = ?', [email]);
    const user = (users as any[])[0];

    if (!user) {
      console.log('❌ User not found for resend verification:', email);
      return res.status(404).json({ message: 'No account found with this email.' });
    }

    if (user.is_verified) {
      console.log('❌ User already verified:', email);
      return res.status(400).json({ message: 'This email is already verified.' });
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpires = new Date(Date.now() + 24 * 3600000); // 24 hours

    // Update verification token
    await pool.query(
      'UPDATE users_login SET verification_token = ?, verification_token_expires = ? WHERE email = ?',
      [verificationToken, verificationTokenExpires, email]
    );

    // Sync to Supabase
    await syncToSupabase({
      id: user.id,
      full_name: user.full_name,
      email,
      verification_token: verificationToken,
      verification_token_expires: verificationTokenExpires
    });

    // Send verification email
    const verificationLink = `http://localhost:3003/verify-email?token=${verificationToken}&email=${encodeURIComponent(email)}`;
    const emailHTML = generateVerificationEmailHTML(verificationLink, user.full_name);
    const emailResult = await sendEmail(
      email,
      'VerifyVista - Verify Your Email Address',
      emailHTML
    );

    if (emailResult.success) {
      console.log('✅ Verification email resent successfully to:', email);
      res.status(200).json({ 
        message: 'Verification email sent successfully. Please check your inbox.'
      });
    } else {
      console.error('❌ Failed to resend verification email:', emailResult.error);
      res.status(500).json({ 
        message: 'Failed to send verification email. Please try again later.'
      });
    }

  } catch (error: any) {
    console.error('❌ Resend verification error:', error.message);
    res.status(500).json({ 
      message: 'Failed to resend verification email. Please try again.',
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
      // Create new user (verified by default since Google authenticates the email)
      const [result] = await pool.query(
        'INSERT INTO users_login (full_name, email, google_id, session_active, is_verified) VALUES (?, ?, ?, ?, ?)',
        [name || 'Google User', email, google_id, true, 1]
      );
      const [newUser] = await pool.query('SELECT * FROM users_login WHERE id = ?', [(result as any).insertId]);
      user = (newUser as any[])[0];

      // Sync to Supabase
      await syncToSupabase({
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        google_id,
        session_active: true,
        is_verified: 1,
        created_at: user.created_at
      });

      console.log('✅ Created new user from Google Sign-In:', email);
    } else {
      // Update google_id, session_active, and is_verified if columns exist
      const hasSessionActive = await hasSessionActiveColumn();
      const hasGoogleId = await pool.query('DESCRIBE users_login').then(([columns]) => (columns as any[]).some(col => col.Field === 'google_id'));
      if (hasGoogleId && hasSessionActive) {
        await pool.query('UPDATE users_login SET google_id = ?, session_active = TRUE, is_verified = 1 WHERE email = ?', [google_id, email]);
      } else if (hasGoogleId) {
        await pool.query('UPDATE users_login SET google_id = ?, is_verified = 1 WHERE email = ?', [google_id, email]);
      } else if (hasSessionActive) {
        await pool.query('UPDATE users_login SET session_active = TRUE, is_verified = 1 WHERE email = ?', [email]);
      }

      // Sync to Supabase
      await syncToSupabase({
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        google_id,
        session_active: hasSessionActive ? true : false,
        is_verified: 1,
        created_at: user.created_at
      });

      console.log('✅ Updated user for Google Sign-In:', email);
    }

    console.log('✅ Google Sign-In successful:', email);
    res.status(200).json({
      message: 'Google Sign-In successful',
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        is_verified: 1,
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
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Find user by email
    const [users] = await pool.query('SELECT id, full_name FROM users_login WHERE email = ?', [email]);
    const user = (users as any[])[0];

    if (!user) {
      console.log('❌ User not found for logout:', email);
      return res.status(404).json({ message: 'User not found' });
    }

    const hasSessionActive = await hasSessionActiveColumn();
    if (hasSessionActive) {
      await pool.query('UPDATE users_login SET session_active = FALSE WHERE email = ?', [email]);
      // Sync to Supabase
      await syncToSupabase({
        id: user.id,
        full_name: user.full_name,
        email,
        session_active: false
      });
    }

    console.log('✅ User logged out:', email);
    res.json({ message: 'Logged out successfully' });
  } catch (error: any) {
    console.error('❌ Logout error:', error.message);
    res.status(500).json({ message: 'Failed to log out', error: error.message });
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

// Manual admin creation endpoint
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
    
    const [result] = await pool.query(
      'INSERT INTO users_login (full_name, email, password, is_verified, is_admin, session_active) VALUES (?, ?, ?, ?, ?, ?)',
      [full_name, email, hashedPassword, 1, 1, 0]
    );

    // Sync to Supabase
    await syncToSupabase({
      id: (result as any).insertId,
      full_name,
      email,
      password: hashedPassword,
      is_verified: 1,
      is_admin: 1,
      session_active: 0,
      created_at: new Date()
    });
    
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

// Create order endpoint
app.post('/api/orders/create', async (req: Request, res: Response) => {
  try {
    const { user_id, user_email, company_cin, company_name } = req.body;
    
    if (!company_cin) {
      return res.status(400).json({ message: 'Company CIN is required' });
    }

    // Generate order ID using CIN
    const orderId = `ORDER-${company_cin}-${Date.now()}`;
    
    // Check if order already exists for this user and company on the same day
    const today = new Date().toISOString().split('T')[0];
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
    
    // Delete from Supabase
    await supabase.from('users_login').delete().eq('id', userId);
    
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

    // Find and remove duplicate orders
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
});