import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { PanelLeft } from "lucide-react";
import { isUnlocked } from "@/lib/gate.functions";
import { AssistantChat, AssistantHeader, ThreadList } from "@/components/plan/assistant";
import { usePlan } from "@/lib/use-plan";

export const Route = createFileRoute("/assistant/$threadId")({
  head: () => ({
    meta: [
      { title: "Plan Assistant Chat — Andrew & Maria" },
      {
        name: "description",
        content:
          "A shared assistant conversation about Andrew & Maria's wedding, apartment and savings plan.",
      },
      { property: "og:title", content: "Plan Assistant Chat — Andrew & Maria" },
      {
        property: "og:description",
        content: "Shared AI conversation about the live financial master plan.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  loader: async () => {
    const { unlocked } = await isUnlocked();
    if (!unlocked) throw redirect({ to: "/unlock" });
    return null;
  },
  component: AssistantThread,
});

function AssistantThread() {
  const { threadId } = Route.useParams();
  const planApi = usePlan();
  const [showThreads, setShowThreads] = useState(false);

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6">
      <div className="flex items-center justify-between gap-3">
        <AssistantHeader title="Plan Assistant" />
        <button
          onClick={() => setShowThreads((v) => !v)}
          className="mb-4 flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-navy transition hover:bg-slate-50 lg:hidden"
        >
          <PanelLeft className="h-3.5 w-3.5" /> Chats
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
        <aside className={`${showThreads ? "block" : "hidden"} lg:block`}>
          <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
            <ThreadList activeId={threadId} compact />
          </div>
        </aside>

        <section className="rounded-2xl border border-slate-200 bg-cream/40 p-4 shadow-sm">
          <AssistantChat threadId={threadId} planApi={planApi} />
        </section>
      </div>
    </main>
  );
}
