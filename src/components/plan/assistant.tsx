import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import {
  DefaultChatTransport,
  lastAssistantMessageIsCompleteWithToolCalls,
  type UIMessage,
} from "ai";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Check, Loader2, MessageSquare, Plus, Send, Sparkles, Trash2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  createThread,
  deleteThread,
  listThreads,
  loadMessages,
  renameThread,
  saveMessage,
  type ChatThread,
} from "@/lib/chat-store";
import { applyAssistantAction, describeAction } from "@/lib/apply-assistant-action";
import { buildPlanSummary } from "@/lib/plan-summary";
import { relativeTime } from "@/lib/plan-data";
import { usePlan } from "@/lib/use-plan";

type PlanApi = ReturnType<typeof usePlan>;

/* ------------------------------------------------------------------ threads */

export function ThreadList({
  activeId,
  onCreated,
  compact = false,
}: {
  activeId?: string;
  onCreated?: (id: string) => void;
  compact?: boolean;
}) {
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  const refresh = useCallback(async () => {
    try {
      setThreads(await listThreads());
    } catch {
      /* offline */
    }
  }, []);

  useEffect(() => {
    void refresh();
    const channel = supabase
      .channel("chat_threads_sync")
      .on("postgres_changes", { event: "*", schema: "public", table: "chat_threads" }, () => {
        void refresh();
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [refresh]);

  const startNew = async () => {
    setBusy(true);
    try {
      const thread = await createThread();
      onCreated?.(thread.id);
      await navigate({ to: "/assistant/$threadId", params: { threadId: thread.id } });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-3">
      <button
        onClick={startNew}
        disabled={busy}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-navy px-4 py-3 text-sm font-semibold text-white transition hover:bg-royal disabled:opacity-60"
      >
        <Plus className="h-4 w-4" /> New chat
      </button>

      <div className={compact ? "max-h-64 space-y-1 overflow-y-auto" : "space-y-1"}>
        {threads.length === 0 && (
          <p className="px-1 py-2 text-sm text-slate-500">No conversations yet.</p>
        )}
        {threads.map((t) => (
          <div
            key={t.id}
            className={`flex items-center gap-1 rounded-lg px-1 transition ${
              t.id === activeId ? "bg-navy/10" : "hover:bg-slate-100"
            }`}
          >
            <Link
              to="/assistant/$threadId"
              params={{ threadId: t.id }}
              className="flex min-w-0 flex-1 items-center gap-2 px-2 py-2.5 text-left"
            >
              <MessageSquare className="h-4 w-4 shrink-0 text-slate-400" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-navy">{t.title}</span>
                <span className="block text-[11px] text-slate-400">
                  {relativeTime(new Date(t.updated_at).getTime())}
                </span>
              </span>
            </Link>
            <button
              aria-label={`Delete ${t.title}`}
              onClick={async () => {
                await deleteThread(t.id);
                await refresh();
                if (t.id === activeId) await navigate({ to: "/assistant" });
              }}
              className="rounded-md p-2 text-slate-300 transition hover:bg-red-50 hover:text-red-500"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* --------------------------------------------------------------- approval UI */

function ApprovalCard({
  toolName,
  input,
  state,
  output,
  onApprove,
  onCancel,
}: {
  toolName: string;
  input: any;
  state: string;
  output: any;
  onApprove: () => void;
  onCancel: () => void;
}) {
  const done = state === "output-available" || state === "output-error";
  return (
    <div className="mt-2 rounded-xl border border-gold/40 bg-gold/5 p-3">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-gold">
        Proposed change
      </p>
      <p className="mt-1 text-sm font-medium text-navy">{describeAction(toolName, input)}</p>
      {done ? (
        <p
          className={`mt-2 text-xs font-medium ${
            output?.applied ? "text-teal" : "text-slate-500"
          }`}
        >
          {output?.applied ? "✓ Applied" : "Not applied"} — {output?.detail ?? ""}
        </p>
      ) : (
        <div className="mt-3 flex gap-2">
          <button
            onClick={onApprove}
            className="flex items-center gap-1.5 rounded-lg bg-teal px-3 py-2 text-xs font-semibold text-white transition hover:opacity-90"
          >
            <Check className="h-3.5 w-3.5" /> Approve
          </button>
          <button
            onClick={onCancel}
            className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            <X className="h-3.5 w-3.5" /> Cancel
          </button>
        </div>
      )}
    </div>
  );
}

/* --------------------------------------------------------------------- chat */

export function AssistantChat({ threadId, planApi }: { threadId: string; planApi: PlanApi }) {
  const [initial, setInitial] = useState<UIMessage[] | null>(null);
  const [input, setInput] = useState("");
  const [errorText, setErrorText] = useState<string | null>(null);
  const planRef = useRef(planApi);
  planRef.current = planApi;
  const savedIds = useRef<Set<string>>(new Set());
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    setInitial(null);
    savedIds.current = new Set();
    (async () => {
      try {
        const msgs = await loadMessages(threadId);
        if (cancelled) return;
        msgs.forEach((m) => savedIds.current.add(m.id));
        setInitial(msgs);
      } catch {
        if (!cancelled) setInitial([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [threadId]);

  if (!initial) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-slate-400">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  return (
    <ChatWindow
      key={threadId}
      threadId={threadId}
      initialMessages={initial}
      planRef={planRef}
      input={input}
      setInput={setInput}
      errorText={errorText}
      setErrorText={setErrorText}
      savedIds={savedIds}
      bottomRef={bottomRef}
      inputRef={inputRef}
    />
  );
}

function ChatWindow({
  threadId,
  initialMessages,
  planRef,
  input,
  setInput,
  errorText,
  setErrorText,
  savedIds,
  bottomRef,
  inputRef,
}: {
  threadId: string;
  initialMessages: UIMessage[];
  planRef: { current: PlanApi };
  input: string;
  setInput: (v: string) => void;
  errorText: string | null;
  setErrorText: (v: string | null) => void;
  savedIds: { current: Set<string> };
  bottomRef: { current: HTMLDivElement | null };
  inputRef: { current: HTMLTextAreaElement | null };
}) {
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        prepareSendMessagesRequest: ({ messages, body }) => ({
          body: {
            ...body,
            messages,
            planSummary: buildPlanSummary(planRef.current.plan),
          },
        }),
      }),
    [planRef],
  );

  const { messages, sendMessage, status, addToolResult } = useChat({
    id: threadId,
    messages: initialMessages,
    transport,
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
    onError: (error) => setErrorText(error.message || "Something went wrong."),
  });

  // Persist every completed message to the shared cloud thread.
  useEffect(() => {
    if (status === "streaming" || status === "submitted") return;
    for (const message of messages) {
      if (savedIds.current.has(message.id)) continue;
      savedIds.current.add(message.id);
      void saveMessage(threadId, message);
    }
    const firstUser = messages.find((m) => m.role === "user");
    if (firstUser && messages.length <= 2) {
      const text = firstUser.parts
        .map((p) => (p.type === "text" ? p.text : ""))
        .join(" ")
        .trim()
        .slice(0, 60);
      if (text) void renameThread(threadId, text);
    }
  }, [messages, status, threadId, savedIds]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, status, bottomRef]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [threadId, status, inputRef]);

  const busy = status === "submitted" || status === "streaming";

  const submit = async () => {
    const text = input.trim();
    if (!text || busy) return;
    setInput("");
    setErrorText(null);
    await sendMessage({ text });
  };

  const respond = (toolName: string, toolCallId: string, approved: boolean, toolInput: any) => {
    const result = approved
      ? applyAssistantAction(toolName, toolInput, planRef.current)
      : { applied: false, detail: "Andrew/Maria cancelled this change." };
    void addToolResult({
      tool: toolName as never,
      toolCallId,
      output: result as never,
    });
  };

  return (
    <div className="flex min-h-[60vh] flex-col">
      <div className="flex-1 space-y-4">
        {messages.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center">
            <Sparkles className="mx-auto h-6 w-6 text-gold" />
            <p className="mt-2 text-base font-semibold text-navy">Ask me anything about the plan</p>
            <p className="mt-1 text-sm text-slate-500">
              “How much surplus after the next two payments?” · “Mark payment 2 as paid” · “Log $62
              groceries for Maria”
            </p>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={message.role === "user" ? "flex justify-end" : "flex justify-start"}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                message.role === "user"
                  ? "bg-navy text-white"
                  : "border border-slate-200 bg-white text-slate-800"
              }`}
            >
              {message.parts.map((part, i) => {
                if (part.type === "text") {
                  return (
                    <p key={i} className="whitespace-pre-wrap">
                      {part.text}
                    </p>
                  );
                }
                if (part.type.startsWith("tool-")) {
                  const p = part as any;
                  return (
                    <ApprovalCard
                      key={i}
                      toolName={part.type.slice(5)}
                      input={p.input}
                      state={p.state}
                      output={p.output}
                      onApprove={() => respond(part.type.slice(5), p.toolCallId, true, p.input)}
                      onCancel={() => respond(part.type.slice(5), p.toolCallId, false, p.input)}
                    />
                  );
                }
                return null;
              })}
            </div>
          </div>
        ))}

        {busy && (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" /> Thinking…
          </div>
        )}

        {errorText && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
            {errorText}
          </p>
        )}

        <div ref={bottomRef} />
      </div>

      <div className="sticky bottom-0 mt-4 border-t border-slate-200 bg-cream/90 py-3 backdrop-blur">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void submit();
              }
            }}
            rows={2}
            placeholder="Ask about the plan, or tell me what to change…"
            className="min-h-[52px] flex-1 resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-navy"
          />
          <button
            onClick={() => void submit()}
            disabled={busy || !input.trim()}
            className="flex h-[52px] w-[52px] items-center justify-center rounded-xl bg-gold text-white transition hover:opacity-90 disabled:opacity-40"
            aria-label="Send"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
        <p className="mt-2 text-[11px] text-slate-400">
          The assistant can change your plan only after you tap Approve. It can’t edit the app’s
          code.
        </p>
      </div>
    </div>
  );
}

export function AssistantHeader({ title }: { title: string }) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <Link
        to="/"
        className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-navy transition hover:bg-slate-50"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Dashboard
      </Link>
      <h1 className="text-lg font-semibold text-navy">{title}</h1>
    </div>
  );
}
