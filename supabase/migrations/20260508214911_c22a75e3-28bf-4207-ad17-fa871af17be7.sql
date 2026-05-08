
ALTER TABLE public.salary_entries
  ADD COLUMN IF NOT EXISTS race text,
  ADD COLUMN IF NOT EXISTS education text,
  ADD COLUMN IF NOT EXISTS experience_years integer,
  ADD COLUMN IF NOT EXISTS hierarchy_level text,
  ADD COLUMN IF NOT EXISTS work_modality text,
  ADD COLUMN IF NOT EXISTS contract_type text,
  ADD COLUMN IF NOT EXISTS weekly_hours integer,
  ADD COLUMN IF NOT EXISTS has_leadership boolean,
  ADD COLUMN IF NOT EXISTS benefits text;
