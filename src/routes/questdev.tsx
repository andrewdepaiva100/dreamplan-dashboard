import { createFileRoute } from "@tanstack/react-router";
import QuestGame from "@/components/plan/quest";
export const Route = createFileRoute("/questdev")({ component: () => <QuestGame onBack={() => {}} /> });
