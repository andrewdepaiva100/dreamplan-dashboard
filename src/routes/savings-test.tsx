import { createFileRoute } from "@tanstack/react-router";
import { SavingsTracker } from "@/components/plan/savings-tracker";

export const Route = createFileRoute("/savings-test")({
  component: () => (
    <div className="p-6">
      <SavingsTracker />
    </div>
  ),
});
