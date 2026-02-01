// =================================================================
// BALIK.LAGI - Type Definitions
// =================================================================

export interface D1Database {
  prepare(query: string): D1PreparedStatement;
  dump(): Promise<ArrayBuffer>;
  batch<T = unknown>(statements: D1PreparedStatement[]): Promise<T[]>;
  exec(query: string): Promise<D1ExecResult>;
}

export interface D1PreparedStatement {
  bind(...values: any[]): D1PreparedStatement;
  first<T = unknown>(colName?: string): Promise<T | null>;
  run<T = unknown>(): Promise<D1Response<T>>;
  all<T = unknown>(): Promise<D1Result<T>>;
  raw<T = unknown>(): Promise<T[]>;
}

export interface D1Response<T = unknown> {
  success: boolean;
  meta: any;
  error?: string;
  results?: T[];
}

export interface D1Result<T = unknown> {
  results: T[];
  success: boolean;
  meta: {
    served_by: string;
    duration: number;
    changes: number;
    last_row_id: number;
    changed_db: boolean;
    size_after: number;
    rows_read: number;
    rows_written: number;
  };
}

export interface D1ExecResult {
  count: number;
  duration: number;
}

export type Bindings = {
  DB: D1Database;
};

export interface UserProfile {
  id: string;
  email: string;
  password_hash: string;
  role: 'admin' | 'capster' | 'customer';
  customer_phone?: string | null;
  customer_name?: string | null;
  branch_id?: string | null;
  access_key_used?: string | null;
  is_approved: number;
  created_at: string;
  updated_at: string;
}

export interface Session {
  id: string;
  user_id: string;
  expires_at: string;
  created_at: string;
}

export interface Branch {
  id: string;
  name: string;
  address?: string | null;
  phone?: string | null;
  owner_id?: string | null;
  is_active: number;
  created_at: string;
  updated_at: string;
}

export interface ServiceCatalog {
  id: string;
  branch_id?: string | null;
  service_name: string;
  service_tier: 'Basic' | 'Premium' | 'Mastery';
  price: number;
  duration_minutes: number;
  description?: string | null;
  is_active: number;
  created_at: string;
  updated_at: string;
}

export interface Capster {
  id: string;
  user_id: string;
  branch_id: string;
  display_name: string;
  specialty?: string | null;
  rating: number;
  total_bookings: number;
  is_active: number;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  customer_phone: string;
  customer_name: string;
  customer_id?: string | null;
  branch_id: string;
  service_id: string;
  capster_id?: string | null;
  booking_date: string;
  booking_time: string;
  service_tier: 'Basic' | 'Premium' | 'Mastery';
  requested_capster?: string | null;
  notes?: string | null;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  transaction_date: string;
  customer_phone: string;
  customer_name?: string | null;
  customer_area?: string | null;
  branch_id: string;
  service_tier: 'Basic' | 'Premium' | 'Mastery';
  upsell_items?: string | null;
  capster_name?: string | null;
  capster_id?: string | null;
  atv_amount: number;
  discount_amount: number;
  net_revenue: number;
  is_coupon_redeemed: number;
  is_google_review_asked: number;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  customer_phone: string;
  customer_name: string;
  customer_area?: string | null;
  branch_id: string;
  total_visits: number;
  total_revenue: number;
  average_atv: number;
  last_visit_date?: string | null;
  average_recency_days?: number | null;
  customer_segment?: 'New' | 'Regular' | 'VIP' | 'Churned' | null;
  lifetime_value: number;
  coupon_count: number;
  coupon_eligible: number;
  google_review_given: number;
  next_visit_prediction?: string | null;
  churn_risk_score: number;
  first_visit_date?: string | null;
  created_at: string;
  updated_at: string;
}

export interface AccessKey {
  key_code: string;
  key_type: 'admin' | 'capster' | 'customer';
  branch_id?: string | null;
  usage_count: number;
  max_usage: number;
  is_active: number;
  created_at: string;
  expires_at?: string | null;
}

// Request/Response types
export interface RegisterRequest {
  email: string;
  password: string;
  role: 'admin' | 'capster' | 'customer';
  access_key: string;
  customer_name?: string;
  customer_phone?: string;
  branch_id?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface CreateBookingRequest {
  customer_phone: string;
  customer_name: string;
  branch_id: string;
  service_id: string;
  capster_id?: string;
  booking_date: string;
  booking_time: string;
  notes?: string;
}

export interface CreateTransactionRequest {
  customer_phone: string;
  customer_name?: string;
  customer_area?: string;
  branch_id: string;
  service_tier: 'Basic' | 'Premium' | 'Mastery';
  upsell_items?: string;
  capster_id?: string;
  atv_amount: number;
  discount_amount?: number;
  is_coupon_redeemed?: boolean;
  is_google_review_asked?: boolean;
}
