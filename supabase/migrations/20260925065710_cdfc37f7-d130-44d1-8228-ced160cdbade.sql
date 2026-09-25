CREATE TABLE public.guests_state (
  id text not null primary key,
  state jsonb not null default '{}'::jsonb,
  updated_at timestamp with time zone not null default now()
);
GRANT SELECT, INSERT, UPDATE ON public.guests_state TO anon;
GRANT SELECT, INSERT, UPDATE ON public.guests_state TO authenticated;
GRANT ALL ON public.guests_state TO service_role;
ALTER TABLE public.guests_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Shared guests insertable by anyone" ON public.guests_state FOR INSERT TO public WITH CHECK (id = 'shared');
CREATE POLICY "Shared guests readable by anyone" ON public.guests_state FOR SELECT TO public USING (true);
CREATE POLICY "Shared guests updatable by anyone" ON public.guests_state FOR UPDATE TO public USING (id = 'shared') WITH CHECK (id = 'shared');
ALTER PUBLICATION supabase_realtime ADD TABLE public.guests_state;