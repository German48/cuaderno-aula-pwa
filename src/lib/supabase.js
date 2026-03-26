import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabaseEnabled = Boolean(url && anonKey);

export const supabase = supabaseEnabled
  ? createClient(url, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  : null;

export const SUPABASE_TABLES = [
  'students',
  'learningOutcomes',
  'criteria',
  'instruments',
  'instrument_criteria',
  'grades',
  'settings',
  'attendance',
  'sessions',
  'units',
  'modules',
  'groups',
  'suggestions',
  'workplace_logs',
];
