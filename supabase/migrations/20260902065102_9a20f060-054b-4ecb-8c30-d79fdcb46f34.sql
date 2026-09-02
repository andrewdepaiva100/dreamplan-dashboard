REVOKE ALL ON FUNCTION public.get_db_metrics() FROM public, anon;
REVOKE ALL ON FUNCTION public.take_health_snapshot() FROM public, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.get_db_metrics() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_db_metrics() TO service_role;

GRANT EXECUTE ON FUNCTION public.take_health_snapshot() TO service_role;