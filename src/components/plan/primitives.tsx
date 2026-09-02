import { useEffect, useState } from "react";
import { currency } from "@/lib/plan-data";

export function MoneyInput({
  value,
  onCommit,
  align = "right",
}: {
  value: number;
  onCommit: (n: number) => void;
  align?: "right" | "center";
}) {
  const [draft, setDraft] = useState(currency(value));
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused) setDraft(currency(value));
  }, [value, focused]);

  return (
    <input
      inputMode="decimal"
      className={`w-full rounded-lg border border-transparent bg-transparent px-2 py-1.5 font-semibold tabular-nums text-navy underline decoration-dotted decoration-ink/25 underline-offset-4 transition-colors hover:bg-mist hover:decoration-royal focus:border-royal focus:bg-white focus:no-underline focus:outline-none focus:ring-4 focus:ring-royal/10 ${
        align === "center" ? "text-center" : "text-right"
      }`}
      value={draft}
      onFocus={(e) => {
        setFocused(true);
        setDraft(String(value));
        requestAnimationFrame(() => e.target.select());
      }}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={() => {
        setFocused(false);
        const n = parseFloat(draft.replace(/[^0-9.-]/g, ""));
        const next = Number.isFinite(n) ? n : value;
        setDraft(currency(next));
        onCommit(next);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") (e.target as HTMLInputElement).blur();
      }}
    />
  );
}

export function TextInput({
  value,
  onCommit,
  className = "",
}: {
  value: string;
  onCommit: (v: string) => void;
  className?: string;
}) {
  const [draft, setDraft] = useState(value);
  useEffect(() => setDraft(value), [value]);
  return (
    <input
      className={`rounded-lg border border-transparent bg-transparent px-2 py-1 text-ink transition-colors hover:bg-mist focus:border-royal focus:bg-white focus:outline-none focus:ring-4 focus:ring-royal/10 ${className}`}
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={() => onCommit(draft)}
      onKeyDown={(e) => {
        if (e.key === "Enter") (e.target as HTMLInputElement).blur();
      }}
    />
  );
}

export function DateInput({
  value,
  onCommit,
  tone = "light",
}: {
  value: string;
  onCommit: (v: string) => void;
  tone?: "light" | "dark";
}) {
  return (
    <input
      type="date"
      value={value}
      onChange={(e) => onCommit(e.target.value)}
      className={
        tone === "dark"
          ? "rounded-lg border border-white/25 bg-white/10 px-3 py-1.5 text-sm font-semibold text-white focus:outline-none focus:ring-4 focus:ring-sky/30 [color-scheme:dark]"
          : "rounded-lg border border-transparent bg-transparent px-2 py-1 text-sm font-semibold text-navy transition-colors hover:bg-mist focus:border-royal focus:bg-white focus:outline-none focus:ring-4 focus:ring-royal/10"
      }
    />
  );
}

export function Page({
  title,
  children,
  id,
}: {
  title: string;
  id?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className="card-surface mt-7 scroll-mt-24 rounded-[18px] px-6 py-9 sm:px-11"
    >
      <h2 className="mb-6 flex items-center gap-3 font-display text-2xl font-bold text-navy">
        <span className="inline-block h-6 w-1 rounded-full bg-gold" />
        {title}
      </h2>
      {children}
    </section>
  );
}

export function Th({
  children,
  num,
}: {
  children: React.ReactNode;
  num?: boolean;
}) {
  return (
    <th
      className={`border-b-2 border-mist px-1.5 py-2 text-[11px] font-semibold uppercase tracking-wider text-ink-soft ${
        num ? "text-right" : "text-left"
      }`}
    >
      {children}
    </th>
  );
}

export function Td({
  children,
  num,
  className = "",
}: {
  children: React.ReactNode;
  num?: boolean;
  className?: string;
}) {
  return (
    <td
      className={`border-b border-mist px-1.5 py-2 text-[14.5px] text-ink ${
        num ? "text-right" : "text-left"
      } ${className}`}
    >
      {children}
    </td>
  );
}

export function TotalRow({
  label,
  values,
}: {
  label: string;
  values: React.ReactNode[];
}) {
  return (
    <tr className="border-t-2 border-royal bg-mist font-bold text-navy">
      <td className="px-3 py-2.5 text-[14.5px]">{label}</td>
      {values.map((v, i) => (
        <td key={i} className="px-3 py-2.5 text-right text-[14.5px]">
          {v}
        </td>
      ))}
    </tr>
  );
}

export function Callout({
  title,
  children,
  tone = "teal",
}: {
  title: string;
  children: React.ReactNode;
  tone?: "teal" | "gold";
}) {
  return (
    <div
      className={`mt-5 rounded-2xl border-l-4 p-5 ${
        tone === "gold"
          ? "border-l-gold bg-gold/10"
          : "border-l-teal bg-teal/10"
      }`}
    >
      <div className="mb-1 text-[14.5px] font-bold text-navy">{title}</div>
      <div className="text-[13.8px] leading-relaxed text-ink-soft">{children}</div>
    </div>
  );
}
