-- ============================================
-- Enable Realtime for all tables
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable Realtime for each table
ALTER PUBLICATION supabase_realtime ADD TABLE public.company_info;
ALTER PUBLICATION supabase_realtime ADD TABLE public.projects;
ALTER PUBLICATION supabase_realtime ADD TABLE public.drawings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.reports;
ALTER PUBLICATION supabase_realtime ADD TABLE public.decisions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.expenses;
ALTER PUBLICATION supabase_realtime ADD TABLE public.invoices;
ALTER PUBLICATION supabase_realtime ADD TABLE public.contractors;
ALTER PUBLICATION supabase_realtime ADD TABLE public.units;
ALTER PUBLICATION supabase_realtime ADD TABLE public.leads;
ALTER PUBLICATION supabase_realtime ADD TABLE public.contracts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.settings;

-- Verify enabled tables
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
