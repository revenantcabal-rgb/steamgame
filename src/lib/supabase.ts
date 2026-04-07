import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// These will be set from environment variables or a config file
// For development, they default to empty strings (falls back to local mode)
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase: SupabaseClient | null =
  SUPABASE_URL && SUPABASE_ANON_KEY
    ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : null;

export function isSupabaseConfigured(): boolean {
  return supabase !== null;
}
