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

/**
 * A tool call that was never approved or cancelled (the user closed the page or
 * switched threads) leaves a dangling tool part. Converting that history throws
 * AI_MissingToolResultsError, which used to hang the worker and 502 the thread.
 * Give every unanswered call a synthetic "not confirmed" result instead.
 */
function answerDanglingToolCalls(messages: UIMessage[]): UIMessage[] {
  return messages.map((message) => ({
    ...message,
    parts: (message.parts ?? []).map((part) => {
      const p = part as { type?: string; state?: string };
      if (typeof p.type !== "string" || !p.type.startsWith("tool-")) return part;
      if (p.state === "output-available" || p.state === "output-error") return part;
      return {
        ...(part as object),
        state: "output-available",
        output: { applied: false, detail: "This change was never confirmed, so nothing changed." },
      } as typeof part;
    }),
  }));
}

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const session = await useSession<GateSession>({
          password: process.env["SESSION_SECRET"] ?? "dev-only-session-secret-placeholder-32chars",
          name: "plan-gate",
          maxAge: 60 * 60 * 24 * 30,
          cookie: { httpOnly: true, secure: true, sameSite: "lax" as const, path: "/" },
        });
        if (session.data.unlocked !== true) {
          return new Response("Locked", { status: 401 });
        }

        try {
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

          const safeMessages = answerDanglingToolCalls(body.messages as UIMessage[]);

          const result = streamText({
            model: gateway("google/gemini-3.7-flash"),
            system: `${ASSISTANT_SYSTEM_PROMPT}\n\n--- LIVE PLAN SNAPSHOT ---\n${planSummary}`,
            messages: await convertToModelMessages(safeMessages),
            tools: assistantTools,
            stopWhen: stepCountIs(50),
          });

          const response = result.toUIMessageStreamResponse({
            originalMessages: safeMessages,
            headers: getLovableAiGatewayResponseHeaders(undefined, {
              ...(initialRunId ? { "X-Lovable-AIG-Run-ID": initialRunId } : {}),
            }),
          });

          return withLovableAiGatewayRunIdHeader(response, gateway);
        } catch (error) {
          console.error("chat handler failed", error);
          return new Response(
            JSON.stringify({
              error: "The assistant could not answer that. Please try again.",
            }),
            { status: 500, headers: { "Content-Type": "application/json" } },
          );
        }
      },
    },
  },
});
