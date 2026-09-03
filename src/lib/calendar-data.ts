export type CategoryKey =
  | "dates"
  | "hangouts"
  | "church"
  | "family"
  | "vacation"
  | "medical"
  | "individual"
  | "wedding";

export type AssignedTo = "andrew" | "maria" | "both";

export type CalendarEvent = {
  id: string;
  title: string;
  category: CategoryKey;
  color: string;
  event_date: string; // YYYY-MM-DD
  event_time: string | null; // HH:MM(:SS)
  assigned_to: AssignedTo;
  notes: string | null;
  completed: boolean;
  created_at?: string;
  updated_at?: string;
};

export const CATEGORIES: {
  key: CategoryKey;
  label: string;
  color: string;
}[] = [
  { key: "dates", label: "Dates", color: "#E11D6F" },
  { key: "hangouts", label: "Hangouts", color: "#0E9AA7" },
  { key: "church", label: "Church", color: "#C9A24B" },
  { key: "family", label: "Family", color: "#1F8A70" },
  { key: "vacation", label: "Vacation", color: "#3B82F6" },
  { key: "medical", label: "Medical", color: "#DC2626" },
  { key: "individual", label: "Individual Event", color: "#6366F1" },
  { key: "wedding", label: "Wedding Planning", color: "#7C3AED" },
];

export const CATEGORY_MAP: Record<CategoryKey, { label: string; color: string }> =
  Object.fromEntries(
    CATEGORIES.map((c) => [c.key, { label: c.label, color: c.color }]),
  ) as Record<CategoryKey, { label: string; color: string }>;

/** Extra swatches for manual colour overrides. */
export const PALETTE = [
  "#E11D6F",
  "#F472B6",
  "#0E9AA7",
  "#14B8A6",
  "#C9A24B",
  "#F59E0B",
  "#1F8A70",
  "#22C55E",
  "#3B82F6",
  "#0EA5E9",
  "#DC2626",
  "#F97316",
  "#6366F1",
  "#7C3AED",
  "#0B1E3D",
  "#64748B",
];

export const ASSIGNEES: { key: AssignedTo; label: string }[] = [
  { key: "andrew", label: "Andrew" },
  { key: "maria", label: "Maria" },
  { key: "both", label: "Both" },
];

export const CALENDAR_MIN = "2026-01-01";
export const CALENDAR_MAX = "2027-12-31";

const pad = (n: number) => String(n).padStart(2, "0");

export const toKey = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export const todayKey = () => toKey(new Date());

export const parseKey = (key: string) => {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y ?? 2026, (m ?? 1) - 1, d ?? 1);
};

export const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

/** Month bounds (inclusive) that navigation is clamped to. */
export const MIN_MONTH = { year: 2026, month: 0 };
export const MAX_MONTH = { year: 2027, month: 11 };

export const monthIndex = (year: number, month: number) => year * 12 + month;

export const canGoPrev = (year: number, month: number) =>
  monthIndex(year, month) > monthIndex(MIN_MONTH.year, MIN_MONTH.month);

export const canGoNext = (year: number, month: number) =>
  monthIndex(year, month) < monthIndex(MAX_MONTH.year, MAX_MONTH.month);

/** 6x7 grid of date keys covering the given month, padded with adjacent days. */
export function monthGrid(year: number, month: number) {
  const first = new Date(year, month, 1);
  const start = new Date(year, month, 1 - first.getDay());
  const cells: { key: string; inMonth: boolean; day: number }[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
    cells.push({ key: toKey(d), inMonth: d.getMonth() === month, day: d.getDate() });
  }
  return cells;
}

export function formatDayLabel(key: string) {
  const d = parseKey(key);
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function formatShortDay(key: string) {
  const d = parseKey(key);
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function formatTime(time: string | null) {
  if (!time) return "";
  const [rawH, m] = time.split(":").map(Number);
  const h = rawH ?? NaN;
  if (!Number.isFinite(h)) return "";
  const ampm = h >= 12 ? "PM" : "AM";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${pad(m || 0)} ${ampm}`;
}

export function sortEvents(a: CalendarEvent, b: CalendarEvent) {
  if (a.event_date !== b.event_date) return a.event_date < b.event_date ? -1 : 1;
  const at = a.event_time ?? "99:99";
  const bt = b.event_time ?? "99:99";
  if (at !== bt) return at < bt ? -1 : 1;
  return a.title.localeCompare(b.title);
}
