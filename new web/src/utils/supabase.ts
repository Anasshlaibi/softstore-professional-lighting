import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const supabaseServiceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || '';

// PUBLIC CLIENT (Safe for products and checkout)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ADMIN CLIENT (Uses Service Role Key to see private orders)
// If the Service Role Key is missing, it falls back to Anon Key
export const adminSupabase = createClient(
  supabaseUrl, 
  supabaseServiceRoleKey || supabaseAnonKey
);
