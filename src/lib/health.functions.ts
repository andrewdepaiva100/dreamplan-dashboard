import { createServerFn } from "@tanstack/react-start";

export type DbMetrics = {
  db_size_bytes: number;
  connections_used: number;
  connections_max: number;
};

export type HealthSnapshot = {
  id: string;
  measured_at: string;
  db_size_bytes: number;
  wal_size_bytes: number | null;
  connections_used: number;
  connections_max: number;
  data_disk_limit_mb: number;
};

export const getDbMetrics = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const { data: rawMetrics, error: metricsError } = await supabaseAdmin
    .rpc("get_db_metrics")
    .single();
  const metrics = rawMetrics as DbMetrics | null;
  if (metricsError || !metrics) {
    throw new Error(metricsError?.message ?? "Could not read database metrics");
  }

  const { data: history, error: historyError } = await supabaseAdmin
    .from("health_snapshots")
    .select("*")
    .order("measured_at", { ascending: false })
    .limit(24);
  if (historyError) {
    console.error("[health] history read error:", historyError);
  }

  return {
    metrics,
    latest: (history?.[0] ?? null) as HealthSnapshot | null,
    history: (history ?? []) as HealthSnapshot[],
  };
});

export const takeHealthSnapshot = createServerFn({ method: "POST" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const { data, error } = await supabaseAdmin.rpc("take_health_snapshot").single();
  if (error) {
    throw new Error(error.message);
  }

  return { ok: true as const, id: data as string };
});
