// =================================================================
// BALIK.LAGI - Authentication Utilities
// =================================================================

import type { D1Database } from '../types';

/**
 * Simple password hashing using Web Crypto API
 * NOTE: In production, consider using bcrypt via Workers
 */
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hash));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

/**
 * Verify password against hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const passwordHash = await hashPassword(password);
  return passwordHash === hash;
}

/**
 * Generate random session ID
 */
export function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
}

/**
 * Generate random user ID
 */
export function generateUserId(): string {
  return `user_${Date.now()}_${Math.random().toString(36).substring(7)}`;
}

/**
 * Create session for user
 */
export async function createSession(db: D1Database, userId: string): Promise<string> {
  const sessionId = generateSessionId();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days
  
  await db
    .prepare('INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)')
    .bind(sessionId, userId, expiresAt)
    .run();
  
  return sessionId;
}

/**
 * Get user from session
 */
export async function getUserFromSession(db: D1Database, sessionId: string): Promise<any | null> {
  const session = await db
    .prepare('SELECT * FROM sessions WHERE id = ? AND expires_at > datetime("now")')
    .bind(sessionId)
    .first();
  
  if (!session) {
    return null;
  }
  
  const user = await db
    .prepare('SELECT * FROM user_profiles WHERE id = ?')
    .bind(session.user_id)
    .first();
  
  return user;
}

/**
 * Delete session (logout)
 */
export async function deleteSession(db: D1Database, sessionId: string): Promise<void> {
  await db
    .prepare('DELETE FROM sessions WHERE id = ?')
    .bind(sessionId)
    .run();
}

/**
 * Validate access key
 */
export async function validateAccessKey(
  db: D1Database,
  keyCode: string,
  expectedType: string
): Promise<{ valid: boolean; branchId?: string }> {
  const key = await db
    .prepare(`
      SELECT * FROM access_keys 
      WHERE key_code = ? 
      AND key_type = ? 
      AND is_active = 1
      AND (expires_at IS NULL OR expires_at > datetime('now'))
      AND (max_usage = -1 OR usage_count < max_usage)
    `)
    .bind(keyCode, expectedType)
    .first();
  
  if (!key) {
    return { valid: false };
  }
  
  // Increment usage count
  await db
    .prepare('UPDATE access_keys SET usage_count = usage_count + 1 WHERE key_code = ?')
    .bind(keyCode)
    .run();
  
  return {
    valid: true,
    branchId: key.branch_id as string | undefined
  };
}
