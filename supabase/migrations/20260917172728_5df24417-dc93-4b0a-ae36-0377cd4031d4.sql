CREATE TABLE IF NOT EXISTS public.savings_state (
  id text PRIMARY KEY,
  state jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.savings_state TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.savings_state TO authenticated;
GRANT ALL ON public.savings_state TO service_role;
ALTER TABLE public.savings_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Shared savings readable by anyone" ON public.savings_state FOR SELECT USING (true);
CREATE POLICY "Shared savings insertable by anyone" ON public.savings_state FOR INSERT WITH CHECK (id = 'shared');
CREATE POLICY "Shared savings updatable by anyone" ON public.savings_state FOR UPDATE USING (id = 'shared') WITH CHECK (id = 'shared');
ALTER TABLE public.savings_state REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.savings_state;