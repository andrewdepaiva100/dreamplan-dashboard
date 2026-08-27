import { useCallback, useEffect, useRef, useState } from "react";
import { DEFAULT_PLAN, STORAGE_KEY, type PlanState } from "./plan-data";

const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v)) as T;

const uid = () => Math.random().toString(36).slice(2, 10);

export function usePlan() {
  const [plan, setPlan] = useState<PlanState>(DEFAULT_PLAN);
  const [hydrated, setHydrated] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const skipSave = useRef(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<PlanState>;
        setPlan({
          ...clone(DEFAULT_PLAN),
          ...parsed,
          budget: { ...DEFAULT_PLAN.budget, ...parsed.budget },
          funds: { ...DEFAULT_PLAN.funds, ...parsed.funds },
          monthly: { ...DEFAULT_PLAN.monthly, ...parsed.monthly },
          lease: { ...DEFAULT_PLAN.lease, ...parsed.lease },
          milestones: { ...DEFAULT_PLAN.milestones, ...parsed.milestones },
          emergency: { ...DEFAULT_PLAN.emergency, ...parsed.emergency },
          furnishing: parsed.furnishing?.length
            ? parsed.furnishing
            : clone(DEFAULT_PLAN.furnishing),
          log: parsed.log ?? [],
          comments: parsed.comments ?? [],
        });
      }
    } catch {
      /* ignore corrupt storage */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (skipSave.current) {
      skipSave.current = false;
      return;
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(plan));
      setSavedAt(Date.now());
    } catch {
      /* storage full or unavailable */
    }
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
    setField,
    setFurnishing,
    addComment,
    logChange,
    reset,
  };
}
