import { createFileRoute } from "@tanstack/react-router";
import Quest3D from "@/components/plan/quest3d/Quest3D";

export const Route = createFileRoute("/quest3d-test")({
  ssr: false,
  component: () => <Quest3D onExit={() => window.history.back()} />,
});
