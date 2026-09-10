import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Plus, Save, Trash2, X } from "lucide-react";
import { isUnlocked } from "@/lib/gate.functions";

type Guest = { id: string; number: number; name: string };
type GuestSection = { title: string; guests: Guest[] };
type PersonBlock = { title: string; sections: GuestSection[] };
type AddBucket = "Andrew" | "Maria" | "Andrew Parents" | "Groomsmen";

const cleanName = (name: string) =>
  name.replace(/💩|🥀|❌/g, "").replace(/\s{2,}/g, " ").trim();

const makeGuests = (prefix: string, start: number, names: string[]): Guest[] =>
  names.map((name, i) => ({ id: `${prefix}-${i}`, number: start + i, name: cleanName(name) }));

const initialBlocks: PersonBlock[] = [
  {
    title: "ANDREW",
    sections: [
      {
        title: "Family",
        guests: makeGuests("andrew-family", 1, [
          "Tia Gigi", "Belinha", "Enzo", "Tio Edi", "Tia Neia", "Deborah", "Frankie", "Kaia", "Ruth", "Alcir",
          "Camila", "Vovó", "Vovô", "Tia Cris", "Tiffany", "Don", "Vick", "Brooke", "Reggie", "Keisee", "Reginaldo",
        ]),
      },
      {
        title: "Immediate Family",
        guests: makeGuests("andrew-immediate", 22, ["Mom", "Dad", "Andressa", "Joshua"]),
      },
      {
        title: "Friends",
        guests: makeGuests("andrew-friends", 26, [
          "Bryan", "Vic", "Nate", "Junior", "Rebecca", "Isaac", "Joseph", "Italo", "Andre", "Kleber", "Irmã Antonesia",
          "Raquel", "Nicholas", "Isaac (London)", "Manuel", "Vic’s Mom", "Nicole",
        ]),
      },
      {
        title: "Parents / Extended Family",
        guests: makeGuests("andrew-extended", 43, ["Tio Robison", "Tia Sol", "Tia Susanne", "Tio Eber"]),
      },
      {
        title: "Groomsmen",
        guests: makeGuests("andrew-groomsmen", 47, ["Gianluca", "Gabe", "Phill"]),
      },
    ],
  },
  {
    title: "MARIA",
    sections: [
      {
        title: "Family",
        guests: makeGuests("maria-family", 50, [
          "Pedrinho", "Mom", "Dad", "Guilherme", "Tavinho", "Giovanna", "Thayna", "Taciana", "Malu", "Bruninho",
          "Eneida", "Claudia", "Daminhão", "Monica", "Júnior",
        ]),
      },
      {
        title: "Friends",
        guests: makeGuests("maria-friends", 65, [
          "Lorena", "Alicia", "Santinho", "Dileane", "Charles", "Geni", "Eli", "Gino", "Hélibi", "Junior", "Samuel",
          "Arthur", "Larissa Lawyer", "Larissa Husband",
        ]),
      },
    ],
  },
  {
    title: "ANDREW PARENTS’ INVITATIONS",
    sections: [
      {
        title: "",
        guests: makeGuests("parents", 79, [
          "Quesia (…)", "Guigui (…)", "Tia Erica", "Josivan", "Gabriella", "Ben", "Noiva do Benjamin", "Silmo", "Sirley",
          "Isabel", "Adecio", "Victor", "Gabriel", "Lucas BBN", "Dani", "Carlão", "Cecília", "Pr Josias", "Sueli",
          "Pastor Joel", "Irmã Mabel", "Adriel", "Walquira", "Kevin", "Gabe", "Mariane", "Rodinei", "Ismael", "Quesia",
        ]),
      },
    ],
  },
];

const STORAGE_KEY = "marriage-invitation-guests-v3";
const OLD_STORAGE_KEY = "marriage-invitation-guests-v2";

export const Route = createFileRoute("/guests")({
  loader: async () => {
    const { unlocked } = await isUnlocked();
    if (!unlocked) throw redirect({ to: "/unlock" });
    return null;
  },
  component: GuestList,
});

function cloneBlocks(blocks: PersonBlock[] = initialBlocks) {
  return JSON.parse(JSON.stringify(blocks)) as PersonBlock[];
}

function normalizeBlocks(source: PersonBlock[]) {
  let nextNumber = 1;
  return source.map((block) => ({
    ...block,
    sections: block.sections.map((section) => ({
      ...section,
      guests: section.guests.map((guest) => ({
        ...guest,
        number: nextNumber++,
        name: cleanName(guest.name),
      })),
    })),
  }));
}

function GuestList() {
  const [blocks, setBlocks] = useState<PersonBlock[]>(() => cloneBlocks());
  const [saved, setSaved] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [bucket, setBucket] = useState<AddBucket>("Andrew");
  const [section, setSection] = useState("Family");
  const [guestName, setGuestName] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(OLD_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as { blocks?: PersonBlock[] };
      if (parsed.blocks?.length) setBlocks(normalizeBlocks(parsed.blocks));
    } catch {
      // Use the supplied list if local storage is unavailable or corrupt.
    }
  }, []);

  const sectionOptions = useMemo(() => {
    if (bucket === "Andrew") return ["Family", "Immediate Family", "Friends", "Parents / Extended Family"];
    if (bucket === "Maria") return ["Family", "Friends"];
    if (bucket === "Groomsmen") return ["Groomsmen"];
    return ["Andrew Parents’ Invitations"];
  }, [bucket]);

  useEffect(() => {
    setSection(sectionOptions[0]);
  }, [sectionOptions]);

  const allGuests = blocks.flatMap((block) => block.sections.flatMap((s) => s.guests));
  const andrewCount = blocks.find((b) => b.title === "ANDREW")?.sections.reduce((n, s) => n + s.guests.length, 0) ?? 0;
  const mariaCount = blocks.find((b) => b.title === "MARIA")?.sections.reduce((n, s) => n + s.guests.length, 0) ?? 0;
  const parentsCount = blocks.find((b) => b.title === "ANDREW PARENTS’ INVITATIONS")?.sections.reduce((n, s) => n + s.guests.length, 0) ?? 0;

  const updateNumber = (id: string, value: string) => {
    const number = Number(value);
    if (!Number.isFinite(number)) return;
    setBlocks((current) => current.map((block) => ({
      ...block,
      sections: block.sections.map((s) => ({
        ...s,
        guests: s.guests.map((g) => g.id === id ? { ...g, number } : g),
      })),
    })));
    setSaved(false);
  };

  const updateName = (id: string, value: string) => {
    setBlocks((current) => current.map((block) => ({
      ...block,
      sections: block.sections.map((s) => ({
        ...s,
        guests: s.guests.map((g) => g.id === id ? { ...g, name: value } : g),
      })),
    })));
    setSaved(false);
  };

  const addGuest = () => {
    const name = cleanName(guestName);
    if (!name) return;
    const id = `custom-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const newGuest: Guest = { id, number: allGuests.length + 1, name };
    const targetBlock = bucket === "Maria" ? "MARIA" : bucket === "Andrew Parents" ? "ANDREW PARENTS’ INVITATIONS" : "ANDREW";
    const targetSection = bucket === "Andrew Parents" ? "" : bucket === "Groomsmen" ? "Groomsmen" : section;

    setBlocks((current) => normalizeBlocks(current.map((block) => {
      if (block.title !== targetBlock) return block;
      return {
        ...block,
        sections: block.sections.map((s) => s.title === targetSection ? { ...s, guests: [...s.guests, newGuest] } : s),
      };
    })));
    setGuestName("");
    setSaved(false);
    setShowAdd(false);
  };

  const removeGuest = (guest: Guest) => {
    if (!confirm(`Remove ${guest.name} from the guest list?`)) return;
    setBlocks((current) => normalizeBlocks(current.map((block) => ({
      ...block,
      sections: block.sections.map((s) => ({ ...s, guests: s.guests.filter((g) => g.id !== guest.id) })),
    }))));
    setSaved(false);
  };

  const save = () => {
    try {
      const cleaned = blocks.map((block) => ({
        ...block,
        sections: block.sections.map((s) => ({
          ...s,
          guests: s.guests.map((g) => ({ ...g, name: cleanName(g.name) })),
        })),
      }));
      setBlocks(cleaned);
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ blocks: cleaned }));
      localStorage.removeItem(OLD_STORAGE_KEY);
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
        <h1 className="mt-3 font-display text-3xl font-extrabold text-white sm:text-4xl">Marriage Invitations</h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-sky/90">Edit guest names and numbers, add or remove guests, and keep every category organized.</p>
      </header>

      {showAdd && (
        <section className="mt-6 rounded-2xl border border-gold/50 bg-white/95 p-5 shadow-[var(--shadow-card)] sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-xl font-bold text-navy">Add a Guest</h2>
              <p className="mt-1 text-xs text-ink-soft">Choose a main category and the correct section.</p>
            </div>
            <button type="button" onClick={() => setShowAdd(false)} className="rounded-lg p-2 text-ink-soft hover:bg-mist"><X size={18} /></button>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {(["Andrew", "Maria", "Andrew Parents", "Groomsmen"] as AddBucket[]).map((option) => (
              <button key={option} type="button" onClick={() => setBucket(option)} className={`rounded-xl border px-3 py-3 text-sm font-bold transition-colors ${bucket === option ? "border-royal bg-royal text-white" : "border-line bg-paper text-navy hover:border-royal/50"}`}>
                {option}
              </button>
            ))}
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
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
                        <input aria-label={`Number for ${guest.name}`} type="number" value={guest.number} onChange={(e) => updateNumber(guest.id, e.target.value)} className="w-16 shrink-0 rounded-lg border border-line bg-white px-2 py-1.5 text-center text-sm font-semibold text-navy outline-none focus:border-royal focus:ring-2 focus:ring-royal/15" />
                        <input aria-label={`Name for guest ${guest.number}`} type="text" value={guest.name} onChange={(e) => updateName(guest.id, e.target.value)} className="min-w-0 flex-1 rounded-lg border border-transparent bg-transparent px-2 py-1.5 text-sm font-medium text-ink outline-none transition-colors hover:border-line hover:bg-white focus:border-royal focus:bg-white focus:ring-2 focus:ring-royal/15" />
                        <button type="button" onClick={() => removeGuest(guest)} aria-label={`Remove ${guest.name}`} className="rounded-lg p-2 text-destructive/70 transition-colors hover:bg-destructive/10 hover:text-destructive"><Trash2 size={16} /></button>
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
            <div className="flex items-center justify-between px-4 py-3"><span className="font-bold text-navy">Andrew</span><span className="font-bold text-navy">{andrewCount}</span></div>
            <div className="flex items-center justify-between px-4 py-3"><span className="font-bold text-navy">Maria</span><span className="font-bold text-navy">{mariaCount}</span></div>
            <div className="flex items-center justify-between px-4 py-3"><span className="font-bold text-navy">Andrew Parents</span><span className="font-bold text-navy">{parentsCount}</span></div>
            <div className="flex items-center justify-between bg-gold/10 px-4 py-3"><span className="font-extrabold text-navy">TOTAL INVITATIONS</span><span className="font-extrabold text-navy">{allGuests.length}</span></div>
          </div>
        </section>
      </div>
    </main>
  );
}
