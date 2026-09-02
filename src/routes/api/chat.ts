import { createFileRoute } from "@tanstack/react-router";
import { useSession } from "@tanstack/react-start/server";
import { convertToModelMessages, stepCountIs, streamText, type UIMessage } from "ai";
import {
  createLovableAiGatewayProvider,
  getLovableAiGatewayResponseHeaders,
  getLovableAiGatewayRunId,
  withLovableAiGatewayRunIdHeader,
} from "@/lib/ai-gateway.server";
import { assistantTools } from "@/lib/assistant-tools";
import { ASSISTANT_SYSTEM_PROMPT } from "@/lib/plan-summary";

type GateSession = { unlocked?: boolean };

type ChatRequestBody = { messages?: unknown; planSummary?: unknown };

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const session = await useSession<GateSession>({
          password:
            process.env["SESSION_SECRET"] ?? "dev-only-session-secret-placeholder-32chars",
          name: "plan-gate",
          maxAge: 60 * 60 * 24 * 30,
          cookie: { httpOnly: true, secure: true, sameSite: "lax" as const, path: "/" },
        });
        if (session.data.unlocked !== true) {
          return new Response("Locked", { status: 401 });
        }

        const body = (await request.json()) as ChatRequestBody;
        if (!Array.isArray(body.messages)) {
          return new Response("Messages are required", { status: 400 });
        }

        const apiKey = process.env["LOVABLE_API_KEY"];
        if (!apiKey) {
          return new Response("AI is not configured", { status: 500 });
        }

        const initialRunId = getLovableAiGatewayRunId(request);
        const gateway = createLovableAiGatewayProvider(apiKey, initialRunId);

        const planSummary =
          typeof body.planSummary === "string" ? body.planSummary : "(plan data unavailable)";

        const result = streamText({
          model: gateway("google/gemini-3.7-flash"),
          system: `${ASSISTANT_SYSTEM_PROMPT}\n\n--- LIVE PLAN SNAPSHOT ---\n${planSummary}`,
          messages: await convertToModelMessages(body.messages as UIMessage[]),
          tools: assistantTools,
          stopWhen: stepCountIs(50),
        });

        const response = result.toUIMessageStreamResponse({
          originalMessages: body.messages as UIMessage[],
          headers: getLovableAiGatewayResponseHeaders(undefined, {
            ...(initialRunId ? { "X-Lovable-AIG-Run-ID": initialRunId } : {}),
          }),
        });

        return withLovableAiGatewayRunIdHeader(response, gateway);
      },
    },
  },
});
