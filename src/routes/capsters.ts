// =================================================================
// BALIK.LAGI - Capsters Routes
// =================================================================

import { Hono } from 'hono';
import type { Bindings } from '../types';

const capsters = new Hono<{ Bindings: Bindings }>();

// Get all capsters
capsters.get('/', async (c) => {
  try {
    const branchId = c.req.query('branch_id');
    
    let query = `
      SELECT c.*, u.email, u.customer_name as name
      FROM capsters c
      LEFT JOIN user_profiles u ON c.user_id = u.id
      WHERE c.is_active = 1 AND u.is_approved = 1
    `;
    const params: any[] = [];
    
    if (branchId) {
      query += ' AND c.branch_id = ?';
      params.push(branchId);
    }
    
    query += ' ORDER BY c.rating DESC, c.display_name';
    
    const stmt = c.env.DB.prepare(query);
    const capsters = params.length > 0
      ? await stmt.bind(...params).all()
      : await stmt.all();
    
    return c.json({
      capsters: capsters.results || []
    });
  } catch (error: any) {
    console.error('Get capsters error:', error);
    return c.json({ error: 'Failed to fetch capsters' }, 500);
  }
});

// Get capster by ID
capsters.get('/:id', async (c) => {
  try {
    const capsterId = c.req.param('id');
    
    const capster = await c.env.DB
      .prepare(`
        SELECT c.*, u.email, u.customer_name as name
        FROM capsters c
        LEFT JOIN user_profiles u ON c.user_id = u.id
        WHERE c.id = ?
      `)
      .bind(capsterId)
      .first();
    
    if (!capster) {
      return c.json({ error: 'Capster not found' }, 404);
    }
    
    return c.json({ capster });
  } catch (error: any) {
    console.error('Get capster error:', error);
    return c.json({ error: 'Failed to fetch capster' }, 500);
  }
});

export default capsters;
