import { createFileRoute } from "@tanstack/react-router";
import { MariasQuest } from "@/components/plan/quest";

export const Route = createFileRoute("/quest-test")({
  ssr: false,
  component: () => <MariasQuest onExit={() => {}} />,
});
