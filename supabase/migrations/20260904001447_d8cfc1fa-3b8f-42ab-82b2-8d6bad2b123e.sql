ALTER TABLE public.maria_quest_saves
  ADD COLUMN IF NOT EXISTS weapons jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS equipped_weapon text;