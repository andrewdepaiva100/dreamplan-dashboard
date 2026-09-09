import { useMemo, useState } from "react";
import { currency } from "@/lib/plan-data";

type Owner = "andrew" | "maria" | "family" | "other";
type Contribution = { id: string; date: string; owner: Owner; amount: number; note?: string };
type Week = { week: number; start: string; end: string; label: string; andrew: number; maria: number; family: number; other: number; total: number };

const ANDREW_START = 6300;
const ANDREW_FAMILY = 6038;
const STORAGE_KEY = "dreamplan-savings-contributions-v1";
const OWNER_LABEL: Record<Owner, string> = { andrew: "Andrew", maria: "Maria", family: "Maria's Family", other: "Other" };

// Source entries transcribed from the supplied trackers. The original wedding tracker ends Jul 11;
// the honeymoon/apartment sheets continue the dated savings history through Sep 5, 2026.
const SOURCE: Contribution[] = [
  ["2026-03-07","andrew",675],["2026-03-07","maria",434.5],
  ["2026-03-14","andrew",600],["2026-03-14","maria",374.11],["2026-03-14","family",100],
  ["2026-03-21","andrew",100],["2026-03-21","maria",374.11],
  ["2026-03-28","andrew",1200],["2026-03-28","maria",371.9],["2026-03-28","family",1000],
  ["2026-04-04","andrew",850],["2026-04-04","maria",377.42],["2026-04-04","family",900],
  ["2026-04-11","andrew",400],["2026-04-11","maria",312],["2026-04-11","family",1000],
  ["2026-04-18","andrew",40],["2026-04-18","maria",400],
  ["2026-04-25","andrew",60],["2026-04-25","maria",374],
  ["2026-05-02","andrew",875],["2026-05-02","maria",381],["2026-05-02","family",1000],
  ["2026-05-09","andrew",830],["2026-05-09","maria",374],["2026-05-09","family",1000],
  ["2026-05-16","andrew",20],["2026-05-16","maria",374],
  ["2026-05-23","andrew",910],["2026-05-23","maria",374],
  ["2026-05-30","andrew",603],["2026-05-30","maria",374],
  ["2026-06-06","andrew",639],["2026-06-06","maria",371],["2026-06-06","family",1000],
  ["2026-06-13","andrew",10],["2026-06-13","maria",377],
  ["2026-06-20","andrew",599],["2026-06-20","maria",374],
  ["2026-06-27","andrew",10],["2026-06-27","maria",453],
  ["2026-07-04","andrew",950],["2026-07-04","maria",377],
  ["2026-07-11","andrew",300],["2026-07-11","maria",85],["2026-07-11","family",440],
  ["2026-07-18","andrew",900],["2026-07-18","maria",250],["2026-07-18","family",560],
  ["2026-08-01","andrew",450],["2026-08-01","maria",350],["2026-08-01","family",1000],
  ["2026-08-08","andrew",1120],["2026-08-08","maria",356],
  ["2026-08-15","maria",403],["2026-08-15","andrew",100],["2026-08-15","maria",275],
  ["2026-08-22","maria",316],["2026-08-22","andrew",100],["2026-08-22","maria",370],["2026-08-22","family",1000],
  ["2026-08-29","andrew",1000],["2026-08-29","maria",398],
  ["2026-09-05","andrew",135],
  ["2026-09-09","andrew",400],
].map((x, i) => ({ id: `source-${i}`, date: x[0] as string, owner: x[1] as Owner, amount: x[2] as number }));

function parseDate(s: string) { const [y,m,d]=s.split("-").map(Number); return new Date(Date.UTC(y!,m!-1,d!)); }
function iso(d: Date) { return d.toISOString().slice(0,10); }
function addDays(s: string, n: number) { const d=parseDate(s); d.setUTCDate(d.getUTCDate()+n); return iso(d); }
function fmt(s: string) { return parseDate(s).toLocaleDateString("en-US",{month:"short",day:"numeric",timeZone:"UTC"}); }
function weekEndFor(date: string) { const d=parseDate(date); const day=d.getUTCDay(); const delta=(6-day+7)%7; d.setUTCDate(d.getUTCDate()+delta); return iso(d); }
function todayIso() { return new Date().toISOString().slice(0,10); }

function loadExtras(): Contribution[] {
  if (typeof window === "undefined") return [];
  try { const v=JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]"); return Array.isArray(v) ? v : []; } catch { return []; }
}

function StatCard({label,value}:{label:string;value:number}) { return <div className="rounded-xl border border-mist bg-white/70 px-4 py-3"><div className="text-[11px] font-semibold uppercase tracking-wider text-ink-soft">{label}</div><div className="mt-1 font-display text-lg font-bold tabular-nums text-navy">{currency(value)}</div></div>; }

export function SavingsTracker() {
  const [extras,setExtras]=useState<Contribution[]>(loadExtras);
  const [date,setDate]=useState(todayIso());
  const [amount,setAmount]=useState("");
  const [owner,setOwner]=useState<Owner>("andrew");
  const [message,setMessage]=useState("");
  const contributions=useMemo(()=>[...SOURCE,...extras].sort((a,b)=>a.date.localeCompare(b.date)),[extras]);

  const weeks=useMemo(()=>{
    const firstEnd="2026-03-07";
    const lastContribution=contributions.at(-1)?.date ?? firstEnd;
    const horizon=weekEndFor(lastContribution > todayIso() ? lastContribution : todayIso());
    const result: Week[]=[]; let end=firstEnd; let running=ANDREW_START; let num=1;
    while(end<=horizon && num<80){
      const start=addDays(end,-6); const inWeek=contributions.filter(c=>c.date>=start&&c.date<=end);
      const sums=(who:Owner)=>inWeek.filter(c=>c.owner===who).reduce((s,c)=>s+c.amount,0);
      const andrew=sums("andrew"),maria=sums("maria"),family=sums("family"),other=sums("other");
      running+=andrew+maria+family+other;
      result.push({week:num,start,end,label:`${fmt(start)}–${fmt(end)}`,andrew,maria,family,other,total:running});
      end=addDays(end,7); num++;
    }
    return result;
  },[contributions]);

  const totals=useMemo(()=>({
    andrew:ANDREW_START+contributions.filter(c=>c.owner==="andrew").reduce((s,c)=>s+c.amount,0),
    maria:contributions.filter(c=>c.owner==="maria").reduce((s,c)=>s+c.amount,0),
    family:contributions.filter(c=>c.owner==="family").reduce((s,c)=>s+c.amount,0),
    other:contributions.filter(c=>c.owner==="other").reduce((s,c)=>s+c.amount,0),
  }),[contributions]);
  const running=totals.andrew+totals.maria+totals.family+totals.other;

  function addContribution(e: React.FormEvent){
    e.preventDefault(); const n=Number(amount);
    if(!date||!Number.isFinite(n)||n<=0){setMessage("Choose a date and enter an amount greater than $0.");return;}
    const item:Contribution={id:`manual-${Date.now()}`,date,owner,amount:Math.round(n*100)/100};
    const next=[...extras,item]; setExtras(next); localStorage.setItem(STORAGE_KEY,JSON.stringify(next)); setAmount(""); setMessage(`${OWNER_LABEL[owner]} — ${currency(item.amount)} added to the week containing ${fmt(date)}.`);
  }

  return <div className="space-y-6">
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
      <StatCard label="Andrew" value={totals.andrew}/><StatCard label="Maria" value={totals.maria}/><StatCard label="Maria's family" value={totals.family}/><StatCard label="Other" value={totals.other}/><StatCard label="Running total" value={running}/>
    </div>

    <form onSubmit={addContribution} className="rounded-xl border border-mist bg-white/70 p-4">
      <div className="mb-3"><h3 className="font-display text-base font-bold text-navy">Add savings</h3><p className="text-xs text-ink-soft">Pick the exact day. The contribution is placed into its weekly row automatically.</p></div>
      <div className="grid gap-3 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-end">
        <label className="text-xs font-semibold text-navy">Date<input type="date" value={date} onChange={e=>setDate(e.target.value)} className="mt-1 block min-h-11 w-full rounded-lg border border-mist bg-white px-3 text-base font-normal text-ink" required/></label>
        <label className="text-xs font-semibold text-navy">Amount<input type="number" min="0.01" step="0.01" inputMode="decimal" value={amount} onChange={e=>setAmount(e.target.value)} placeholder="$0.00" className="mt-1 block min-h-11 w-full rounded-lg border border-mist bg-white px-3 text-base font-normal text-ink" required/></label>
        <label className="text-xs font-semibold text-navy">Whose money?<select value={owner} onChange={e=>setOwner(e.target.value as Owner)} className="mt-1 block min-h-11 w-full rounded-lg border border-mist bg-white px-3 text-base font-normal text-ink"><option value="andrew">Andrew</option><option value="maria">Maria</option><option value="family">Maria's Family</option><option value="other">Other</option></select></label>
        <button type="submit" className="min-h-11 rounded-lg bg-navy px-5 text-sm font-bold text-white">Add money</button>
      </div>
      {message?<p className="mt-3 text-xs text-ink-soft" aria-live="polite">{message}</p>:null}
    </form>

    <div className="overflow-x-auto rounded-xl border border-mist">
      <table className="w-full min-w-[760px] border-collapse text-[13px]">
        <thead><tr className="bg-mist/40 text-left">{["Week","Dates","Andrew","Maria","Maria's Family","Other","Running total"].map(h=><th key={h} className="px-3 py-2 font-semibold text-navy">{h}</th>)}</tr></thead>
        <tbody>
          <tr className="bg-gold/10"><td className="px-3 py-2">Start</td><td className="px-3 py-2 text-ink-soft">Mar 1</td><td className="px-3 py-2">{currency(ANDREW_START)}</td><td>—</td><td>—</td><td>—</td><td className="px-3 py-2 font-semibold">{currency(ANDREW_START)}</td></tr>
          {weeks.map(w=><tr key={w.week} className="border-t border-mist/70"><td className="px-3 py-2 text-ink-soft">{w.week}</td><td className="px-3 py-2 whitespace-nowrap text-ink-soft">{w.label}</td><td className="px-3 py-2 tabular-nums">{w.andrew?currency(w.andrew):"—"}</td><td className="px-3 py-2 tabular-nums">{w.maria?currency(w.maria):"—"}</td><td className="px-3 py-2 tabular-nums">{w.family?currency(w.family):"—"}</td><td className="px-3 py-2 tabular-nums">{w.other?currency(w.other):"—"}</td><td className="px-3 py-2 font-semibold tabular-nums text-navy">{currency(w.total)}</td></tr>)}
        </tbody>
      </table>
    </div>
    <p className="text-[11px] text-ink-soft">Historical entries through Jul 11 come from the original tracker. Later entries are transcribed from the honeymoon and apartment sheets you provided. New entries are saved in this browser.</p>
  </div>;
}
