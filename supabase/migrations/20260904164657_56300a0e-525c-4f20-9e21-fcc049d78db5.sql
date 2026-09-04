ALTER TABLE public.maria_quest_saves
  ADD COLUMN IF NOT EXISTS time_of_day double precision NOT NULL DEFAULT 0.15,
  ADD COLUMN IF NOT EXISTS inventory jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS chest jsonb NOT NULL DEFAULT '{}'::jsonb;