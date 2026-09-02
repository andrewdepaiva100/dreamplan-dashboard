import { useEffect, useMemo, useState } from "react";
import { BookOpen, RefreshCw, Sparkles } from "lucide-react";
import {
  getDevotional,
  idForDate,
  todayKey,
  TOTAL_DEVOTIONALS,
} from "@/lib/devotionals";
import { formatDate, relativeTime, type PlanState } from "@/lib/plan-data";

function NoteBox({
  name,
  accent,
  value,
  onCommit,
}: {
  name: string;
  accent: string;
  value: string;
  onCommit: (v: string) => void;
}) {
  const [draft, setDraft] = useState(value);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused) setDraft(value);
  }, [value, focused]);

  // Debounced save so both phones stay in sync while typing.
  useEffect(() => {
    if (!focused) return;
    const t = setTimeout(() => onCommit(draft), 600);
    return () => clearTimeout(t);
  }, [draft, focused, onCommit]);

  return (
    <div className="rounded-2xl border border-line bg-white p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className={`text-[13px] font-bold uppercase tracking-wider ${accent}`}>
          {name}
        </span>
        <span className="text-[11px] text-ink-soft">
          {draft.trim() ? `${draft.trim().split(/\s+/).length} words` : "notes & prayers"}
        </span>
      </div>
      <textarea
        value={draft}
        onFocus={() => setFocused(true)}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => {
          setFocused(false);
          onCommit(draft);
        }}
        rows={7}
        placeholder={`${name}, write your reflections, prayer requests, or answers to today's questions…`}
        className="w-full resize-y rounded-xl border border-line bg-mist/50 px-3 py-2.5 text-[14px] leading-relaxed text-ink focus:border-royal focus:bg-white focus:outline-none focus:ring-4 focus:ring-royal/10"
      />
    </div>
  );
}

export function Devotionals({
  devotionals,
  onOpen,
  onNote,
  onSelectDay,
}: {
  devotionals: PlanState["devotionals"];
  onOpen: (dateKey: string, entryId: number, label: string) => void;
  onNote: (dateKey: string, who: "andrew" | "maria", text: string) => void;
  onSelectDay: (dateKey: string) => void;
}) {
  const today = todayKey();
  const current = devotionals.current;
  const entry = useMemo(
    () => (current ? getDevotional(current.entryId) : null),
    [current],
  );
  const day = current ? devotionals.days[current.date] : undefined;

  const openToday = () => {
    const existing = devotionals.days[today];
    const id = existing ? existing.entryId : idForDate(today);
    onOpen(today, id, `${getDevotional(id).reference} — ${getDevotional(id).title}`);
  };

  const pullAnother = () => {
    const base = devotionals.days[today]?.entryId ?? idForDate(today);
    const id = (base + 1 + Math.floor(Math.random() * 97)) % TOTAL_DEVOTIONALS;
    onOpen(today, id, `${getDevotional(id).reference} — ${getDevotional(id).title}`);
  };

  const recent = Object.entries(devotionals.days)
    .sort((a, b) => (a[0] < b[0] ? 1 : -1))
    .slice(0, 8);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={openToday}
          className="inline-flex items-center gap-2 rounded-xl bg-navy px-5 py-3 text-[14px] font-bold text-white shadow-sm transition-colors hover:bg-royal"
        >
          <Sparkles className="h-4 w-4 text-gold" />
          Open Today&apos;s Devotional
        </button>
        {entry && (
          <button
            onClick={pullAnother}
            className="inline-flex items-center gap-2 rounded-xl border border-line bg-mist px-4 py-3 text-[13px] font-semibold text-royal transition-colors hover:bg-line"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Pull another
          </button>
        )}
        <span className="text-[12px] text-ink-soft">
          {TOTAL_DEVOTIONALS.toLocaleString()} devotionals for engaged couples
        </span>
      </div>

      {!entry && (
        <div className="mt-6 rounded-2xl border border-dashed border-line bg-mist/50 px-6 py-10 text-center">
          <BookOpen className="mx-auto mb-3 h-7 w-7 text-gold" />
          <p className="text-[14px] font-semibold text-navy">No devotional opened yet</p>
          <p className="mt-1 text-[13px] text-ink-soft">
            Tap “Open Today&apos;s Devotional” and it will appear here for both of you.
          </p>
        </div>
      )}

      {entry && current && (
        <>
          <article className="mt-6 rounded-2xl border border-line bg-white p-6 sm:p-8">
            <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-ink-soft">
              <span className="rounded-full bg-gold/15 px-2.5 py-1 text-gold">
                {entry.title}
              </span>
              <span>{formatDate(current.date)}</span>
              <span>#{entry.id + 1} of {TOTAL_DEVOTIONALS.toLocaleString()}</span>
            </div>

            <blockquote className="mt-4 border-l-4 border-gold bg-mist/60 px-5 py-4">
              <p className="font-display text-[17px] leading-relaxed text-navy">
                “{entry.verse}”
              </p>
              <cite className="mt-2 block text-[12.5px] font-semibold not-italic text-royal">
                {entry.reference} (WEB)
              </cite>
            </blockquote>

            <div className="mt-5 space-y-4">
              {entry.message.map((p, i) => (
                <p key={i} className="text-[14.5px] leading-[1.75] text-ink">
                  {p}
                </p>
              ))}
            </div>

            <div className="mt-6 rounded-2xl border-l-4 border-l-teal bg-teal/10 p-5">
              <div className="mb-2 text-[13.5px] font-bold text-navy">
                Three questions to discuss together
              </div>
              <ol className="list-decimal space-y-2 pl-5 text-[14px] leading-relaxed text-ink">
                {entry.questions.map((q, i) => (
                  <li key={i}>{q}</li>
                ))}
              </ol>
            </div>
          </article>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <NoteBox
              name="Andrew"
              accent="text-royal"
              value={day?.andrew ?? ""}
              onCommit={(v) => onNote(current.date, "andrew", v)}
            />
            <NoteBox
              name="Maria"
              accent="text-gold"
              value={day?.maria ?? ""}
              onCommit={(v) => onNote(current.date, "maria", v)}
            />
          </div>
        </>
      )}

      {recent.length > 0 && (
        <div className="mt-7">
          <h3 className="mb-3 text-[12px] font-bold uppercase tracking-wider text-ink-soft">
            Recent devotionals
          </h3>
          <div className="grid gap-2 sm:grid-cols-2">
            {recent.map(([dateKey, d]) => {
              const e = getDevotional(d.entryId);
              const active = current?.date === dateKey;
              return (
                <button
                  key={dateKey}
                  onClick={() => onSelectDay(dateKey)}
                  className={`rounded-xl border px-4 py-3 text-left transition-colors ${
                    active
                      ? "border-royal bg-royal/5"
                      : "border-line bg-white hover:bg-mist"
                  }`}
                >
                  <div className="text-[13.5px] font-semibold text-navy">
                    {e.reference} — {e.title}
                  </div>
                  <div className="mt-0.5 text-[11.5px] text-ink-soft">
                    {formatDate(dateKey)} · {relativeTime(d.at)}
                    {d.andrew.trim() ? " · Andrew wrote notes" : ""}
                    {d.maria.trim() ? " · Maria wrote notes" : ""}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
