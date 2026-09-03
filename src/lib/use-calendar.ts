import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  CALENDAR_MAX,
  CALENDAR_MIN,
  sortEvents,
  type CalendarEvent,
} from "@/lib/calendar-data";
import { notifyPartner } from "@/lib/push-client";

export type NewEvent = Omit<CalendarEvent, "id" | "created_at" | "updated_at">;

export function useCalendar() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const { data, error: err } = await supabase
      .from("calendar_events")
      .select("*")
      .gte("event_date", CALENDAR_MIN)
      .lte("event_date", CALENDAR_MAX)
      .order("event_date", { ascending: true });
    if (err) {
      setError(err.message);
    } else {
      setError(null);
      setEvents(((data ?? []) as CalendarEvent[]).slice().sort(sortEvents));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  // Realtime: any add/edit/delete on either phone lands here instantly.
  useEffect(() => {
    const channel = supabase
      .channel("calendar_events_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "calendar_events" },
        (payload) => {
          setEvents((prev) => {
            let next = prev;
            if (payload.eventType === "DELETE") {
              const old = payload.old as Partial<CalendarEvent>;
              next = prev.filter((e) => e.id !== old.id);
            } else {
              const row = payload.new as CalendarEvent;
              if (!row?.id) return prev;
              next = prev.some((e) => e.id === row.id)
                ? prev.map((e) => (e.id === row.id ? row : e))
                : [...prev, row];
            }
            return next.slice().sort(sortEvents);
          });
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

  const addEvent = useCallback(async (input: NewEvent) => {
    notifyPartner("calendar", `New event: ${input.title} on ${input.event_date}`, "/");
    const { data, error: err } = await supabase
      .from("calendar_events")
      .insert(input)
      .select("*")
      .single();
    if (err) {
      setError(err.message);
      return null;
    }
    const row = data as CalendarEvent;
    setEvents((prev) =>
      (prev.some((e) => e.id === row.id) ? prev : [...prev, row]).slice().sort(sortEvents),
    );
    return row;
  }, []);

  const updateEvent = useCallback(
    async (id: string, patch: Partial<NewEvent>) => {
      notifyPartner("calendar", "A calendar event was updated");
      setEvents((prev) =>
        prev
          .map((e) => (e.id === id ? { ...e, ...patch } : e))
          .slice()
          .sort(sortEvents),
      );
      const { error: err } = await supabase
        .from("calendar_events")
        .update(patch)
        .eq("id", id);
      if (err) {
        setError(err.message);
        void load();
      }
    },
    [load],
  );

  const removeEvent = useCallback(
    async (id: string) => {
      notifyPartner("calendar", "A calendar event was deleted");
      setEvents((prev) => prev.filter((e) => e.id !== id));
      const { error: err } = await supabase.from("calendar_events").delete().eq("id", id);
      if (err) {
        setError(err.message);
        void load();
      }
    },
    [load],
  );

  const toggleComplete = useCallback(
    async (id: string, completed: boolean) => updateEvent(id, { completed }),
    [updateEvent],
  );

  const byDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const e of events) {
      const list = map.get(e.event_date);
      if (list) list.push(e);
      else map.set(e.event_date, [e]);
    }
    return map;
  }, [events]);

  return {
    events,
    byDate,
    loading,
    error,
    addEvent,
    updateEvent,
    removeEvent,
    toggleComplete,
    reload: load,
  };
}
