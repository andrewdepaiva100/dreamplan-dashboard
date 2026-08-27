import { useState } from "react";
import { relativeTime, type PlanState } from "@/lib/plan-data";

export function ActivityPanel({
  log,
  comments,
  onAddComment,
}: {
  log: PlanState["log"];
  comments: PlanState["comments"];
  onAddComment: (author: string, text: string) => void;
}) {
  const [tab, setTab] = useState<"log" | "notes">("log");
  const [author, setAuthor] = useState("Andrew");
  const [text, setText] = useState("");

  return (
    <div>
      <div className="mb-5 flex gap-2">
        {(
          [
            ["log", `Edit History (${log.length})`],
            ["notes", `Shared Notes (${comments.length})`],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`rounded-full border px-4 py-2 text-[12.5px] font-semibold transition-colors ${
              tab === key
                ? "border-royal bg-royal text-white"
                : "border-line bg-mist text-royal hover:bg-line"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "log" ? (
        <div className="max-h-[280px] overflow-y-auto pr-1">
          {log.length === 0 ? (
            <p className="text-sm text-ink-soft">
              No edits yet. Change any amount or date and it will be recorded here.
            </p>
          ) : (
            log.map((e) => (
              <div key={e.id} className="border-b border-mist py-2.5 text-[13px] text-ink">
                <span className="font-semibold text-royal">{e.label}</span> changed from{" "}
                {e.from} to {e.to}
                <div className="mt-0.5 text-[11px] text-ink-soft">{relativeTime(e.at)}</div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <input
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Name"
              className="w-28 rounded-full border border-line bg-paper px-3 py-2 text-[13px] text-ink focus:border-royal focus:outline-none"
            />
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && text.trim()) {
                  onAddComment(author, text.trim());
                  setText("");
                }
              }}
              placeholder="Add a note for the two of you…"
              className="min-w-[200px] flex-1 rounded-full border border-line bg-paper px-4 py-2 text-[13px] text-ink focus:border-royal focus:outline-none"
            />
            <button
              onClick={() => {
                if (!text.trim()) return;
                onAddComment(author, text.trim());
                setText("");
              }}
              className="rounded-full bg-royal px-4 py-2 text-[12.5px] font-semibold text-white transition-colors hover:bg-deep-blue"
            >
              Post note
            </button>
          </div>
          <div className="max-h-[280px] overflow-y-auto pr-1">
            {comments.length === 0 ? (
              <p className="text-sm text-ink-soft">No notes yet.</p>
            ) : (
              comments.map((c) => (
                <div key={c.id} className="mb-2 rounded-xl bg-mist px-3 py-2.5 text-[13.5px] leading-relaxed text-ink">
                  {c.text}
                  <div className="mt-1 text-[11px] text-ink-soft">
                    {c.author} · {relativeTime(c.at)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
