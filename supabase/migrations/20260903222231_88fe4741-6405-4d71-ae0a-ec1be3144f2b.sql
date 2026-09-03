CREATE TABLE public.maria_quest_saves (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid,
  slot text NOT NULL DEFAULT 'maria',
  current_zone text NOT NULL DEFAULT 'sunlit_shores',
  player_health integer NOT NULL DEFAULT 5,
  relics_collected jsonb NOT NULL DEFAULT '[]'::jsonb,
  secret_envelopes_found jsonb NOT NULL DEFAULT '[]'::jsonb,
  vault_keys_count integer NOT NULL DEFAULT 0,
  wedding_completed boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX maria_quest_saves_slot_key ON public.maria_quest_saves (slot);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.maria_quest_saves TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.maria_quest_saves TO authenticated;
GRANT ALL ON public.maria_quest_saves TO service_role;

ALTER TABLE public.maria_quest_saves ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Shared access to quest saves"
ON public.maria_quest_saves FOR ALL
TO anon, authenticated
USING (true) WITH CHECK (true);

CREATE TRIGGER update_maria_quest_saves_updated_at
BEFORE UPDATE ON public.maria_quest_saves
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();