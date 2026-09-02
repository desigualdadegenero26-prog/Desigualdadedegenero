GRANT SELECT, INSERT, UPDATE ON public.companies TO authenticated;
GRANT ALL ON public.companies TO service_role;
GRANT SELECT, INSERT, DELETE ON public.salary_entries TO authenticated;
GRANT ALL ON public.salary_entries TO service_role;
GRANT SELECT, INSERT ON public.opinion_responses TO authenticated;
GRANT SELECT, INSERT ON public.opinion_responses TO anon;
GRANT ALL ON public.opinion_responses TO service_role;