REVOKE ALL ON FUNCTION public.get_db_metrics() FROM authenticated;
GRANT EXECUTE ON FUNCTION public.get_db_metrics() TO service_role;