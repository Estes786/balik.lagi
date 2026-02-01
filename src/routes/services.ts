// =================================================================
// BALIK.LAGI - Services Routes
// =================================================================

import { Hono } from 'hono';
import type { Bindings } from '../types';

const services = new Hono<{ Bindings: Bindings }>();

// Get all services
services.get('/', async (c) => {
  try {
    const branchId = c.req.query('branch_id');
    
    let query = 'SELECT * FROM service_catalog WHERE is_active = 1';
    const params: any[] = [];
    
    if (branchId) {
      query += ' AND (branch_id = ? OR branch_id IS NULL)';
      params.push(branchId);
    }
    
    query += ' ORDER BY service_tier, price';
    
    const stmt = c.env.DB.prepare(query);
    const services = params.length > 0 
      ? await stmt.bind(...params).all()
      : await stmt.all();
    
    return c.json({
      services: services.results || []
    });
  } catch (error: any) {
    console.error('Get services error:', error);
    return c.json({ error: 'Failed to fetch services' }, 500);
  }
});

// Get service by ID
services.get('/:id', async (c) => {
  try {
    const serviceId = c.req.param('id');
    
    const service = await c.env.DB
      .prepare('SELECT * FROM service_catalog WHERE id = ?')
      .bind(serviceId)
      .first();
    
    if (!service) {
      return c.json({ error: 'Service not found' }, 404);
    }
    
    return c.json({ service });
  } catch (error: any) {
    console.error('Get service error:', error);
    return c.json({ error: 'Failed to fetch service' }, 500);
  }
});

export default services;
