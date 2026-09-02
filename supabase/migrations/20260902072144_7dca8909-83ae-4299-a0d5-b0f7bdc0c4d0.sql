ALTER TABLE public.health_snapshots ALTER COLUMN data_disk_limit_mb SET DEFAULT 1024;
UPDATE public.health_snapshots SET data_disk_limit_mb = 1024 WHERE data_disk_limit_mb = 500;