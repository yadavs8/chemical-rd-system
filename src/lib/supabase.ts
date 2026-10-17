import { createClient } from '@supabase/supabase-js';

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const rawAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = (): boolean => {
  if (!rawUrl || !rawAnonKey) return false;
  if (rawUrl.includes('your-dedicated-project-ref') || rawAnonKey.includes('your-supabase-anon-key')) return false;
  try {
    const parsed = new URL(rawUrl);
    return Boolean(parsed.hostname);
  } catch {
    return false;
  }
};

// If valid credentials exist use them; otherwise use a valid mock URL so createClient never throws at import time
const safeUrl = isSupabaseConfigured() ? rawUrl : 'https://placeholder-offline-rd.supabase.co';
const safeKey = isSupabaseConfigured() ? rawAnonKey : 'ey-mock-key-placeholder-chemical-rd';

export const supabase = createClient(safeUrl, safeKey);
