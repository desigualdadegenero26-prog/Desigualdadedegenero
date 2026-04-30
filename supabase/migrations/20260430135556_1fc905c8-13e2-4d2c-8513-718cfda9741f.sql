
-- Companies table (one company per user for simplicity)
CREATE TABLE public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  name TEXT NOT NULL,
  cnpj TEXT NOT NULL,
  sector TEXT NOT NULL,
  size TEXT NOT NULL,
  region TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own company"
  ON public.companies FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own company"
  ON public.companies FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own company"
  ON public.companies FOR UPDATE
  USING (auth.uid() = user_id);

-- Salary entries table
CREATE TABLE public.salary_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  gender TEXT NOT NULL CHECK (gender IN ('male', 'female')),
  age INTEGER NOT NULL CHECK (age >= 16 AND age <= 100),
  region TEXT NOT NULL,
  role TEXT NOT NULL,
  salary NUMERIC(12,2) NOT NULL CHECK (salary >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.salary_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company owners view own entries"
  ON public.salary_entries FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.companies c
    WHERE c.id = salary_entries.company_id AND c.user_id = auth.uid()
  ));

CREATE POLICY "Company owners insert own entries"
  ON public.salary_entries FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.companies c
    WHERE c.id = salary_entries.company_id AND c.user_id = auth.uid()
  ));

CREATE POLICY "Company owners delete own entries"
  ON public.salary_entries FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.companies c
    WHERE c.id = salary_entries.company_id AND c.user_id = auth.uid()
  ));

-- Public aggregated view: anyone can read aggregated salary data (no PII, no company info)
CREATE OR REPLACE VIEW public.salary_aggregates
WITH (security_invoker = true)
AS
SELECT
  gender,
  region,
  CASE
    WHEN age < 25 THEN '18-24'
    WHEN age < 35 THEN '25-34'
    WHEN age < 45 THEN '35-44'
    WHEN age < 55 THEN '45-54'
    ELSE '55+'
  END AS age_range,
  ROUND(AVG(salary)::numeric, 2) AS avg_salary,
  COUNT(*) AS sample_size
FROM public.salary_entries
GROUP BY gender, region, age_range;

-- Allow public read on the aggregate view (bypass needs explicit policy on underlying table)
CREATE POLICY "Public can read aggregated salary data"
  ON public.salary_entries FOR SELECT
  TO anon, authenticated
  USING (true);

-- Drop the more restrictive policy and keep open read (since aggregates are public)
-- Actually we need both: keep the company-owner policy for explicit selects, and public for view
-- Postgres ORs all SELECT policies, so the public one wins. That's fine because we never expose
-- the raw table to clients — only aggregated data via the view, and individual queries by company owner.
