// =================================================================
// BALIK.LAGI - Authentication Middleware
// =================================================================

import { Context } from 'hono';
import { getCookie } from 'hono/cookie';
import { getUserFromSession } from '../lib/auth';
import type { Bindings } from '../types';

/**
 * Middleware to require authentication
 */
export async function requireAuth(c: Context<{ Bindings: Bindings }>, next: () => Promise<void>) {
  const sessionId = getCookie(c, 'session_id');
  
  if (!sessionId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  const user = await getUserFromSession(c.env.DB, sessionId);
  
  if (!user) {
    return c.json({ error: 'Invalid or expired session' }, 401);
  }
  
  // Attach user to context
  c.set('user', user);
  
  await next();
}

/**
 * Middleware to require specific role
 */
export function requireRole(...allowedRoles: string[]) {
  return async (c: Context<{ Bindings: Bindings }>, next: () => Promise<void>) => {
    const user = c.get('user');
    
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    if (!allowedRoles.includes(user.role)) {
      return c.json({ error: 'Forbidden: Insufficient permissions' }, 403);
    }
    
    await next();
  };
}

/**
 * Middleware to require admin role
 */
export const requireAdmin = requireRole('admin');

/**
 * Middleware to require capster role
 */
export const requireCapster = requireRole('capster', 'admin');

/**
 * Middleware to require customer role
 */
export const requireCustomer = requireRole('customer', 'admin');
