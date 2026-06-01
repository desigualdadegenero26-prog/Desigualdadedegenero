DROP POLICY IF EXISTS "Public can read aggregated salary data" ON public.salary_entries;
GRANT SELECT ON public.salary_aggregates TO anon, authenticated;