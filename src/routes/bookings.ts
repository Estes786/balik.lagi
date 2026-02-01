// =================================================================
// BALIK.LAGI - Booking Routes
// =================================================================

import { Hono } from 'hono';
import type { Bindings, CreateBookingRequest } from '../types';
import { requireAuth } from '../middleware/auth';

const bookings = new Hono<{ Bindings: Bindings }>();

// Create booking
bookings.post('/', requireAuth, async (c) => {
  try {
    const body = await c.req.json<CreateBookingRequest>();
    const user = c.get('user');
    
    const {
      customer_phone,
      customer_name,
      branch_id,
      service_id,
      capster_id,
      booking_date,
      booking_time,
      notes
    } = body;
    
    // Validate required fields
    if (!customer_phone || !customer_name || !branch_id || !service_id || !booking_date || !booking_time) {
      return c.json({ error: 'Missing required fields' }, 400);
    }
    
    // Get service details
    const service = await c.env.DB
      .prepare('SELECT * FROM service_catalog WHERE id = ? AND is_active = 1')
      .bind(service_id)
      .first();
    
    if (!service) {
      return c.json({ error: 'Service not found' }, 404);
    }
    
    // Generate booking ID
    const bookingId = `booking_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    // Create booking
    await c.env.DB
      .prepare(`
        INSERT INTO bookings 
        (id, customer_phone, customer_name, customer_id, branch_id, service_id, capster_id,
         booking_date, booking_time, service_tier, requested_capster, notes, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
      `)
      .bind(
        bookingId,
        customer_phone,
        customer_name,
        user.role === 'customer' ? user.id : null,
        branch_id,
        service_id,
        capster_id || null,
        booking_date,
        booking_time,
        service.service_tier,
        capster_id || null,
        notes || null
      )
      .run();
    
    // Get complete booking details
    const booking = await c.env.DB
      .prepare(`
        SELECT b.*, s.service_name, s.price, s.duration_minutes,
               c.display_name as capster_name
        FROM bookings b
        LEFT JOIN service_catalog s ON b.service_id = s.id
        LEFT JOIN capsters c ON b.capster_id = c.id
        WHERE b.id = ?
      `)
      .bind(bookingId)
      .first();
    
    return c.json({
      success: true,
      booking
    });
  } catch (error: any) {
    console.error('Create booking error:', error);
    return c.json({ error: 'Failed to create booking', details: error.message }, 500);
  }
});

// Get bookings for current user
bookings.get('/my-bookings', requireAuth, async (c) => {
  try {
    const user = c.get('user');
    let bookings;
    
    if (user.role === 'customer') {
      // Get customer bookings by phone
      bookings = await c.env.DB
        .prepare(`
          SELECT b.*, s.service_name, s.price, s.duration_minutes,
                 c.display_name as capster_name, br.name as branch_name
          FROM bookings b
          LEFT JOIN service_catalog s ON b.service_id = s.id
          LEFT JOIN capsters c ON b.capster_id = c.id
          LEFT JOIN branches br ON b.branch_id = br.id
          WHERE b.customer_phone = ?
          ORDER BY b.booking_date DESC, b.booking_time DESC
          LIMIT 100
        `)
        .bind(user.customer_phone)
        .all();
    } else if (user.role === 'capster') {
      // Get capster's bookings
      const capster = await c.env.DB
        .prepare('SELECT id FROM capsters WHERE user_id = ?')
        .bind(user.id)
        .first();
      
      if (!capster) {
        return c.json({ bookings: [] });
      }
      
      bookings = await c.env.DB
        .prepare(`
          SELECT b.*, s.service_name, s.price, s.duration_minutes,
                 br.name as branch_name
          FROM bookings b
          LEFT JOIN service_catalog s ON b.service_id = s.id
          LEFT JOIN branches br ON b.branch_id = br.id
          WHERE b.capster_id = ?
          ORDER BY b.booking_date DESC, b.booking_time DESC
          LIMIT 100
        `)
        .bind(capster.id)
        .all();
    } else {
      // Admin can see all bookings for their branch
      bookings = await c.env.DB
        .prepare(`
          SELECT b.*, s.service_name, s.price, s.duration_minutes,
                 c.display_name as capster_name, br.name as branch_name
          FROM bookings b
          LEFT JOIN service_catalog s ON b.service_id = s.id
          LEFT JOIN capsters c ON b.capster_id = c.id
          LEFT JOIN branches br ON b.branch_id = br.id
          WHERE b.branch_id = ?
          ORDER BY b.booking_date DESC, b.booking_time DESC
          LIMIT 100
        `)
        .bind(user.branch_id)
        .all();
    }
    
    return c.json({
      bookings: bookings?.results || []
    });
  } catch (error: any) {
    console.error('Get bookings error:', error);
    return c.json({ error: 'Failed to fetch bookings' }, 500);
  }
});

// Get booking by ID
bookings.get('/:id', requireAuth, async (c) => {
  try {
    const bookingId = c.req.param('id');
    
    const booking = await c.env.DB
      .prepare(`
        SELECT b.*, s.service_name, s.price, s.duration_minutes,
               c.display_name as capster_name, br.name as branch_name, br.address
        FROM bookings b
        LEFT JOIN service_catalog s ON b.service_id = s.id
        LEFT JOIN capsters c ON b.capster_id = c.id
        LEFT JOIN branches br ON b.branch_id = br.id
        WHERE b.id = ?
      `)
      .bind(bookingId)
      .first();
    
    if (!booking) {
      return c.json({ error: 'Booking not found' }, 404);
    }
    
    return c.json({ booking });
  } catch (error: any) {
    console.error('Get booking error:', error);
    return c.json({ error: 'Failed to fetch booking' }, 500);
  }
});

// Update booking status
bookings.patch('/:id/status', requireAuth, async (c) => {
  try {
    const bookingId = c.req.param('id');
    const { status } = await c.req.json();
    const user = c.get('user');
    
    if (!status) {
      return c.json({ error: 'Status is required' }, 400);
    }
    
    const validStatuses = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'];
    if (!validStatuses.includes(status)) {
      return c.json({ error: 'Invalid status' }, 400);
    }
    
    // Check authorization
    if (user.role === 'customer') {
      return c.json({ error: 'Customers cannot update booking status' }, 403);
    }
    
    // Update status
    await c.env.DB
      .prepare('UPDATE bookings SET status = ?, updated_at = datetime("now") WHERE id = ?')
      .bind(status, bookingId)
      .run();
    
    // Get updated booking
    const booking = await c.env.DB
      .prepare('SELECT * FROM bookings WHERE id = ?')
      .bind(bookingId)
      .first();
    
    return c.json({
      success: true,
      booking
    });
  } catch (error: any) {
    console.error('Update booking status error:', error);
    return c.json({ error: 'Failed to update booking status' }, 500);
  }
});

// Cancel booking
bookings.delete('/:id', requireAuth, async (c) => {
  try {
    const bookingId = c.req.param('id');
    const user = c.get('user');
    
    // Get booking
    const booking = await c.env.DB
      .prepare('SELECT * FROM bookings WHERE id = ?')
      .bind(bookingId)
      .first();
    
    if (!booking) {
      return c.json({ error: 'Booking not found' }, 404);
    }
    
    // Check authorization
    if (user.role === 'customer' && booking.customer_id !== user.id) {
      return c.json({ error: 'Unauthorized to cancel this booking' }, 403);
    }
    
    // Update to cancelled
    await c.env.DB
      .prepare('UPDATE bookings SET status = "cancelled", updated_at = datetime("now") WHERE id = ?')
      .bind(bookingId)
      .run();
    
    return c.json({ success: true });
  } catch (error: any) {
    console.error('Cancel booking error:', error);
    return c.json({ error: 'Failed to cancel booking' }, 500);
  }
});

export default bookings;
