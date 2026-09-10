import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Plus, Save, Trash2, X } from "lucide-react";
import { isUnlocked } from "@/lib/gate.functions";

type Guest = { id: string; number: number; name: string };
type GuestSection = { title: string; guests: Guest[] };
type PersonBlock = { title: string; sections: GuestSection[] };
type AddBucket = "Andrew" | "Maria" | "Andrew Parents" | "Groomsmen";

const initialBlocks: PersonBlock[] = [
  {
    title: "ANDREW",
    sections: [
      {
        title: "Family",
        guests: [
          [1, "Tia Gigi"], [2, "Belinha"], [3, "Enzo"], [4, "Tio Edi"], [5, "Tia Neia"],
          [6, "Deborah 💩"], [7, "Frankie 💩"], [8, "Kaia"], [9, "Ruth"], [10, "Alcir"],
          [11, "Camila"], [12, "Vovó"], [13, "Vovô"], [14, "Tia Cris"], [15, "Tiffany"],
          [16, "Don"], [17, "Vick"], [18, "Brooke"], [19, "Reggie"], [20, "Keisee"], [21, "Reginaldo"],
        ].map(([number, name], i) => ({ id: `andrew-family-${i}`, number: number as number, name: name as string })),
      },
      {
        title: "Immediate Family",
        guests: [[21, "Mom"], [22, "Dad"], [23, "Andressa"], [24, "Joshua"]].map(([number, name], i) => ({ id: `andrew-immediate-${i}`, number: number as number, name: name as string })),
      },
      {
        title: "Friends",
        guests: [
          [25, "Bryan"], [26, "Vic"], [27, "Nate"], [28, "Junior"], [29, "Rebecca"], [30, "Isaac"],
          [31, "Joseph"], [32, "Italo"], [33, "Andre"], [34, "Kleber"], [35, "Irmã Antonesia"], [36, "Raquel"],
          [37, "Nicholas"], [38, "Isaac (London)"], [39, "Manuel"], [40, "Vic’s Mom"], [41, "Nicole"],
        ].map(([number, name], i) => ({ id: `andrew-friends-${i}`, number: number as number, name: name as string })),
      },
      {
        title: "Parents / Extended Family",
        guests: [[43, "Tio Robison"], [44, "Tia Sol"], [45, "Tia Susanne"], [46, "Tio Eber"]].map(([number, name], i) => ({ id: `andrew-extended-${i}`, number: number as number, name: name as string })),
      },
      {
        title: "Groomsmen",
        guests: [[47, "Gianluca"], [48, "Gabe"], [49, "Phill"]].map(([number, name], i) => ({ id: `andrew-groomsmen-${i}`, number: number as number, name: name as string })),
      },
    ],
  },
  {
    title: "MARIA",
    sections: [
      {
        title: "Family",
        guests: [
          [50, "Pedrinho"], [51, "Mom"], [52, "Dad"], [53, "Guilherme"], [54, "Tavinho"], [55, "Giovanna"],
          [56, "Thayna"], [57, "Taciana"], [58, "Malu"], [59, "Bruninho"], [60, "Eneida"], [61, "Claudia"],
          [62, "Daminhão"], [63, "Monica ❌"], [64, "Júnior ❌"],
        ].map(([number, name], i) => ({ id: `maria-family-${i}`, number: number as number, name: name as string })),
      },
      {
        title: "Friends",
        guests: [
          [65, "Lorena"], [66, "Alicia 🥀"], [67, "Santinho"], [68, "Dileane"], [69, "Charles 🥀"], [70, "Geni"],
          [71, "Eli"], [72, "Gino"], [73, "Hélibi"], [74, "Junior"], [75, "Samuel"], [76, "Arthur"],
          [77, "Larissa Lawyer"], [78, "Larissa Husband"],
        ].map(([number, name], i) => ({ id: `maria-friends-${i}`, number: number as number, name: name as string })),
      },
    ],
  },
  {
    title: "ANDREW PARENTS’ INVITATIONS",
    sections: [
      {
        title: "",
        guests: [
          [77, "Quesia (…)"], [78, "Guigui (…)"], [79, "Tia Erica"], [80, "Josivan"], [81, "Gabriella"], [82, "Ben"],
          [83, "Noiva do Benjamin"], [84, "Silmo"], [85, "Sirley"], [86, "Isabel"], [87, "Adecio"], [88, "Victor ❌"],
          [89, "Gabriel"], [90, "Lucas BBN"], [91, "Dani"], [92, "Carlão"], [93, "Cecília"], [94, "Pr Josias"],
          [95, "Sueli"], [96, "Pastor Joel"], [97, "Irmã Mabel"], [98, "Adriel"], [99, "Walquira"], [100, "Kevin"],
          [101, "Gabe"], [102, "Mariane"], [103, "Rodinei"], [104, "Ismael"], [105, "Quesia"],
        ].map(([number, name], i) => ({ id: `parents-${i}`, number: number as number, name: name as string })),
      },
    ],
  },
];

const totals = [
  { id: "total-andrew", label: "Andrew", value: 49 },
  { id: "total-maria", label: "Maria", value: 27 },
  { id: "total-parents", label: "Andrew Parents", value: 27 },
  { id: "total-invitations", label: "TOTAL INVITATIONS", value: 105 },
];

const STORAGE_KEY = "marriage-invitation-guests-v2";

export const Route = createFileRoute("/guests")({
  loader: async () => {
    const { unlocked } = await isUnlocked();
    if (!unlocked) throw redirect({ to: "/unlock" });
    return null;
  },
  component: GuestList,
});

function cloneBlocks() {
  return JSON.parse(JSON.stringify(initialBlocks)) as PersonBlock[];
}

function GuestList() {
  const defaultNumbers = useMemo(() => {
    const values: Record<string, number> = {};
    for (const block of initialBlocks) for (const section of block.sections) for (const guest of section.guests) values[guest.id] = guest.number;
    for (const total of totals) values[total.id] = total.value;
    return values;
  }, []);

  const [blocks, setBlocks] = useState<PersonBlock[]>(cloneBlocks);
  const [numbers, setNumbers] = useState<Record<string, number>>(defaultNumbers);
  const [saved, setSaved] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [bucket, setBucket] = useState<AddBucket>("Andrew");
  const [section, setSection] = useState("Family");
  const [guestName, setGuestName] = useState("");
  const [guestNumber, setGuestNumber] = useState(106);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as { blocks?: PersonBlock[]; numbers?: Record<string, number> };
      if (parsed.blocks?.length) setBlocks(parsed.blocks);
      if (parsed.numbers) setNumbers({ ...defaultNumbers, ...parsed.numbers });
    } catch {
      // Keep the supplied list if local storage is unavailable or corrupt.
    }
  }, [defaultNumbers]);

  useEffect(() => {
    const all = blocks.flatMap((b) => b.sections.flatMap((s) => s.guests));
    const max = all.reduce((m, g) => Math.max(m, numbers[g.id] ?? g.number), 0);
    setGuestNumber(max + 1);
  }, [blocks, numbers, showAdd]);

  const updateNumber = (id: string, value: string) => {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return;
    setNumbers((current) => ({ ...current, [id]: parsed }));
    setSaved(false);
  };

  const sectionOptions = bucket === "Andrew"
    ? ["Family", "Immediate Family", "Friends", "Parents / Extended Family"]
    : bucket === "Maria"
      ? ["Family", "Friends"]
      : bucket === "Groomsmen"
        ? ["Groomsmen"]
        : ["Andrew Parents’ Invitations"];

  useEffect(() => {
    setSection(sectionOptions[0]);
  }, [bucket]);

  const addGuest = () => {
    const name = guestName.trim();
    if (!name) return;
    const id = `custom-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const newGuest: Guest = { id, number: guestNumber, name };

    setBlocks((current) => current.map((block) => {
      const targetBlock = bucket === "Maria" ? "MARIA" : bucket === "Andrew Parents" ? "ANDREW PARENTS’ INVITATIONS" : "ANDREW";
      if (block.title !== targetBlock) return block;
      return {
        ...block,
        sections: block.sections.map((s) => {
          const targetSection = bucket === "Andrew Parents" ? "" : bucket === "Groomsmen" ? "Groomsmen" : section;
          return s.title === targetSection ? { ...s, guests: [...s.guests, newGuest] } : s;
        }),
      };
    }));
    setNumbers((current) => ({ ...current, [id]: guestNumber }));
    setGuestName("");
    setGuestNumber((n) => n + 1);
    setSaved(false);
    setShowAdd(false);
  };

  const removeGuest = (guest: Guest) => {
    if (!confirm(`Remove ${guest.name} from the guest list?`)) return;
    setBlocks((current) => current.map((block) => ({
      ...block,
      sections: block.sections.map((s) => ({ ...s, guests: s.guests.filter((g) => g.id !== guest.id) })),
    })));
    setNumbers((current) => {
      const next = { ...current };
      delete next[guest.id];
      return next;
    });
    setSaved(false);
  };

  const save = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ blocks, numbers }));
      setSaved(true);
      window.setTimeout(() => setSaved(false), 1800);
    } catch {
      setSaved(false);
    }
  };

  return (
    <main className="mx-auto max-w-[900px] px-4 pb-20 pt-8 sm:pt-12">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <Link to="/" className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/20">
          <ArrowLeft size={16} /> Back to Planning
        </Link>
        <div className="flex gap-2">
          <button type="button" onClick={() => setShowAdd(true)} className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-navy shadow-sm transition-transform hover:-translate-y-0.5">
            <Plus size={16} /> Add Guest
          </button>
          <button type="button" onClick={save} className="inline-flex items-center gap-2 rounded-xl bg-gold px-4 py-2.5 text-sm font-bold text-navy shadow-sm transition-transform hover:-translate-y-0.5">
            <Save size={16} /> {saved ? "Saved" : "Save List"}
          </button>
        </div>
      </div>

      <header className="rounded-[22px] bg-[image:var(--gradient-cover)] px-6 py-10 text-center shadow-[var(--shadow-cover)] sm:px-10">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky">Wedding Planning</p>
        <h1 className="mt-3 font-display text-3xl font-extrabold text-white sm:text-4xl">💍 Marriage Invitations</h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-sky/90">Add or remove guests, choose their group, and edit every number.</p>
      </header>

      {showAdd && (
        <section className="mt-6 rounded-2xl border border-gold/50 bg-white/95 p-5 shadow-[var(--shadow-card)] sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-xl font-bold text-navy">Add a Guest</h2>
              <p className="mt-1 text-xs text-ink-soft">Choose one of the four main categories, then place the guest in the right section.</p>
            </div>
            <button type="button" onClick={() => setShowAdd(false)} className="rounded-lg p-2 text-ink-soft hover:bg-mist"><X size={18} /></button>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {(["Andrew", "Maria", "Andrew Parents", "Groomsmen"] as AddBucket[]).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setBucket(option)}
                className={`rounded-xl border px-3 py-3 text-sm font-bold transition-colors ${bucket === option ? "border-royal bg-royal text-white" : "border-line bg-paper text-navy hover:border-royal/50"}`}
              >
                {option}
              </button>
            ))}
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_110px_auto] sm:items-end">
            <label className="text-xs font-bold uppercase tracking-wider text-ink-soft">
              Guest Name
              <input value={guestName} onChange={(e) => setGuestName(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") addGuest(); }} placeholder="Enter guest name" className="mt-1.5 w-full rounded-xl border border-line bg-white px-3 py-2.5 text-sm font-medium normal-case tracking-normal text-navy outline-none focus:border-royal focus:ring-2 focus:ring-royal/15" />
            </label>

            <label className="text-xs font-bold uppercase tracking-wider text-ink-soft">
              Section
              <select value={section} onChange={(e) => setSection(e.target.value)} disabled={sectionOptions.length === 1} className="mt-1.5 w-full rounded-xl border border-line bg-white px-3 py-2.5 text-sm font-medium normal-case tracking-normal text-navy outline-none focus:border-royal disabled:bg-mist">
                {sectionOptions.map((option) => <option key={option}>{option}</option>)}
              </select>
            </label>

            <label className="text-xs font-bold uppercase tracking-wider text-ink-soft">
              Number
              <input type="number" value={guestNumber} onChange={(e) => setGuestNumber(Number(e.target.value) || 0)} className="mt-1.5 w-full rounded-xl border border-line bg-white px-3 py-2.5 text-center text-sm font-bold normal-case tracking-normal text-navy outline-none focus:border-royal" />
            </label>

            <button type="button" onClick={addGuest} disabled={!guestName.trim()} className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-teal/85 disabled:cursor-not-allowed disabled:opacity-40">
              <Plus size={16} /> Add
            </button>
          </div>
        </section>
      )}

      <div className="mt-6 space-y-7">
        {blocks.map((block) => (
          <section key={block.title} className="overflow-hidden rounded-2xl border border-line bg-white/95 shadow-[var(--shadow-card)]">
            <div className="border-b border-line bg-navy px-5 py-4">
              <h2 className="font-display text-xl font-bold tracking-wide text-white">{block.title}</h2>
            </div>
            <div className="space-y-6 p-5 sm:p-6">
              {block.sections.map((s, sectionIndex) => (
                <div key={`${block.title}-${s.title}-${sectionIndex}`}>
                  {s.title && <h3 className="mb-3 text-sm font-bold uppercase tracking-[0.14em] text-royal">{s.title}</h3>}
                  <div className="divide-y divide-line/70 rounded-xl border border-line bg-paper">
                    {s.guests.length === 0 && <div className="px-4 py-4 text-sm text-ink-soft">No guests in this section yet.</div>}
                    {s.guests.map((guest) => (
                      <div key={guest.id} className="flex items-center gap-3 px-3 py-2.5 sm:px-4">
                        <input
                          aria-label={`Number for ${guest.name}`}
                          type="number"
                          value={numbers[guest.id] ?? guest.number}
                          onChange={(e) => updateNumber(guest.id, e.target.value)}
                          className="w-16 shrink-0 rounded-lg border border-line bg-white px-2 py-1.5 text-center text-sm font-semibold text-navy outline-none focus:border-royal focus:ring-2 focus:ring-royal/15"
                        />
                        <span className="min-w-0 flex-1 text-sm font-medium text-ink">{guest.name}</span>
                        <button type="button" onClick={() => removeGuest(guest)} aria-label={`Remove ${guest.name}`} className="rounded-lg p-2 text-destructive/70 transition-colors hover:bg-destructive/10 hover:text-destructive">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}

        <section className="rounded-2xl border border-gold/50 bg-white/95 p-5 shadow-[var(--shadow-card)] sm:p-6">
          <h2 className="font-display text-xl font-bold text-navy">TOTALS</h2>
          <div className="mt-4 divide-y divide-line rounded-xl border border-line bg-paper">
            {totals.map((total) => (
              <div key={total.id} className={`flex items-center justify-between gap-4 px-4 py-3 ${total.id === "total-invitations" ? "bg-gold/10" : ""}`}>
                <span className={`${total.id === "total-invitations" ? "font-extrabold" : "font-bold"} text-navy`}>{total.label}</span>
                <input
                  aria-label={`${total.label} total`}
                  type="number"
                  value={numbers[total.id] ?? total.value}
                  onChange={(e) => updateNumber(total.id, e.target.value)}
                  className="w-20 rounded-lg border border-line bg-white px-2 py-1.5 text-center font-bold text-navy outline-none focus:border-royal focus:ring-2 focus:ring-royal/15"
                />
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
