import { createFileRoute } from "@tanstack/react-router";
import { MariasQuest } from "@/components/plan/quest";

export const Route = createFileRoute("/game")({
  head: () => ({
    meta: [
      { title: "Maria's Quest — Realm of the Golden Ring" },
      {
        name: "description",
        content:
          "Help Maria bring peace through five realms, collect the Relics of Devotion, and reach the Grand Cathedral.",
      },
      {
        property: "og:title",
        content: "Maria's Quest — Realm of the Golden Ring",
      },
      {
        property: "og:description",
        content:
          "Help Maria bring peace through five realms, collect the Relics of Devotion, and reach the Grand Cathedral.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: GamePage,
});

function GamePage() {
  return (
    <main className="fixed inset-0 overflow-hidden bg-[#0F172A]">
      <MariasQuest />
    </main>
  );
}
