// TEMPORARY debug route for browser verification — delete after use.
import { createFileRoute } from "@tanstack/react-router";
import { MariasQuest } from "@/components/plan/quest";

export const Route = createFileRoute("/quest-debug")({
  component: () => (
    <div className="fixed inset-0">
      <MariasQuest onExit={() => window.history.back()} />
    </div>
  ),
});
