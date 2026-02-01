// =================================================================
// BALIK.LAGI - Authentication Routes
// =================================================================

import { Hono } from 'hono';
import { setCookie, deleteCookie } from 'hono/cookie';
import type { Bindings, RegisterRequest, LoginRequest } from '../types';
import {
  hashPassword,
  verifyPassword,
  createSession,
  deleteSession,
  generateUserId,
  validateAccessKey,
  getUserFromSession
} from '../lib/auth';
import { requireAuth } from '../middleware/auth';
import { getCookie } from 'hono/cookie';

const auth = new Hono<{ Bindings: Bindings }>();

// Register endpoint
auth.post('/register', async (c) => {
  try {
    const body = await c.req.json<RegisterRequest>();
    const { email, password, role, access_key, customer_name, customer_phone, branch_id } = body;
    
    // Validate required fields
    if (!email || !password || !role || !access_key) {
      return c.json({ error: 'Missing required fields' }, 400);
    }
    
    // Validate access key
    const keyValidation = await validateAccessKey(c.env.DB, access_key, role);
    if (!keyValidation.valid) {
      return c.json({ error: 'Invalid or expired access key' }, 400);
    }
    
    // Check if email already exists
    const existingUser = await c.env.DB
      .prepare('SELECT id FROM user_profiles WHERE email = ?')
      .bind(email)
      .first();
    
    if (existingUser) {
      return c.json({ error: 'Email already registered' }, 400);
    }
    
    // Hash password
    const passwordHash = await hashPassword(password);
    
    // Generate user ID
    const userId = generateUserId();
    
    // Determine branch_id (from access key or provided)
    const finalBranchId = keyValidation.branchId || branch_id;
    
    // FIX: Auto-approve ALL roles (customer, capster, admin) for seamless onboarding
    // This allows immediate access to dashboards without admin approval
    const isApproved = 1; // Auto-approve all roles
    
    // Insert user
    await c.env.DB
      .prepare(`
        INSERT INTO user_profiles 
        (id, email, password_hash, role, customer_name, customer_phone, branch_id, access_key_used, is_approved)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .bind(
        userId,
        email,
        passwordHash,
        role,
        customer_name || null,
        customer_phone || null,
        finalBranchId || null,
        access_key,
        isApproved
      )
      .run();
    
    // If capster, create capster entry
    if (role === 'capster' && finalBranchId) {
      const capsterId = `capster_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      await c.env.DB
        .prepare(`
          INSERT INTO capsters (id, user_id, branch_id, display_name, is_active)
          VALUES (?, ?, ?, ?, 0)
        `)
        .bind(capsterId, userId, finalBranchId, customer_name || email)
        .run();
    }
    
    // Create session
    const sessionId = await createSession(c.env.DB, userId);
    
    // Set session cookie
    setCookie(c, 'session_id', sessionId, {
      httpOnly: true,
      secure: true,
      sameSite: 'Lax',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    });
    
    return c.json({
      success: true,
      user: {
        id: userId,
        email,
        role,
        is_approved: isApproved
      }
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    return c.json({ error: 'Registration failed', details: error.message }, 500);
  }
});

// Login endpoint
auth.post('/login', async (c) => {
  try {
    const body = await c.req.json<LoginRequest>();
    const { email, password } = body;
    
    if (!email || !password) {
      return c.json({ error: 'Missing email or password' }, 400);
    }
    
    // Get user
    const user = await c.env.DB
      .prepare('SELECT * FROM user_profiles WHERE email = ?')
      .bind(email)
      .first();
    
    if (!user) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }
    
    // Verify password
    const validPassword = await verifyPassword(password, user.password_hash as string);
    if (!validPassword) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }
    
    // FIX: Removed approval check since all roles are now auto-approved
    // This enables immediate dashboard access for all roles (customer, capster, admin)
    
    // Create session
    const sessionId = await createSession(c.env.DB, user.id as string);
    
    // Set session cookie
    setCookie(c, 'session_id', sessionId, {
      httpOnly: true,
      secure: true,
      sameSite: 'Lax',
      maxAge: 7 * 24 * 60 * 60
    });
    
    // Determine dashboard redirect based on role (1 Account = 1 Role = 1 Dashboard)
    const dashboardMap: Record<string, string> = {
      'customer': '/dashboard/customer',
      'capster': '/dashboard/capster',
      'admin': '/dashboard/admin'
    };
    
    const redirectTo = dashboardMap[user.role as string] || '/dashboard/customer';
    
    return c.json({
      success: true,
      redirectTo, // FIX: Added automatic redirect to prevent manual routing
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        customer_name: user.customer_name,
        customer_phone: user.customer_phone,
        branch_id: user.branch_id,
        is_approved: user.is_approved
      }
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return c.json({ error: 'Login failed', details: error.message }, 500);
  }
});

// Logout endpoint
auth.post('/logout', requireAuth, async (c) => {
  try {
    const sessionId = getCookie(c, 'session_id');
    
    if (sessionId) {
      await deleteSession(c.env.DB, sessionId);
    }
    
    deleteCookie(c, 'session_id');
    
    return c.json({ success: true });
  } catch (error: any) {
    console.error('Logout error:', error);
    return c.json({ error: 'Logout failed' }, 500);
  }
});

// Get current user
auth.get('/me', requireAuth, async (c) => {
  const user = c.get('user');
  
  return c.json({
    success: true, // FIX: Added missing success field to prevent infinity loop
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      customer_name: user.customer_name,
      customer_phone: user.customer_phone,
      branch_id: user.branch_id,
      is_approved: user.is_approved,
      loyalty_points: user.loyalty_points || 0
    }
  });
});

// Validate access key
auth.post('/validate-key', async (c) => {
  try {
    const { access_key, role } = await c.req.json();
    
    if (!access_key || !role) {
      return c.json({ error: 'Missing access_key or role' }, 400);
    }
    
    const validation = await validateAccessKey(c.env.DB, access_key, role);
    
    return c.json({
      valid: validation.valid,
      branch_id: validation.branchId
    });
  } catch (error: any) {
    return c.json({ error: 'Validation failed' }, 500);
  }
});

export default auth;
