import { createFileRoute } from "@tanstack/react-router";
import { timingSafeEqual } from "node:crypto";

export const Route = createFileRoute("/api/public/health-snap")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = request.headers.get("x-cron-secret");
        const expected = process.env["LOVABLE_CRON_SECRET"];

        if (
          !expected ||
          !secret ||
          !timingSafeEqual(Buffer.from(secret), Buffer.from(expected))
        ) {
          return new Response("Unauthorized", { status: 401 });
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data, error } = await supabaseAdmin.rpc("take_health_snapshot").single<string>();

        if (error) {
          console.error("[health-snap] snapshot error:", error);
          return new Response(error.message, { status: 500 });
        }

        return Response.json({ ok: true, id: data });
      },
    },
  },
});
