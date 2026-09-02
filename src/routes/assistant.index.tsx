import { createFileRoute, redirect } from "@tanstack/react-router";
import { isUnlocked } from "@/lib/gate.functions";
import { AssistantHeader, ThreadList } from "@/components/plan/assistant";

export const Route = createFileRoute("/assistant/")({
  head: () => ({
    meta: [
      { title: "Plan Assistant — Andrew & Maria" },
      {
        name: "description",
        content:
          "AI assistant for Andrew & Maria's financial master plan — ask questions about the budget and approve changes to funds, payments and expenses.",
      },
      { property: "og:title", content: "Plan Assistant — Andrew & Maria" },
      {
        property: "og:description",
        content: "Chat with an assistant that knows your live wedding and apartment budget.",
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
  component: AssistantIndex,
});

function AssistantIndex() {
  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-6">
      <AssistantHeader title="Plan Assistant" />
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="mb-4 text-sm text-slate-600">
          Ask about your budget, funds, payments and expenses — and approve any change before it
          saves. Conversations are shared between both of you.
        </p>
        <ThreadList />
      </div>
    </main>
  );
}
