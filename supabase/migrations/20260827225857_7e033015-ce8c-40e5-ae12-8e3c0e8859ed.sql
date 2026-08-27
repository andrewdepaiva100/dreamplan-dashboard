CREATE TABLE public.plan_state (
  id text PRIMARY KEY,
  state jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.plan_state TO anon;
GRANT SELECT, INSERT, UPDATE ON public.plan_state TO authenticated;
GRANT ALL ON public.plan_state TO service_role;

ALTER TABLE public.plan_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Shared plan is readable by anyone" ON public.plan_state FOR SELECT USING (true);
CREATE POLICY "Shared plan is insertable by anyone" ON public.plan_state FOR INSERT WITH CHECK (id = 'shared');
CREATE POLICY "Shared plan is updatable by anyone" ON public.plan_state FOR UPDATE USING (id = 'shared') WITH CHECK (id = 'shared');

ALTER TABLE public.plan_state REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.plan_state;