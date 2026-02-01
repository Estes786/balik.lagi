// =================================================================
// BALIK.LAGI - Booking API Routes
// =================================================================

import { Hono } from 'hono'
import type { D1Database } from '@cloudflare/workers-types'

type Bindings = {
  DB: D1Database
}

const bookings = new Hono<{ Bindings: Bindings }>()

// =================================================================
// GET ALL SERVICES
// =================================================================
bookings.get('/services', async (c) => {
  try {
    const result = await c.env.DB.prepare(`
      SELECT id, service_name, service_tier, price, duration_minutes, description
      FROM service_catalog
      WHERE is_active = 1
      ORDER BY price ASC
    `).all()

    return c.json({ success: true, services: result.results })
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// =================================================================
// GET ALL CAPSTERS
// =================================================================
bookings.get('/capsters', async (c) => {
  try {
    const result = await c.env.DB.prepare(`
      SELECT id, display_name, specialty, rating
      FROM capsters
      WHERE is_active = 1
      ORDER BY rating DESC
    `).all()

    return c.json({ success: true, capsters: result.results })
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// =================================================================
// CREATE BOOKING APPOINTMENT
// =================================================================
bookings.post('/create', async (c) => {
  try {
    const body = await c.req.json()
    const { customer_id, service_id, capster_id, booking_date, booking_time, notes } = body

    // Validate required fields
    if (!customer_id || !service_id || !booking_date || !booking_time) {
      return c.json({ success: false, error: 'Missing required fields' }, 400)
    }

    // Get customer info
    const customer = await c.env.DB.prepare(`
      SELECT customer_phone, customer_name, branch_id 
      FROM user_profiles 
      WHERE id = ?
    `).bind(customer_id).first()

    if (!customer) {
      return c.json({ success: false, error: 'Customer not found' }, 404)
    }

    // Get service info
    const service = await c.env.DB.prepare(`
      SELECT service_name, price, branch_id 
      FROM service_catalog 
      WHERE id = ?
    `).bind(service_id).first()

    if (!service) {
      return c.json({ success: false, error: 'Service not found' }, 404)
    }

    // Get capster info (optional)
    let capster_name = null
    if (capster_id) {
      const capster = await c.env.DB.prepare(`
        SELECT display_name FROM capsters WHERE id = ?
      `).bind(capster_id).first()
      capster_name = capster?.display_name
    }

    // Generate booking ID
    const booking_id = `booking_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Insert booking
    await c.env.DB.prepare(`
      INSERT INTO booking_appointments (
        id, customer_id, customer_phone, customer_name, 
        branch_id, service_id, service_name, service_price,
        capster_id, capster_name, booking_date, booking_time,
        status, notes, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `).bind(
      booking_id,
      customer_id,
      customer.customer_phone,
      customer.customer_name,
      service.branch_id,
      service_id,
      service.service_name,
      service.price,
      capster_id || null,
      capster_name,
      booking_date,
      booking_time,
      'confirmed',
      notes || null
    ).run()

    return c.json({ 
      success: true, 
      message: 'Booking created successfully',
      booking_id
    })
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// =================================================================
// GET MY BOOKINGS (Customer)
// =================================================================
bookings.get('/my-bookings/:customer_id', async (c) => {
  try {
    const customer_id = c.req.param('customer_id')

    const result = await c.env.DB.prepare(`
      SELECT * FROM booking_appointments
      WHERE customer_id = ?
      ORDER BY booking_date DESC, booking_time DESC
      LIMIT 50
    `).bind(customer_id).all()

    return c.json({ success: true, bookings: result.results })
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// =================================================================
// GET CAPSTER QUEUE (Capster)
// =================================================================
bookings.get('/capster-queue/:capster_id', async (c) => {
  try {
    const capster_id = c.req.param('capster_id')

    const result = await c.env.DB.prepare(`
      SELECT * FROM booking_appointments
      WHERE capster_id = ? AND status IN ('confirmed', 'in_progress')
      ORDER BY booking_date ASC, booking_time ASC
      LIMIT 20
    `).bind(capster_id).all()

    return c.json({ success: true, queue: result.results })
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// =================================================================
// UPDATE BOOKING STATUS
// =================================================================
bookings.put('/update-status/:booking_id', async (c) => {
  try {
    const booking_id = c.req.param('booking_id')
    const { status } = await c.req.json()

    if (!['confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'].includes(status)) {
      return c.json({ success: false, error: 'Invalid status' }, 400)
    }

    // Update booking status
    await c.env.DB.prepare(`
      UPDATE booking_appointments 
      SET status = ?, 
          updated_at = datetime('now'),
          completed_at = CASE WHEN ? = 'completed' THEN datetime('now') ELSE completed_at END
      WHERE id = ?
    `).bind(status, status, booking_id).run()

    // If completed, increment coupon count
    if (status === 'completed') {
      const booking = await c.env.DB.prepare(`
        SELECT customer_id, customer_phone, branch_id 
        FROM booking_appointments 
        WHERE id = ?
      `).bind(booking_id).first()

      if (booking) {
        // Increment or create coupon record
        await c.env.DB.prepare(`
          INSERT INTO customer_coupons (
            id, customer_id, customer_phone, branch_id, 
            coupon_count, total_visits, last_visit_date, coupon_eligible
          ) VALUES (
            'coupon_' || ?, ?, ?, ?, 1, 1, date('now'), 0
          )
          ON CONFLICT(id) DO UPDATE SET
            coupon_count = coupon_count + 1,
            total_visits = total_visits + 1,
            last_visit_date = date('now'),
            coupon_eligible = CASE WHEN coupon_count + 1 >= 4 THEN 1 ELSE 0 END,
            updated_at = datetime('now')
        `).bind(
          booking.customer_id,
          booking.customer_id,
          booking.customer_phone,
          booking.branch_id
        ).run()
      }
    }

    return c.json({ success: true, message: 'Status updated successfully' })
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// =================================================================
// GET CUSTOMER COUPON STATUS
// =================================================================
bookings.get('/coupon-status/:customer_id', async (c) => {
  try {
    const customer_id = c.req.param('customer_id')

    const result = await c.env.DB.prepare(`
      SELECT * FROM customer_coupons WHERE customer_id = ?
    `).bind(customer_id).first()

    return c.json({ 
      success: true, 
      coupon: result || { coupon_count: 0, total_visits: 0, coupon_eligible: 0 }
    })
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

export default bookings
