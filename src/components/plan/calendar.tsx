import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Check,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import {
  ASSIGNEES,
  CALENDAR_MAX,
  CALENDAR_MIN,
  CATEGORIES,
  CATEGORY_MAP,
  MONTH_NAMES,
  PALETTE,
  WEEKDAYS,
  canGoNext,
  canGoPrev,
  formatDayLabel,
  formatShortDay,
  formatTime,
  monthGrid,
  parseKey,
  todayKey,
  type AssignedTo,
  type CalendarEvent,
  type CategoryKey,
} from "@/lib/calendar-data";
import { useCalendar, type NewEvent } from "@/lib/use-calendar";

const assigneeLabel = (a: AssignedTo) =>
  ASSIGNEES.find((x) => x.key === a)?.label ?? "Both";

function clampMonth(dateKey: string) {
  const d = parseKey(dateKey);
  const y = Math.min(Math.max(d.getFullYear(), 2026), 2027);
  return { year: y, month: y === d.getFullYear() ? d.getMonth() : 0 };
}

type FormState = {
  id: string | null;
  title: string;
  category: CategoryKey;
  color: string;
  event_date: string;
  event_time: string;
  assigned_to: AssignedTo;
  notes: string;
  customColor: boolean;
};

const emptyForm = (date: string): FormState => ({
  id: null,
  title: "",
  category: "dates",
  color: CATEGORY_MAP.dates.color,
  event_date: date,
  event_time: "",
  assigned_to: "both",
  notes: "",
  customColor: false,
});

export function SharedCalendar({ onBack }: { onBack: () => void }) {
  const { byDate, events, loading, error, addEvent, updateEvent, removeEvent, toggleComplete } =
    useCalendar();

  const initial = clampMonth(todayKey());
  const [year, setYear] = useState(initial.year);
  const [month, setMonth] = useState(initial.month);
  const [view, setView] = useState<"month" | "agenda">("month");
  const [openDay, setOpenDay] = useState<string | null>(null);
  const [form, setForm] = useState<FormState | null>(null);
  const [saving, setSaving] = useState(false);

  const cells = useMemo(() => monthGrid(year, month), [year, month]);
  const today = todayKey();

  const agenda = useMemo(() => {
    const groups = new Map<string, CalendarEvent[]>();
    for (const e of events) {
      if (e.event_date < today) continue;
      const list = groups.get(e.event_date);
      if (list) list.push(e);
      else groups.set(e.event_date, [e]);
    }
    return Array.from(groups.entries());
  }, [events, today]);

  const step = (delta: number) => {
    const idx = year * 12 + month + delta;
    setYear(Math.floor(idx / 12));
    setMonth(idx % 12);
  };

  const openNew = (date: string) => setForm(emptyForm(date));

  const openEdit = (e: CalendarEvent) =>
    setForm({
      id: e.id,
      title: e.title,
      category: e.category,
      color: e.color,
      event_date: e.event_date,
      event_time: e.event_time ? e.event_time.slice(0, 5) : "",
      assigned_to: e.assigned_to,
      notes: e.notes ?? "",
      customColor: e.color !== CATEGORY_MAP[e.category]?.color,
    });

  const save = async () => {
    if (!form || !form.title.trim()) return;
    setSaving(true);
    const payload: NewEvent = {
      title: form.title.trim(),
      category: form.category,
      color: form.color,
      event_date: form.event_date,
      event_time: form.event_time ? `${form.event_time}:00` : null,
      assigned_to: form.assigned_to,
      notes: form.notes.trim() ? form.notes.trim() : null,
      completed: false,
    };
    if (form.id) {
      const { completed: _drop, ...patch } = payload;
      await updateEvent(form.id, patch);
    } else {
      await addEvent(payload);
    }
    setSaving(false);
    setForm(null);
  };

  const dayEvents = openDay ? (byDate.get(openDay) ?? []) : [];

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-xl border border-mist bg-white px-3.5 py-2 text-[13px] font-semibold text-navy transition-colors hover:border-gold"
        >
          <ArrowLeft size={15} /> Back to Overview
        </button>

        <div className="flex items-center gap-2">
          <div className="flex rounded-xl border border-mist bg-white p-1">
            {(["month", "agenda"] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setView(v)}
                className={`rounded-lg px-3 py-1.5 text-[12.5px] font-semibold capitalize transition-colors ${
                  view === v ? "bg-navy text-white" : "text-ink-soft hover:text-navy"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => openNew(today >= CALENDAR_MIN && today <= CALENDAR_MAX ? today : CALENDAR_MIN)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-gold px-3.5 py-2 text-[13px] font-bold text-white transition-opacity hover:opacity-90"
          >
            <Plus size={15} /> Add event
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border-l-4 border-l-red-500 bg-red-500/10 px-4 py-3 text-[13px] text-navy">
          {error}
        </div>
      )}

      {/* Category legend */}
      <div className="mb-5 flex flex-wrap gap-x-3.5 gap-y-2">
        {CATEGORIES.map((c) => (
          <span key={c.key} className="inline-flex items-center gap-1.5 text-[11.5px] text-ink-soft">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: c.color }} />
            {c.label}
          </span>
        ))}
      </div>

      {view === "month" ? (
        <div>
          <div className="mb-3 flex items-center justify-between">
            <button
              type="button"
              disabled={!canGoPrev(year, month)}
              onClick={() => step(-1)}
              className="rounded-lg border border-mist bg-white p-2 text-navy disabled:opacity-30"
              aria-label="Previous month"
            >
              <ChevronLeft size={17} />
            </button>
            <div className="font-display text-lg font-bold text-navy">
              {MONTH_NAMES[month]} {year}
            </div>
            <button
              type="button"
              disabled={!canGoNext(year, month)}
              onClick={() => step(1)}
              className="rounded-lg border border-mist bg-white p-2 text-navy disabled:opacity-30"
              aria-label="Next month"
            >
              <ChevronRight size={17} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {WEEKDAYS.map((w, i) => (
              <div
                key={i}
                className="pb-1 text-center text-[10.5px] font-semibold uppercase tracking-wider text-ink-soft"
              >
                {w}
              </div>
            ))}
            {cells.map((cell) => {
              const list = byDate.get(cell.key) ?? [];
              const isToday = cell.key === today;
              return (
                <button
                  key={cell.key}
                  type="button"
                  onClick={() => setOpenDay(cell.key)}
                  className={`min-h-[72px] rounded-lg border p-1 text-left align-top transition-colors sm:min-h-[92px] ${
                    cell.inMonth ? "border-mist bg-white hover:border-gold" : "border-transparent bg-mist/40"
                  } ${isToday ? "ring-2 ring-royal" : ""}`}
                >
                  <span
                    className={`block px-1 text-[11.5px] font-semibold ${
                      cell.inMonth ? "text-navy" : "text-ink-soft/50"
                    }`}
                  >
                    {cell.day}
                  </span>
                  <span className="mt-0.5 flex flex-col gap-0.5">
                    {list.slice(0, 3).map((e) => (
                      <span
                        key={e.id}
                        className={`truncate rounded px-1 py-0.5 text-[9.5px] font-semibold text-white ${
                          e.completed ? "line-through opacity-50" : ""
                        }`}
                        style={{ background: e.color }}
                      >
                        {e.title}
                      </span>
                    ))}
                    {list.length > 3 && (
                      <span className="px-1 text-[9.5px] font-semibold text-ink-soft">
                        +{list.length - 3} more
                      </span>
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {loading && <p className="text-[13.5px] text-ink-soft">Loading…</p>}
          {!loading && agenda.length === 0 && (
            <p className="text-[13.5px] text-ink-soft">
              Nothing scheduled yet. Tap “Add event” to start.
            </p>
          )}
          {agenda.map(([date, list]) => (
            <div key={date} className="rounded-xl border border-mist bg-white p-4">
              <div className="mb-2 text-[12.5px] font-bold uppercase tracking-wider text-ink-soft">
                {formatShortDay(date)}
              </div>
              <div className="space-y-2">
                {list.map((e) => (
                  <button
                    key={e.id}
                    type="button"
                    onClick={() => setOpenDay(date)}
                    className="flex w-full items-start gap-2.5 rounded-lg px-1 py-1 text-left hover:bg-mist"
                  >
                    <span
                      className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ background: e.color }}
                    />
                    <span className="min-w-0">
                      <span
                        className={`block text-[14px] font-semibold text-navy ${
                          e.completed ? "line-through opacity-50" : ""
                        }`}
                      >
                        {e.title}
                      </span>
                      <span className="block text-[12px] text-ink-soft">
                        {CATEGORY_MAP[e.category]?.label} · {assigneeLabel(e.assigned_to)}
                        {e.event_time ? ` · ${formatTime(e.event_time)}` : ""}
                      </span>
                      {e.notes && (
                        <span className="mt-0.5 block truncate text-[12px] text-ink-soft">
                          {e.notes}
                        </span>
                      )}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* DAY DRAWER */}
      {openDay && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-navy/50 p-0 sm:items-center sm:p-6">
          <div className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white p-5 shadow-xl sm:rounded-2xl">
            <div className="mb-4 flex items-start justify-between gap-3">
              <h3 className="font-display text-lg font-bold text-navy">
                {formatDayLabel(openDay)}
              </h3>
              <button
                type="button"
                onClick={() => setOpenDay(null)}
                className="rounded-lg p-1 text-ink-soft hover:bg-mist"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            {dayEvents.length === 0 && (
              <p className="text-[13.5px] text-ink-soft">No entries for this day yet.</p>
            )}

            <div className="space-y-3">
              {dayEvents.map((e) => (
                <div key={e.id} className="rounded-xl border border-mist p-3.5">
                  <div className="flex items-start gap-2.5">
                    <span
                      className="mt-1 h-3 w-3 shrink-0 rounded-full"
                      style={{ background: e.color }}
                    />
                    <div className="min-w-0 flex-1">
                      <div
                        className={`text-[14.5px] font-bold text-navy ${
                          e.completed ? "line-through opacity-50" : ""
                        }`}
                      >
                        {e.title}
                      </div>
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        <span
                          className="rounded-full px-2 py-0.5 text-[10.5px] font-semibold text-white"
                          style={{ background: e.color }}
                        >
                          {CATEGORY_MAP[e.category]?.label}
                        </span>
                        <span className="rounded-full bg-mist px-2 py-0.5 text-[10.5px] font-semibold text-navy">
                          {assigneeLabel(e.assigned_to)}
                        </span>
                        {e.event_time && (
                          <span className="rounded-full bg-mist px-2 py-0.5 text-[10.5px] font-semibold text-navy">
                            {formatTime(e.event_time)}
                          </span>
                        )}
                        {e.completed && (
                          <span className="rounded-full bg-teal px-2 py-0.5 text-[10.5px] font-semibold text-white">
                            Complete
                          </span>
                        )}
                      </div>
                      {e.notes && (
                        <p className="mt-2 whitespace-pre-wrap text-[13px] leading-relaxed text-ink-soft">
                          {e.notes}
                        </p>
                      )}
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => void toggleComplete(e.id, !e.completed)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-teal px-2.5 py-1.5 text-[12px] font-semibold text-teal hover:bg-teal/10"
                        >
                          <Check size={13} /> {e.completed ? "Mark active" : "Complete"}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setOpenDay(null);
                            openEdit(e);
                          }}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-mist px-2.5 py-1.5 text-[12px] font-semibold text-navy hover:border-gold"
                        >
                          <Pencil size={13} /> Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => void removeEvent(e.id)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-red-300 px-2.5 py-1.5 text-[12px] font-semibold text-red-600 hover:bg-red-50"
                        >
                          <Trash2 size={13} /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => {
                const d = openDay;
                setOpenDay(null);
                openNew(d);
              }}
              className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-navy px-4 py-2.5 text-[13.5px] font-bold text-white"
            >
              <Plus size={15} /> Add event on this day
            </button>
          </div>
        </div>
      )}

      {/* ADD / EDIT FORM */}
      {form && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-navy/50 p-0 sm:items-center sm:p-6">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white p-5 shadow-xl sm:rounded-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-lg font-bold text-navy">
                {form.id ? "Edit event" : "Add event"}
              </h3>
              <button
                type="button"
                onClick={() => setForm(null)}
                className="rounded-lg p-1 text-ink-soft hover:bg-mist"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <label className="mb-3 block">
              <span className="mb-1 block text-[11.5px] font-semibold uppercase tracking-wider text-ink-soft">
                Title
              </span>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Dinner date, doctor visit, venue tour…"
                className="w-full rounded-lg border border-mist px-3 py-2 text-[14px] text-ink focus:border-royal focus:outline-none focus:ring-4 focus:ring-royal/10"
              />
            </label>

            <label className="mb-3 block">
              <span className="mb-1 block text-[11.5px] font-semibold uppercase tracking-wider text-ink-soft">
                Category / Event type
              </span>
              <select
                value={form.category}
                onChange={(e) => {
                  const cat = e.target.value as CategoryKey;
                  setForm({
                    ...form,
                    category: cat,
                    color: form.customColor ? form.color : CATEGORY_MAP[cat].color,
                  });
                }}
                className="w-full rounded-lg border border-mist bg-white px-3 py-2 text-[14px] text-ink focus:border-royal focus:outline-none focus:ring-4 focus:ring-royal/10"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.key} value={c.key}>
                    {c.label}
                  </option>
                ))}
              </select>
            </label>

            <div className="mb-3">
              <span className="mb-1.5 block text-[11.5px] font-semibold uppercase tracking-wider text-ink-soft">
                Colour{" "}
                <span className="font-normal normal-case tracking-normal">
                  (defaults to category)
                </span>
              </span>
              <div className="flex flex-wrap gap-1.5">
                {PALETTE.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() =>
                      setForm({
                        ...form,
                        color: c,
                        customColor: c !== CATEGORY_MAP[form.category].color,
                      })
                    }
                    className={`h-7 w-7 rounded-full border-2 transition-transform hover:scale-110 ${
                      form.color === c ? "border-navy" : "border-transparent"
                    }`}
                    style={{ background: c }}
                    aria-label={`Colour ${c}`}
                  />
                ))}
              </div>
            </div>

            <div className="mb-3 grid grid-cols-2 gap-3">
              <label className="block">
                <span className="mb-1 block text-[11.5px] font-semibold uppercase tracking-wider text-ink-soft">
                  Date
                </span>
                <input
                  type="date"
                  min={CALENDAR_MIN}
                  max={CALENDAR_MAX}
                  value={form.event_date}
                  onChange={(e) => setForm({ ...form, event_date: e.target.value })}
                  className="w-full rounded-lg border border-mist px-3 py-2 text-[14px] text-ink focus:border-royal focus:outline-none"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-[11.5px] font-semibold uppercase tracking-wider text-ink-soft">
                  Time (optional)
                </span>
                <input
                  type="time"
                  value={form.event_time}
                  onChange={(e) => setForm({ ...form, event_time: e.target.value })}
                  className="w-full rounded-lg border border-mist px-3 py-2 text-[14px] text-ink focus:border-royal focus:outline-none"
                />
              </label>
            </div>

            <div className="mb-3">
              <span className="mb-1.5 block text-[11.5px] font-semibold uppercase tracking-wider text-ink-soft">
                Assigned to
              </span>
              <div className="flex gap-2">
                {ASSIGNEES.map((a) => (
                  <button
                    key={a.key}
                    type="button"
                    onClick={() => setForm({ ...form, assigned_to: a.key })}
                    className={`flex-1 rounded-lg border px-3 py-2 text-[13px] font-semibold transition-colors ${
                      form.assigned_to === a.key
                        ? "border-navy bg-navy text-white"
                        : "border-mist text-navy hover:border-gold"
                    }`}
                  >
                    {a.label}
                  </button>
                ))}
              </div>
            </div>

            <label className="mb-4 block">
              <span className="mb-1 block text-[11.5px] font-semibold uppercase tracking-wider text-ink-soft">
                Description / notes
              </span>
              <textarea
                rows={4}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Details, address, who's coming…"
                className="w-full resize-y rounded-lg border border-mist px-3 py-2 text-[14px] text-ink focus:border-royal focus:outline-none focus:ring-4 focus:ring-royal/10"
              />
            </label>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setForm(null)}
                className="flex-1 rounded-xl border border-mist px-4 py-2.5 text-[13.5px] font-semibold text-navy hover:border-gold"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!form.title.trim() || saving}
                onClick={() => void save()}
                className="flex-1 rounded-xl bg-gold px-4 py-2.5 text-[13.5px] font-bold text-white disabled:opacity-40"
              >
                {saving ? "Saving…" : form.id ? "Save changes" : "Add event"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
