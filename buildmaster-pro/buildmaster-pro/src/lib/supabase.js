import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const isConfigured = supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('your-project');

export const supabase = isConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export const isSupabaseConfigured = () => isConfigured;

export const STORAGE_KEYS = {
  COMPANY_INFO: 'company_info',
  PROJECTS: 'projects',
  DRAWINGS: 'drawings',
  REPORTS: 'reports',
  DECISIONS: 'decisions',
  EXPENSES: 'expenses',
  INVOICES: 'invoices',
  CONTRACTORS: 'contractors',
  UNITS: 'units',
  LEADS: 'leads',
  CONTRACTS: 'contracts',
  SETTINGS: 'settings',
};

export default supabase;
