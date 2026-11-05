import { createFileRoute, redirect } from "@tanstack/react-router";

// Preserve old bookmarks without showing the retired password screen.
export const Route = createFileRoute("/unlock")({
  beforeLoad: () => {
    throw redirect({ to: "/", replace: true });
  },
});