import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://byffcjjzoorxbmabfdcg.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ5ZmZjamp6b29yeGJtYWJmZGNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzMDgxOTEsImV4cCI6MjA4ODg4NDE5MX0.-HglcZlER6CjSqrDguwme5px8ZpjsljR1lgQj-s3mjk';

const isConfigured = supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('your-project');

console.log('🔍 Supabase Config:', { 
  url: supabaseUrl ? '✓' : '✗', 
  key: supabaseAnonKey ? '✓' : '✗',
  isConfigured 
});

export const supabase = isConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      realtime: {
        params: {
          eventsPerSecond: 10
        }
      }
    })
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
