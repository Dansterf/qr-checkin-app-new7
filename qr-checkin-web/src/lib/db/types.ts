import { D1Database } from '@cloudflare/workers-types';

export interface DbContext {
  DB: D1Database;
}

export async function getCloudflareContext(): Promise<DbContext | null> {
  // This function will be used when database is enabled in wrangler.toml
  // Currently returning null as database is not enabled by default
  return null;
}

export interface User {
  id: number;
  email: string;
  role: 'admin' | 'staff' | 'customer';
  first_name: string;
  last_name: string;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: number;
  user_id: number;
  email: string;
  phone: string | null;
  address: string | null;
  created_at: string;
  updated_at: string;
}

export interface Student {
  id: number;
  customer_id: number;
  first_name: string;
  last_name: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface SessionType {
  id: number;
  name: string;
  description: string | null;
  quickbooks_item_id: string | null;
  price: number;
  duration_minutes: number;
  created_at: string;
  updated_at: string;
}

export interface QRCode {
  id: number;
  customer_id: number;
  code_value: string;
  is_active: boolean;
  last_used: string | null;
  created_at: string;
  updated_at: string;
}

export interface CheckIn {
  id: number;
  student_id: number;
  session_type_id: number;
  staff_id: number;
  check_in_time: string;
  notes: string | null;
  quickbooks_invoice_id: string | null;
  quickbooks_sync_status: string;
  created_at: string;
  updated_at: string;
}
