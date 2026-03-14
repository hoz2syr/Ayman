-- BuildMaster Pro - Supabase Database Schema
-- Idempotent version - safe to run multiple times

-- Enable Realtime for all tables (idempotent)
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS public.company_info;
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS public.projects;
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS public.drawings;
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS public.reports;
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS public.decisions;
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS public.expenses;
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS public.invoices;
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS public.contractors;
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS public.units;
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS public.leads;
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS public.contracts;
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS public.settings;

-- Storage bucket (idempotent)
INSERT INTO storage.buckets (id, name, public) VALUES ('files', 'files', true) ON CONFLICT DO NOTHING;

-- Verify Realtime is enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;
