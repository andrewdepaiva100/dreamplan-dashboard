# Storage & Health Monitoring Alerts

## Goal
Add a lightweight, always-visible storage/health monitor to the dashboard so Andrew and Maria can see when the Lovable Cloud database is approaching its limits, with hourly background snapshots and in-app alert badges.

## What we will build

```text
┌─────────────────────────────────────────┐
│  Dashboard "Storage & Health" card       │
│  • Current DB size + % of 500 MB limit  │
│  • Connections used / max               │
│  • Alert badge: OK / Warning / Critical │
│  • Mini history sparkline               │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│  createServerFn: getDbMetrics()          │
│  reads pg_database_size, pg_stat_activity│
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│  /api/public/health-snap (POST)         │
│  secured by LOVABLE_CRON_SECRET          │
│  inserts row into health_snapshots       │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│  pg_cron job (hourly)                   │
│  calls the public endpoint               │
└─────────────────────────────────────────┘
```

## Implementation steps

1. **Database schema**
   - Create `public.health_snapshots` with:
     - `id uuid primary key default gen_random_uuid()`
     - `measured_at timestamptz default now()`
     - `db_size_bytes bigint`
     - `wal_size_bytes bigint` (nullable; WAL size may not be queryable from SQL)
     - `connections_used int`
     - `connections_max int`
     - `data_disk_limit_mb int default 500`
   - Add GRANTs and RLS policy so authenticated users can read all rows; service_role can insert.

2. **Live metrics server function**
   - Add `src/lib/health.functions.ts` with `getDbMetrics()`.
   - Query `pg_database_size(current_database())`, count active connections from `pg_stat_activity` scoped to the current database, and `SHOW max_connections`.
   - Return current values plus the most recent `health_snapshots` row for trend comparison.

3. **Cron snapshot endpoint**
   - Add `src/routes/api/public/health-snap.ts`.
   - Verify `x-cron-secret` header matches `LOVABLE_CRON_SECRET`.
   - Use the service_role client to insert a new `health_snapshots` row with live metrics.
   - Return `{ ok: true }`.

4. **Cron scheduling**
   - In the same migration, attempt to enable `pg_net` and `pg_cron` extensions and schedule an hourly job that POSTs to the stable preview URL:
     `https://project--fimuthujctvvwumzqdbe-dev.lovable.app/api/public/health-snap`.
   - If the extensions cannot be enabled, the UI still records a snapshot on each dashboard visit and provides a manual "Check now" button as a fallback.

5. **Dashboard UI**
   - Add a new large menu button labeled "Storage & Health" to the hub in `src/routes/index.tsx`.
   - Render a dedicated section showing:
     - Database size and a progress bar against the configured 500 MB data-disk limit.
     - Connections used / max.
     - Last snapshot timestamp.
     - Alert badge: green OK (< 80%), yellow Warning (80–89%), red Critical (≥ 90%).
   - Include a "Check now / refresh" button that calls `getDbMetrics()` and inserts a fresh snapshot.

6. **Activity-log integration**
   - When the alert level changes from OK → Warning/Critical (or back), append a short entry to the plan activity log so the change is visible in the existing Activity & Notes section.

## Technical notes

- The current database is **10.6 MB** on a **~500 MB** data disk (2% used), so alerts will not fire immediately.
- `pg_database_size` gives the live database size; the percentage is calculated against `data_disk_limit_mb`, which can be adjusted in `health_snapshots` if the disk is resized again.
- WAL size is reported by the agent health tool but is not always readable from user SQL; we will store it when available and leave it null otherwise.
- The cron route is public by design (external scheduler calls it) but protected by the cron secret already stored in project secrets.

## Success criteria
- Typecheck and build pass.
- The new "Storage & Health" section displays current size, usage %, and connections.
- Calling the cron endpoint with the correct secret inserts a row.
- After the cron job runs, the history list shows hourly snapshots.
- In-app alert badge reflects threshold logic.
