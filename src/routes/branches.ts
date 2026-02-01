// =================================================================
// BALIK.LAGI - Branches Routes
// =================================================================

import { Hono } from 'hono';
import type { Bindings } from '../types';

const branches = new Hono<{ Bindings: Bindings }>();

// Get all branches
branches.get('/', async (c) => {
  try {
    const branches = await c.env.DB
      .prepare('SELECT * FROM branches WHERE is_active = 1 ORDER BY name')
      .all();
    
    return c.json({
      branches: branches.results || []
    });
  } catch (error: any) {
    console.error('Get branches error:', error);
    return c.json({ error: 'Failed to fetch branches' }, 500);
  }
});

// Get branch by ID
branches.get('/:id', async (c) => {
  try {
    const branchId = c.req.param('id');
    
    const branch = await c.env.DB
      .prepare('SELECT * FROM branches WHERE id = ?')
      .bind(branchId)
      .first();
    
    if (!branch) {
      return c.json({ error: 'Branch not found' }, 404);
    }
    
    return c.json({ branch });
  } catch (error: any) {
    console.error('Get branch error:', error);
    return c.json({ error: 'Failed to fetch branch' }, 500);
  }
});

export default branches;
