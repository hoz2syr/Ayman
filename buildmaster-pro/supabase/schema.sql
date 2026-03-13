-- BuildMaster Pro - Supabase Database Schema
-- Run this in Supabase SQL Editor

-- Enable RLS
ALTER TABLE IF EXISTS public.company_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.drawings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.contractors ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.units ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.settings ENABLE ROW LEVEL SECURITY;

-- Create tables
CREATE TABLE IF NOT EXISTS public.company_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  owner TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  logo TEXT,
  tax_number TEXT,
  commercial_record TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  location TEXT,
  client_name TEXT,
  client_phone TEXT,
  client_email TEXT,
  start_date DATE,
  end_date DATE,
  status TEXT DEFAULT 'قيد التنفيذ',
  budget NUMERIC DEFAULT 0,
  paid_amount NUMERIC DEFAULT 0,
  description TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.drawings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  drawing_number TEXT,
  project_id UUID REFERENCES public.projects(id),
  name TEXT,
  type TEXT,
  related_reports TEXT[],
  related_decisions TEXT[],
  file TEXT,
  file_name TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_number TEXT,
  project_id UUID REFERENCES public.projects(id),
  subject TEXT,
  date DATE,
  engineer TEXT,
  description TEXT,
  notes TEXT,
  recommendations TEXT,
  attachments JSONB,
  related_drawings TEXT[],
  related_decisions TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  decision_number TEXT,
  project_id UUID REFERENCES public.projects(id),
  subject TEXT,
  date DATE,
  responsible_party TEXT,
  description TEXT,
  decision TEXT,
  status TEXT DEFAULT 'معلق',
  due_date DATE,
  notes TEXT,
  attachments JSONB,
  related_drawings TEXT[],
  related_reports TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id),
  contractor_id UUID,
  category TEXT,
  description TEXT,
  amount NUMERIC DEFAULT 0,
  date DATE,
  receipt TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number TEXT,
  project_id UUID REFERENCES public.projects(id),
  contractor_id UUID,
  client_name TEXT,
  client_email TEXT,
  client_phone TEXT,
  client_address TEXT,
  items JSONB,
  subtotal_usd NUMERIC DEFAULT 0,
  subtotal_syp NUMERIC DEFAULT 0,
  tax_rate NUMERIC DEFAULT 15,
  tax_amount_usd NUMERIC DEFAULT 0,
  tax_amount_syp NUMERIC DEFAULT 0,
  total_usd NUMERIC DEFAULT 0,
  total_syp NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'مفتوح',
  issue_date DATE,
  due_date DATE,
  payment_terms TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  paid_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.contractors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT DEFAULT 'مقاول',
  specialty TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  contract_start_date DATE,
  contract_end_date DATE,
  agreed_amount_usd NUMERIC DEFAULT 0,
  agreed_amount_syp NUMERIC DEFAULT 0,
  notes TEXT,
  rating NUMERIC DEFAULT 0,
  payments JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_number TEXT,
  type TEXT DEFAULT 'apartment',
  project_id UUID REFERENCES public.projects(id),
  floor TEXT,
  area NUMERIC DEFAULT 0,
  rooms NUMERIC DEFAULT 0,
  bathrooms NUMERIC DEFAULT 0,
  price_usd NUMERIC DEFAULT 0,
  price_syp NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'available',
  buyer_id TEXT,
  description TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT,
  phone TEXT,
  national_id TEXT,
  id_issue_date DATE,
  email TEXT,
  project_id TEXT,
  unit_id TEXT,
  stage TEXT DEFAULT 'interested',
  budget NUMERIC DEFAULT 0,
  notes TEXT,
  contact_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_number TEXT,
  date DATE,
  seller_name TEXT,
  seller_license TEXT,
  buyer_id TEXT,
  buyer_name TEXT,
  buyer_national_id TEXT,
  buyer_id_issue_date DATE,
  unit_id TEXT,
  property_number TEXT,
  region TEXT,
  unit_description TEXT,
  area NUMERIC DEFAULT 0,
  floor TEXT,
  total_usd NUMERIC DEFAULT 0,
  price_per_meter NUMERIC DEFAULT 0,
  total_syp NUMERIC DEFAULT 0,
  remaining_syp NUMERIC DEFAULT 0,
  witness1 TEXT,
  witness2 TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  currency TEXT DEFAULT 'SAR',
  currency_symbol TEXT DEFAULT 'ر.س',
  tax_rate NUMERIC DEFAULT 15,
  date_format TEXT DEFAULT 'DD/MM/YYYY',
  language TEXT DEFAULT 'ar',
  theme TEXT DEFAULT 'dark',
  exchange_rate_usd NUMERIC DEFAULT 13000,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Simple RLS Policies (allow all for demo - tighten in production)
CREATE POLICY "Enable all access" ON public.company_info FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access" ON public.projects FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access" ON public.drawings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access" ON public.reports FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access" ON public.decisions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access" ON public.expenses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access" ON public.invoices FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access" ON public.contractors FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access" ON public.units FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access" ON public.leads FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access" ON public.contracts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access" ON public.settings FOR ALL USING (true) WITH CHECK (true);

-- Create storage bucket for files
INSERT INTO storage.buckets (id, name, public) VALUES ('files', 'files', true);

CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'files');
CREATE POLICY "Public Insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'files');
CREATE POLICY "Public Update" ON storage.objects FOR UPDATE USING (bucket_id = 'files');
CREATE POLICY "Public Delete" ON storage.objects FOR DELETE USING (bucket_id = 'files');
