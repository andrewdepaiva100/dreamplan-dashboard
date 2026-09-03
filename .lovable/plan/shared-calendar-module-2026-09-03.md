# Shared Calendar Module

A new "Shared Calendar" button on the dashboard hub opens a full calendar where you and Maria log dates, hangouts, church, family, vacation, medical, individual events, and wedding planning — synced live between both phones.

## What you'll get

**Navigation**
- New "Shared Calendar" card in the main dashboard button grid, matching the existing button style, rendered as a section inside the single-page hub (with Back to Overview, like Devotionals).

**Month view**
- Mobile-optimized month grid with prev/next month navigation, spanning any month from today through December 31, 2027 (navigation clamped so you can't wander past that end date).
- Each day cell shows up to 3 color-coded chips (title + category color) plus a "+N more" indicator.
- Today is highlighted; completed events show with a strikethrough/dimmed chip.

**Agenda view**
- Toggle between Month and Agenda. Agenda lists upcoming events grouped by date, each with color badge, time, assigned tag, and notes preview.

**Day detail drawer**
- Tapping a date opens a drawer listing every event that day with color badge, assigned-to tag, time, and notes, plus per-event Edit, Delete, and Mark as Complete buttons, and an "Add event" button for that date.

**Add / Edit event form**
- Title (free text)
- Category dropdown with 8 options and automatic default colors:
  Dates (rose/pink), Hangouts (teal/cyan), Church (gold/amber), Family (emerald), Vacation (sky blue), Medical (crimson), Individual Event (indigo/violet), Wedding Planning (deep purple)
- Custom color swatch picker to override the category default
- Date (limited to today through Dec 31, 2027) and optional time
- Assigned To: Andrew / Maria / Both
- Description / notes free-text field

**Live sync**
- Everything is stored in the cloud and pushed to both phones instantly over a realtime subscription — no refresh needed. Adds, edits, deletes, and completion toggles all propagate.

## Technical details

**Database migration** — new `public.calendar_events` table:
- `id uuid pk`, `title text not null`, `category text not null`, `color text not null`, `event_date date not null`, `event_time time null`, `assigned_to text not null default 'both'`, `notes text`, `completed boolean not null default false`, `created_at`/`updated_at` timestamptz with an update trigger.
- CHECK constraints on `category` (the 8 keys) and `assigned_to` (`andrew`/`maria`/`both`).
- `GRANT SELECT, INSERT, UPDATE, DELETE` to `anon` and `authenticated`; `GRANT ALL` to `service_role`.
- RLS enabled with shared permissive policies (`USING (true) WITH CHECK (true)`) for anon + authenticated — matching the existing `plan_state` / `chat_threads` model, since the whole app is behind the shared password gate rather than per-user Supabase auth.
- `ALTER PUBLICATION supabase_realtime ADD TABLE public.calendar_events;` with `REPLICA IDENTITY FULL`, and an index on `event_date`.

**New files**
- `src/lib/calendar-data.ts` — category keys, labels, default color tokens, custom palette, `CalendarEvent` type, date helpers (month grid generation, range clamp to 2027-12-31, formatting).
- `src/lib/use-calendar.ts` — loads events via the browser Supabase client, exposes `addEvent`, `updateEvent`, `removeEvent`, `toggleComplete`, and a `postgres_changes` subscription in `useEffect` with channel teardown on unmount; optimistic local updates so taps feel instant.
- `src/components/plan/calendar.tsx` — the section component: view toggle, month grid, agenda list, day drawer, and the add/edit form modal.

**Edited file**
- `src/routes/index.tsx` — add the `calendar` entry to `SECTION_LINKS` (CalendarRange icon, sky tint) and render `<SharedCalendar onBack={() => goTo(null)} />` when active, following the Devotionals pattern (metric strip stays visible; scripture banner remains overview-only).

Styling uses existing design tokens (navy/royal/gold/teal/sky) plus new category color tokens added to `src/styles.css`; no hardcoded hex in components.
