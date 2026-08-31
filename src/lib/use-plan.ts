import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DEFAULT_PLAN, STORAGE_KEY, type PlanState } from "./plan-data";

const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v)) as T;

const uid = () => Math.random().toString(36).slice(2, 10);

const ROW_ID = "shared";

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

  const addComment = useCallback((author: string, text: string) => {
    setPlan((p) => ({
      ...p,
      comments: [
        { id: uid(), author: author || "Andrew", text, at: Date.now() },
        ...p.comments,
      ],
    }));
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
    addComment,
    logChange,
    reset,
  };
}
