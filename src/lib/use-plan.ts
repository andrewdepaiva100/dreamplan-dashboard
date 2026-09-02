import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DEFAULT_PLAN, STORAGE_KEY, type PlanState } from "./plan-data";

const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v)) as T;

const uid = () => Math.random().toString(36).slice(2, 10);

const ROW_ID = "shared";

type Person = PlanState["devotionals"]["people"]["andrew"];

// Bumped when the devotional bank is rebuilt; old entry IDs no longer map to
// the same readings, so stored history is cleared once.
const BANK_VERSION = "bsb-1500";

// Handles both the new per-person shape and the older shared-entry shape.
function migrateDevotionals(raw: any): PlanState["devotionals"] {
  const empty = (): Person => ({ current: null, days: {} });
  // Older app builds accidentally omitted `bank` when saving devotional
  // changes. Keep valid per-person data from those payloads instead of
  // treating every realtime echo as a bank migration and closing the view.
  if (raw?.people?.andrew && raw?.people?.maria) {
    return {
      bank: BANK_VERSION,
      people: {
        andrew: { current: raw.people.andrew.current ?? null, days: raw.people.andrew.days ?? {} },
        maria: { current: raw.people.maria.current ?? null, days: raw.people.maria.days ?? {} },
      },
    };
  }
  if (raw?.bank !== BANK_VERSION) {
    return { bank: BANK_VERSION, people: { andrew: empty(), maria: empty() } };
  }
  const andrew = empty();
  const maria = empty();
  const days = raw?.days ?? {};
  for (const [dateKey, d] of Object.entries<any>(days)) {
    andrew.days[dateKey] = { entryId: d.entryId, note: d.andrew ?? "", at: d.at ?? Date.now() };
    maria.days[dateKey] = { entryId: d.entryId, note: d.maria ?? "", at: d.at ?? Date.now() };
  }
  const cur = raw?.current?.date ?? null;
  andrew.current = cur;
  maria.current = cur;
  return { bank: BANK_VERSION, people: { andrew, maria } };
}


const merge = (parsed: Partial<PlanState>): PlanState => ({
  ...clone(DEFAULT_PLAN),
  ...parsed,
  budget: { ...DEFAULT_PLAN.budget, ...parsed.budget },
  funds: { ...DEFAULT_PLAN.funds, ...parsed.funds },
  monthly: { ...DEFAULT_PLAN.monthly, ...parsed.monthly },
  lease: { ...DEFAULT_PLAN.lease, ...parsed.lease },
  milestones: { ...DEFAULT_PLAN.milestones, ...parsed.milestones },
  emergency: { ...DEFAULT_PLAN.emergency, ...parsed.emergency },
  furnishing: parsed.furnishing?.length ? parsed.furnishing : clone(DEFAULT_PLAN.furnishing),
  payments: parsed.payments?.length ? parsed.payments : clone(DEFAULT_PLAN.payments),
  expenses: parsed.expenses ?? [],
  devotionals: migrateDevotionals(parsed.devotionals),
  log: parsed.log ?? [],


  comments: parsed.comments ?? [],
});

export function usePlan() {
  const [plan, setPlan] = useState<PlanState>(DEFAULT_PLAN);
  const [hydrated, setHydrated] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [online, setOnline] = useState(false);
  const skipSave = useRef(true);
  const lastSynced = useRef<string>("");
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const devotionalWritePendingUntil = useRef(0);

  // Initial load: shared cloud record wins, local cache is the offline fallback.
  useEffect(() => {
    let cancelled = false;

    const applyLocalFallback = () => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) setPlan(merge(JSON.parse(raw) as Partial<PlanState>));
      } catch {
        /* ignore corrupt storage */
      }
    };

    (async () => {
      const { data, error } = await supabase
        .from("plan_state")
        .select("state")
        .eq("id", ROW_ID)
        .maybeSingle();

      if (cancelled) return;

      if (error) {
        applyLocalFallback();
      } else if (data?.state) {
        const next = merge(data.state as Partial<PlanState>);
        lastSynced.current = JSON.stringify(next);
        setPlan(next);
        setOnline(true);
      } else {
        // First device to open the plan seeds the shared record.
        let seed = clone(DEFAULT_PLAN);
        try {
          const raw = localStorage.getItem(STORAGE_KEY);
          if (raw) seed = merge(JSON.parse(raw) as Partial<PlanState>);
        } catch {
          /* ignore corrupt storage */
        }
        lastSynced.current = JSON.stringify(seed);
        await supabase.from("plan_state").insert({ id: ROW_ID, state: seed });
        if (cancelled) return;
        setPlan(seed);
        setOnline(true);
      }
      setHydrated(true);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // Live updates from other devices.
  useEffect(() => {
    const channel = supabase
      .channel("plan_state_sync")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "plan_state", filter: `id=eq.${ROW_ID}` },
        (payload) => {
          const incoming = (payload.new as { state?: Partial<PlanState> } | null)?.state;
          if (!incoming) return;
          // A delayed realtime event can arrive between a local devotional tap
          // and its debounced save. Do not let that older snapshot undo the tap.
          if (Date.now() < devotionalWritePendingUntil.current) return;
          const serialized = JSON.stringify(merge(incoming));
          if (serialized === lastSynced.current) return; // our own echo
          lastSynced.current = serialized;
          setPlan(JSON.parse(serialized) as PlanState);
          setSavedAt(Date.now());
        },
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") setOnline(true);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Persist locally + push to the shared record (debounced).
  useEffect(() => {
    if (!hydrated) return;
    if (skipSave.current) {
      skipSave.current = false;
      return;
    }

    const serialized = JSON.stringify(plan);
    try {
      localStorage.setItem(STORAGE_KEY, serialized);
    } catch {
      /* storage full or unavailable */
    }

    if (serialized === lastSynced.current) return;

    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      lastSynced.current = serialized;
      const { error } = await supabase
        .from("plan_state")
        .upsert({ id: ROW_ID, state: plan, updated_at: new Date().toISOString() });
      if (error) {
        lastSynced.current = "";
        setOnline(false);
        return;
      }
      setOnline(true);
      setSavedAt(Date.now());
    }, 400);

    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [plan, hydrated]);

  const logChange = useCallback(
    (label: string, from: string, to: string) =>
      setPlan((p) => ({
        ...p,
        log: [{ id: uid(), label, from, to, at: Date.now() }, ...p.log].slice(0, 100),
      })),
    [],
  );

  const setField = useCallback(
    <S extends keyof PlanState, K extends keyof PlanState[S]>(
      section: S,
      key: K,
      value: PlanState[S][K],
      label: string,
      format: (v: unknown) => string = (v) => String(v),
    ) => {
      setPlan((p) => {
        const current = (p[section] as Record<string, unknown>)[key as string];
        if (current === value) return p;
        return {
          ...p,
          [section]: { ...(p[section] as object), [key]: value },
          log: [
            {
              id: uid(),
              label,
              from: format(current),
              to: format(value),
              at: Date.now(),
            },
            ...p.log,
          ].slice(0, 100),
        };
      });
    },
    [],
  );

  const setFurnishing = useCallback(
    (key: string, field: "conservative" | "mid", value: number, format: (v: number) => string) => {
      setPlan((p) => {
        const row = p.furnishing.find((r) => r.key === key);
        if (!row || row[field] === value) return p;
        return {
          ...p,
          furnishing: p.furnishing.map((r) =>
            r.key === key ? { ...r, [field]: value } : r,
          ),
          log: [
            {
              id: uid(),
              label: `${row.room} — ${field === "mid" ? "Mid-Range" : "Conservative"}`,
              from: format(row[field]),
              to: format(value),
              at: Date.now(),
            },
            ...p.log,
          ].slice(0, 100),
        };
      });
    },
    [],
  );

  const setPaymentField = useCallback(
    (
      key: string,
      field: "date" | "amount",
      value: string | number,
      format: (v: unknown) => string = (v) => String(v),
    ) => {
      setPlan((p) => {
        const row = p.payments.find((r) => r.key === key);
        if (!row || row[field] === value) return p;
        return {
          ...p,
          payments: p.payments.map((r) =>
            r.key === key ? { ...r, [field]: value } : r,
          ),
          log: [
            {
              id: uid(),
              label: `${row.label} — ${field === "amount" ? "Amount" : "Date"}`,
              from: format(row[field]),
              to: format(value),
              at: Date.now(),
            },
            ...p.log,
          ].slice(0, 100),
        };
      });
    },
    [],
  );

  const togglePayment = useCallback((key: string) => {
    setPlan((p) => {
      const row = p.payments.find((r) => r.key === key);
      if (!row) return p;
      const paid = !row.paid;
      return {
        ...p,
        payments: p.payments.map((r) => (r.key === key ? { ...r, paid } : r)),
        log: [
          {
            id: uid(),
            label: `${row.label} (${row.date})`,
            from: row.paid ? "Paid" : "Unpaid",
            to: paid ? "Paid" : "Unpaid",
            at: Date.now(),
          },
          ...p.log,
        ].slice(0, 100),
      };
    });
  }, []);

  const addExpense = useCallback(
    (e: {
      date: string;
      label: string;
      category: PlanState["expenses"][number]["category"];
      payer: string;
      amount: number;
    }) => {
      setPlan((p) => ({
        ...p,
        expenses: [{ id: uid(), ...e }, ...p.expenses].slice(0, 500),
        log: [
          {
            id: uid(),
            label: `Expense added — ${e.label}`,
            from: e.payer,
            to: e.amount.toLocaleString("en-US", { style: "currency", currency: "USD" }),
            at: Date.now(),
          },
          ...p.log,
        ].slice(0, 100),
      }));
    },
    [],
  );

  const removeExpense = useCallback((id: string) => {
    setPlan((p) => {
      const row = p.expenses.find((e) => e.id === id);
      if (!row) return p;
      return {
        ...p,
        expenses: p.expenses.filter((e) => e.id !== id),
        log: [
          {
            id: uid(),
            label: `Expense removed — ${row.label}`,
            from: row.amount.toLocaleString("en-US", { style: "currency", currency: "USD" }),
            to: "deleted",
            at: Date.now(),
          },
          ...p.log,
        ].slice(0, 100),
      };
    });
  }, []);

  const addComment = useCallback((author: string, text: string) => {

    setPlan((p) => ({
      ...p,
      comments: [
        { id: uid(), author: author || "Andrew", text, at: Date.now() },
        ...p.comments,
      ],
    }));
  }, []);

  const openDevotional = useCallback(
    (who: "andrew" | "maria", dateKey: string, entryId: number, label: string) => {
      devotionalWritePendingUntil.current = Date.now() + 1_500;
      setPlan((p) => {
        const person = p.devotionals.people[who];
        const existing = person.days[dateKey];
        const day = existing
          ? { ...existing, entryId }
          : { entryId, note: "", at: Date.now() };
        const changed = !existing || existing.entryId !== entryId;
        const name = who === "andrew" ? "Andrew" : "Maria";
        return {
          ...p,
          devotionals: {
            ...p.devotionals,
            people: {
              ...p.devotionals.people,
              [who]: { current: dateKey, days: { ...person.days, [dateKey]: day } },
            },
          },
          log: changed
            ? [
                { id: uid(), label: `${name}'s devotional — ${dateKey}`, from: "—", to: label, at: Date.now() },
                ...p.log,
              ].slice(0, 100)
            : p.log,
        };
      });
    },
    [],
  );

  const setDevotionalNote = useCallback(
    (who: "andrew" | "maria", dateKey: string, text: string) => {
      devotionalWritePendingUntil.current = Date.now() + 1_500;
      setPlan((p) => {
        const person = p.devotionals.people[who];
        const day = person.days[dateKey];
        if (!day || day.note === text) return p;
        return {
          ...p,
          devotionals: {
            ...p.devotionals,
            people: {
              ...p.devotionals.people,
              [who]: { ...person, days: { ...person.days, [dateKey]: { ...day, note: text } } },
            },
          },
        };
      });
    },
    [],
  );

  const selectDevotionalDay = useCallback((who: "andrew" | "maria", dateKey: string) => {
    devotionalWritePendingUntil.current = Date.now() + 1_500;
    setPlan((p) => {
      const person = p.devotionals.people[who];
      if (!person.days[dateKey]) return p;
      return {
        ...p,
        devotionals: {
          ...p.devotionals,
          people: { ...p.devotionals.people, [who]: { ...person, current: dateKey } },
        },
      };
    });
  }, []);


  const reset = useCallback(() => {
    setPlan({
      ...clone(DEFAULT_PLAN),
      log: [
        {
          id: uid(),
          label: "Plan reset",
          from: "edited values",
          to: "original numbers",
          at: Date.now(),
        },
      ],
      comments: [],
    });
  }, []);

  return {
    plan,
    hydrated,
    savedAt,
    online,
    setField,
    setFurnishing,
    setPaymentField,
    togglePayment,
    addExpense,
    removeExpense,
    addComment,
    openDevotional,
    setDevotionalNote,
    selectDevotionalDay,


    logChange,
    reset,
  };
}
