import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

type Person = "andrew" | "maria";

function serverSupabase() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(process.env["SUPABASE_URL"]!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) {
          h.delete("Authorization");
        }
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

/** Public VAPID key — safe to hand to the browser. */
export const getPushPublicKey = createServerFn({ method: "GET" }).handler(async () => ({
  publicKey: process.env["VAPID_PUBLIC_KEY"] ?? "",
}));

export const registerPush = createServerFn({ method: "POST" })
  .inputValidator(
    (input: {
      endpoint: string;
      p256dh: string;
      auth: string;
      person: Person;
      deviceLabel?: string;
    }) => input,
  )
  .handler(async ({ data }) => {
    const supabase = serverSupabase();
    const { error } = await supabase.from("push_subscriptions").upsert(
      {
        endpoint: data.endpoint,
        p256dh: data.p256dh,
        auth: data.auth,
        person: data.person,
        device_label: data.deviceLabel ?? null,
        last_seen_at: new Date().toISOString(),
      },
      { onConflict: "endpoint" },
    );
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const unregisterPush = createServerFn({ method: "POST" })
  .inputValidator((input: { endpoint: string }) => input)
  .handler(async ({ data }) => {
    const supabase = serverSupabase();
    const { error } = await supabase
      .from("push_subscriptions")
      .delete()
      .eq("endpoint", data.endpoint);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

async function deliver(
  rows: { endpoint: string; p256dh: string; auth: string }[],
  message: { title: string; body: string; url?: string; tag?: string },
) {
  const publicKey = process.env["VAPID_PUBLIC_KEY"];
  const privateKey = process.env["VAPID_PRIVATE_KEY"];
  const subject = process.env["VAPID_SUBJECT"] ?? "mailto:notifications@lovable.app";
  if (!publicKey || !privateKey) return { sent: 0, failed: rows.length };

  const { buildPushPayload } = await import("@block65/webcrypto-web-push");
  const supabase = serverSupabase();
  let sent = 0;
  let failed = 0;

  for (const row of rows) {
    try {
      const payload = await buildPushPayload(
        {
          data: JSON.stringify(message),
          options: { ttl: 60 * 60 * 12, urgency: "normal" },
        },
        {
          endpoint: row.endpoint,
          expirationTime: null,
          keys: { p256dh: row.p256dh, auth: row.auth },
        },
        { subject, publicKey, privateKey },
      );
      const res = await fetch(row.endpoint, payload);
      if (res.status === 404 || res.status === 410) {
        await supabase.from("push_subscriptions").delete().eq("endpoint", row.endpoint);
        failed += 1;
      } else if (!res.ok) {
        console.error(`Push failed [${res.status}]: ${await res.text()}`);
        failed += 1;
      } else {
        sent += 1;
      }
    } catch (err) {
      console.error("Push send error", err);
      failed += 1;
    }
  }
  return { sent, failed };
}

/** Notify the OTHER person's devices about a change. */
export const sendPush = createServerFn({ method: "POST" })
  .inputValidator(
    (input: { from: Person; title: string; body: string; url?: string; tag?: string }) => input,
  )
  .handler(async ({ data }) => {
    const supabase = serverSupabase();
    const target: Person = data.from === "andrew" ? "maria" : "andrew";
    const { data: rows, error } = await supabase
      .from("push_subscriptions")
      .select("endpoint, p256dh, auth")
      .eq("person", target);
    if (error) throw new Error(error.message);
    return deliver(rows ?? [], {
      title: data.title,
      body: data.body,
      url: data.url ?? "/",
      tag: data.tag ?? "plan-update",
    });
  });

/** Send a test notification to a specific device (the one asking). */
export const sendTestPush = createServerFn({ method: "POST" })
  .inputValidator((input: { endpoint: string }) => input)
  .handler(async ({ data }) => {
    const supabase = serverSupabase();
    const { data: rows, error } = await supabase
      .from("push_subscriptions")
      .select("endpoint, p256dh, auth")
      .eq("endpoint", data.endpoint)
      .limit(1);
    if (error) throw new Error(error.message);
    if (!rows?.length) throw new Error("This device is not registered yet.");
    return deliver(rows, {
      title: "Notifications are on",
      body: "You'll get an alert whenever the other person updates the plan.",
      url: "/",
      tag: "plan-test",
    });
  });

export const listPushDevices = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = serverSupabase();
  const { data, error } = await supabase
    .from("push_subscriptions")
    .select("id, person, device_label, last_seen_at")
    .order("last_seen_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
});
