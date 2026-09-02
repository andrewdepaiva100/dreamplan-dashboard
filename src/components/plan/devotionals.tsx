import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, BookOpen, RefreshCw, Sparkles, User } from "lucide-react";
import {
  getDevotional,
  idForDate,
  todayKey,
  TOTAL_DEVOTIONALS,
} from "@/lib/devotionals";
import { formatDate, relativeTime, type PlanState } from "@/lib/plan-data";

type Who = "andrew" | "maria";

const PEOPLE: { id: Who; name: string; accent: string; active: string }[] = [
  { id: "andrew", name: "Andrew", accent: "text-royal", active: "border-royal bg-royal text-white" },
  { id: "maria", name: "Maria", accent: "text-gold", active: "border-gold bg-gold text-white" },
];

// Each person gets an independent entry from the bank for the same day.
const seedFor = (who: Who, dateKey: string) => idForDate(`${who}:${dateKey}`);

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

  useEffect(() => {
    if (!focused) return;
    const t = setTimeout(() => onCommit(draft), 600);
    return () => clearTimeout(t);
  }, [draft, focused, onCommit]);

  return (
    <div className="rounded-2xl border border-line bg-white p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className={`text-[13px] font-bold uppercase tracking-wider ${accent}`}>
          {name}&apos;s reflection
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
        rows={8}
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
  onBack,
}: {
  devotionals: PlanState["devotionals"];
  onOpen: (who: Who, dateKey: string, entryId: number, label: string) => void;
  onNote: (who: Who, dateKey: string, text: string) => void;
  onSelectDay: (who: Who, dateKey: string) => void;
  onBack: () => void;
}) {
  const [who, setWho] = useState<Who | null>(null);

  // Hooks must run unconditionally — compute the selected person's entry up
  // front with guards, before any early return below.
  const person = who ? devotionals?.people?.[who] : undefined;
  const currentDate = person?.current ?? null;
  const day = currentDate && person ? person.days?.[currentDate] : undefined;
  const entry = useMemo(() => (day ? getDevotional(day.entryId) : null), [day]);

  // Landing view: pick a person.
  if (!who || !person) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold text-navy">Daily Devotionals</h2>
            <p className="mt-1 max-w-xl text-[14px] leading-relaxed text-ink-soft">
              Choose whose space to open. Andrew and Maria each have their own devotional from the bank, private notes, and history — all synced live.
            </p>
          </div>
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/20"
          >
            <ArrowLeft size={16} strokeWidth={2.2} />
            Back to Dashboard
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {PEOPLE.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setWho(p.id)}
              className="card-surface group flex flex-col items-center gap-4 rounded-2xl p-8 text-center transition-all hover:-translate-y-0.5 hover:border-gold/50 hover:shadow-[var(--shadow-cover)]"
            >
              <span
                className={`flex h-16 w-16 items-center justify-center rounded-2xl border-2 transition-transform group-hover:scale-110 ${p.active}`}
              >
                <User size={32} strokeWidth={2} />
              </span>
              <div>
                <span className="block text-xl font-bold text-navy">{p.name}</span>
                <span className="mt-1 block text-[13px] text-ink-soft">
                  Open {p.name}&apos;s devotional space
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const today = todayKey();
  const meta = PEOPLE.find((p) => p.id === who)!;

  const openToday = () => {
    const existing = person.days?.[today];
    const id = existing ? existing.entryId : seedFor(who, today);
    const e = getDevotional(id);
    onOpen(who, today, id, `${e.reference} — ${e.title}`);
  };

  const pullAnother = () => {
    const base = person.days?.[today]?.entryId ?? seedFor(who, today);
    const id = (base + 1 + Math.floor(Math.random() * 97)) % TOTAL_DEVOTIONALS;
    const e = getDevotional(id);
    onOpen(who, today, id, `${e.reference} — ${e.title}`);
  };

  const recent = Object.entries(person.days ?? {})
    .sort((a, b) => (a[0] < b[0] ? 1 : -1))
    .slice(0, 8);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setWho(null)}
          className="inline-flex items-center gap-2 rounded-xl border border-line bg-white px-4 py-2.5 text-sm font-semibold text-navy transition-colors hover:bg-mist"
        >
          <ArrowLeft size={16} strokeWidth={2.2} />
          Back to choice
        </button>
        <span className={`text-[13px] font-bold uppercase tracking-wider ${meta.accent}`}>
          {meta.name}&apos;s devotional space
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={openToday}
          className="inline-flex items-center gap-2 rounded-xl bg-navy px-5 py-3 text-[14px] font-bold text-white shadow-sm transition-colors hover:bg-royal"
        >
          <Sparkles className="h-4 w-4 text-gold" />
          Open {meta.name}&apos;s Devotional
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
          <p className="text-[14px] font-semibold text-navy">
            No devotional opened yet for {meta.name}
          </p>
          <p className="mt-1 text-[13px] text-ink-soft">
            Tap the button above and {meta.name}&apos;s reading will appear here on both phones.
          </p>
        </div>
      )}

      {entry && currentDate && (
        <>
          <article className="mt-6 rounded-2xl border border-line bg-white p-6 sm:p-8">
            <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-ink-soft">
              <span className={`rounded-full bg-mist px-2.5 py-1 ${meta.accent}`}>
                {meta.name}
              </span>
              <span className="rounded-full bg-gold/15 px-2.5 py-1 text-gold">{entry.title}</span>
              <span>{formatDate(currentDate)}</span>
              <span>
                #{entry.id + 1} of {TOTAL_DEVOTIONALS.toLocaleString()}
              </span>
            </div>

            <blockquote className="mt-4 border-l-4 border-gold bg-mist/60 px-5 py-4">
              <p className="font-display text-[17px] leading-relaxed text-navy">
                &ldquo;{entry.verse}&rdquo;
              </p>
              <cite className="mt-2 block text-[12.5px] font-semibold not-italic text-royal">
                {entry.reference} ({TRANSLATION})
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
                Three reflection questions
              </div>
              <ol className="list-decimal space-y-2 pl-5 text-[14px] leading-relaxed text-ink">
                {entry.questions.map((q, i) => (
                  <li key={i}>{q}</li>
                ))}
              </ol>
            </div>
          </article>

          <div className="mt-5">
            <NoteBox
              name={meta.name}
              accent={meta.accent}
              value={day?.note ?? ""}
              onCommit={(v) => onNote(who, currentDate, v)}
            />
          </div>
        </>
      )}

      {recent.length > 0 && (
        <div className="mt-7">
          <h3 className="mb-3 text-[12px] font-bold uppercase tracking-wider text-ink-soft">
            {meta.name}&apos;s recent devotionals
          </h3>
          <div className="grid gap-2 sm:grid-cols-2">
            {recent.map(([dateKey, d]) => {
              const e = getDevotional(d.entryId);
              const isActive = currentDate === dateKey;
              return (
                <button
                  key={dateKey}
                  onClick={() => onSelectDay(who, dateKey)}
                  className={`rounded-xl border px-4 py-3 text-left transition-colors ${
                    isActive ? "border-royal bg-royal/5" : "border-line bg-white hover:bg-mist"
                  }`}
                >
                  <div className="text-[13.5px] font-semibold text-navy">
                    {e.reference} — {e.title}
                  </div>
                  <div className="mt-0.5 text-[11.5px] text-ink-soft">
                    {formatDate(dateKey)} · {relativeTime(d.at)}
                    {d.note?.trim() ? " · notes saved" : ""}
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
