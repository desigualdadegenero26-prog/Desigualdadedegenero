CREATE TABLE public.opinion_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  equal_pay_brazil TEXT NOT NULL,
  inequality_is_problem TEXT NOT NULL,
  witnessed_inequality TEXT NOT NULL,
  inequality_factors TEXT[] NOT NULL DEFAULT '{}',
  inequality_factors_other TEXT,
  same_growth_opportunities TEXT NOT NULL,
  salary_transparency TEXT NOT NULL,
  maternity_impact TEXT NOT NULL,
  public_policies TEXT NOT NULL,
  most_unequal_sector TEXT NOT NULL,
  most_unequal_sector_other TEXT,
  should_receive_equal TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.opinion_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit opinion response"
ON public.opinion_responses
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Anyone can read opinion responses"
ON public.opinion_responses
FOR SELECT
TO anon, authenticated
USING (true);