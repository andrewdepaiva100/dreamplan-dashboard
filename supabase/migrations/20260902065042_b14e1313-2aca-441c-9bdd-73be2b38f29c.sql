CREATE TABLE public.health_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  measured_at timestamptz NOT NULL DEFAULT now(),
  db_size_bytes bigint NOT NULL,
  wal_size_bytes bigint,
  connections_used int NOT NULL,
  connections_max int NOT NULL,
  data_disk_limit_mb int NOT NULL DEFAULT 500
);

GRANT SELECT ON public.health_snapshots TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.health_snapshots TO service_role;

ALTER TABLE public.health_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read all health snapshots"
  ON public.health_snapshots
  FOR SELECT
  TO authenticated
  USING (true);

CREATE OR REPLACE FUNCTION public.get_db_metrics()
RETURNS TABLE(db_size_bytes bigint, connections_used bigint, connections_max int)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    pg_database_size(current_database())::bigint AS db_size_bytes,
    (SELECT count(*)::bigint FROM pg_stat_activity WHERE datname = current_database()) AS connections_used,
    current_setting('max_connections')::int AS connections_max;
$$;

GRANT EXECUTE ON FUNCTION public.get_db_metrics() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_db_metrics() TO service_role;

CREATE OR REPLACE FUNCTION public.take_health_snapshot()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  metrics record;
  snap_id uuid;
BEGIN
  SELECT * INTO metrics FROM public.get_db_metrics();
  INSERT INTO public.health_snapshots (db_size_bytes, connections_used, connections_max)
  VALUES (metrics.db_size_bytes, metrics.connections_used, metrics.connections_max)
  RETURNING id INTO snap_id;
  RETURN snap_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.take_health_snapshot() TO service_role;

CREATE EXTENSION IF NOT EXISTS pg_cron;

SELECT cron.schedule(
  'health-snapshot-hourly',
  '0 * * * *',
  'SELECT public.take_health_snapshot()'
);