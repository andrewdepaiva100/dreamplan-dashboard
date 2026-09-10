import { useMemo, useState } from "react";
import {
  JOURNAL_TABS,
  JOURNAL_ZONE_MOTIFS,
  JOURNAL_ZONE_ORDER,
  journalCounts,
  journalEntriesFor,
  type JournalEntry,
  type JournalProgress,
  type JournalTab,
} from "@/lib/quest/journalContent";
import { ENVELOPES, ZONES } from "@/lib/quest/content";

const TAB_NOTES: Record<JournalTab, string> = {
  people: "The people who made the road feel less lonely.",
  places: "Five realms, each carrying a different piece of the promise.",
  keepsakes: "Relics of devotion gathered along the way.",
  letters: "Words Andrew hid where only Maria would think to look.",
};

function EntryPaper({ entry }: { entry: JournalEntry }) {
  return (
    <article className="relative min-h-[310px] overflow-hidden rounded-[22px] border border-[#cbb584]/70 bg-[radial-gradient(120%_100%_at_20%_0%,#fffdf5_0%,#f8eed7_58%,#ead8af_100%)] px-5 py-6 shadow-[inset_0_0_40px_rgba(121,84,37,.08)] sm:min-h-[390px] sm:px-8 sm:py-8">
      <div className="pointer-events-none absolute inset-2 rounded-[17px] border border-[#d8c7a2]/55" />
      <div className="pointer-events-none absolute -right-6 -top-7 text-[96px] leading-none text-[#c59b43]/[0.08]">
        {entry.icon}
      </div>
      <div className="relative">
        <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-[#a27b38]">{entry.eyebrow}</p>
        <div className="mt-3 flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#c9a85b]/60 bg-[#fff7df] text-xl text-[#9b7130] shadow-sm">
            {entry.icon}
          </span>
          <h3 className="font-display text-2xl font-bold leading-tight text-[#26324d] sm:text-3xl">
            {entry.title}
          </h3>
        </div>
        <div className="my-5 h-px bg-gradient-to-r from-transparent via-[#bd984e]/70 to-transparent" />
        <p className="font-serif-italic text-[15px] leading-7 text-[#443828] sm:text-base sm:leading-8">
          {entry.body}
        </p>
        {entry.quote ? (
          <div className="mt-6 border-l-2 border-[#c79b49]/60 pl-4">
            <p className="font-serif-italic text-sm italic leading-6 text-[#856b43]">“{entry.quote}”</p>
          </div>
        ) : null}
        {entry.zone ? (
          <p className="mt-6 text-[9px] font-bold uppercase tracking-[0.22em] text-[#a78a5b]">
            {ZONES[entry.zone].act} · {ZONES[entry.zone].title}
          </p>
        ) : null}
      </div>
    </article>
  );
}

function LockedPaper({ kind }: { kind: "relic" | "letter" }) {
  return (
    <article className="relative flex min-h-[310px] items-center justify-center overflow-hidden rounded-[22px] border border-[#c8b58e]/45 bg-[linear-gradient(145deg,#efe5cf,#e3d4b8)] p-8 text-center shadow-inner sm:min-h-[390px]">
      <div className="absolute inset-2 rounded-[17px] border border-[#c5af83]/30" />
      <div className="relative">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-[#a99067]/35 bg-[#d8c8aa]/35 text-4xl text-[#8f7b59]/55">
          {kind === "letter" ? "✉" : "✦"}
        </div>
        <p className="mt-5 font-display text-xl font-bold text-[#665942]">
          {kind === "letter" ? "A Sealed Letter" : "An Unfound Keepsake"}
        </p>
        <p className="mx-auto mt-2 max-w-xs font-serif-italic text-sm italic leading-6 text-[#806f56]">
          {kind === "letter"
            ? "Some words are still waiting somewhere along the road."
            : "Its place is here already. Its story will appear when Maria finds it."}
        </p>
      </div>
    </article>
  );
}

function JourneyPage({ progress }: { progress: JournalProgress }) {
  const counts = journalCounts(progress);
  return (
    <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
      <section className="relative overflow-hidden rounded-[22px] border border-[#c7aa70]/65 bg-[radial-gradient(circle_at_50%_0%,#fff9e8,#efe0bd_75%)] p-5 shadow-inner sm:p-7">
        <div className="absolute -right-10 -top-12 text-[150px] text-[#c28e37]/[0.07]">♡</div>
        <div className="relative">
          <p className="text-[9px] font-bold uppercase tracking-[0.35em] text-[#a67f3b]">Maria&apos;s Journal</p>
          <h3 className="mt-2 font-serif-italic text-3xl italic text-[#785b2d] sm:text-4xl">Our Story So Far</h3>
          <p className="mt-4 max-w-md text-sm leading-7 text-[#4b4234]">
            The people, places, promises, and little pieces of forever that carried Maria toward the cathedral.
          </p>
          <div className="mt-6 grid grid-cols-3 gap-2">
            {[
              [counts.realms, "Realms"],
              [counts.relics, "Relics"],
              [counts.letters, "Letters"],
            ].map(([value, label]) => (
              <div key={String(label)} className="rounded-xl border border-[#c5a15c]/45 bg-white/45 px-2 py-3 text-center">
                <p className="font-display text-xl font-bold text-[#26324d]">{value}</p>
                <p className="mt-0.5 text-[8px] font-bold uppercase tracking-[0.2em] text-[#9a7c50]">{label}</p>
              </div>
            ))}
          </div>
          <div className="mt-7 h-px bg-gradient-to-r from-transparent via-[#b88e46]/60 to-transparent" />
          <p className="mt-5 font-serif-italic text-sm italic leading-6 text-[#7a6544]">
            “I thought I was gathering what I needed to reach the wedding. Somewhere along the way, I realized I was gathering reminders of why I wanted to get there.”
          </p>
        </div>
      </section>

      <section className="rounded-[22px] border border-[#c7aa70]/65 bg-[linear-gradient(150deg,#fffaf0,#eee0c1)] p-5 shadow-inner sm:p-7">
        <p className="text-[9px] font-bold uppercase tracking-[0.32em] text-[#a67f3b]">The road to forever</p>
        <div className="relative mt-6 space-y-1">
          <div className="absolute bottom-8 left-[21px] top-8 w-px bg-[#b99a63]/35" />
          {JOURNAL_ZONE_ORDER.map((zone, index) => {
            const entry = journalEntriesFor("places").find((candidate) => candidate.id === zone)!;
            const open = entry.unlocked(progress);
            return (
              <div key={zone} className={`relative flex gap-4 rounded-xl px-1 py-3 ${open ? "" : "opacity-45"}`}>
                <div className={`relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border text-lg shadow-sm ${open ? "border-[#c9a65d] bg-[#fff8e8] text-[#946c2c]" : "border-[#a99d88]/40 bg-[#ddd2be] text-[#8b8170]"}`}>
                  {open ? JOURNAL_ZONE_MOTIFS[zone].symbol : "·"}
                </div>
                <div className="min-w-0 pt-0.5">
                  <p className="text-[8px] font-bold uppercase tracking-[0.22em] text-[#a28455]">Act {index + 1}</p>
                  <p className="mt-0.5 text-sm font-bold text-[#27324b]">{open ? ZONES[zone].title : "A realm still ahead"}</p>
                  <p className="mt-1 font-serif-italic text-[11px] italic leading-5 text-[#75634a]">
                    {open ? JOURNAL_ZONE_MOTIFS[zone].line : "The next page has not been written yet."}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

export function QuestJournal({ progress, onClose }: { progress: JournalProgress; onClose: () => void }) {
  const [tab, setTab] = useState<JournalTab>("people");
  const entries = useMemo(() => journalEntriesFor(tab), [tab]);
  const visibleEntries = useMemo(() => {
    if (tab === "people" || tab === "places") return entries.filter((entry) => entry.unlocked(progress));
    if (tab === "letters") {
      return entries.filter((entry) => entry.id !== "wedding-hour" || entry.unlocked(progress));
    }
    return entries;
  }, [entries, progress, tab]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = visibleEntries.find((entry) => entry.id === selectedId) ?? visibleEntries[0] ?? null;
  const unlockedSelected = selected ? selected.unlocked(progress) : false;

  const openSection = (nextTab: JournalTab) => {
    const nextEntries = journalEntriesFor(nextTab);
    const nextVisible =
      nextTab === "people" || nextTab === "places"
        ? nextEntries.filter((entry) => entry.unlocked(progress))
        : nextTab === "letters"
          ? nextEntries.filter((entry) => entry.id !== "wedding-hour" || entry.unlocked(progress))
          : nextEntries;
    const firstEntry = nextVisible.find((entry) => entry.unlocked(progress)) ?? nextVisible[0] ?? null;
    setTab(nextTab);
    setSelectedId(firstEntry?.id ?? null);
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[rgba(7,10,22,0.86)] p-2 backdrop-blur-md sm:p-5">
      <div className="relative flex h-[min(94dvh,920px)] w-full max-w-6xl flex-col overflow-hidden rounded-[28px] border border-[#d6b86f]/70 bg-[#ead9b6] shadow-[0_30px_100px_rgba(0,0,0,.55)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(255,255,255,.5),transparent_38%),radial-gradient(circle_at_80%_100%,rgba(143,94,37,.12),transparent_35%)]" />
        <header className="relative flex items-center justify-between border-b border-[#b89555]/45 bg-[#f7ecd4]/90 px-4 py-3 sm:px-6">
          <div>
            <p className="text-[8px] font-bold uppercase tracking-[0.38em] text-[#9a7639]">Realm of the Golden Ring</p>
            <h2 className="mt-0.5 font-serif-italic text-2xl italic text-[#6f542b] sm:text-3xl">Maria&apos;s Memory Journal</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close journal"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[#b9934f]/60 bg-white/60 text-lg font-bold text-[#70552d] shadow-sm transition hover:bg-white active:scale-95"
          >
            ✕
          </button>
        </header>

        <div className="relative flex min-h-0 flex-1 flex-col">
          <nav className="flex shrink-0 gap-1 overflow-x-auto border-b border-[#b89555]/35 bg-[#efe1c3]/80 px-3 py-2 sm:justify-center">
            <button
              type="button"
              onClick={() => setSelectedId(null)}
              className="mr-2 shrink-0 rounded-full border border-[#9f7b43]/40 bg-white/35 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.16em] text-[#725a38]"
            >
              ✧ Journey
            </button>
            {JOURNAL_TABS.map((item) => {
              const active = selectedId !== null && tab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => openSection(item.id)}
                  className={`shrink-0 rounded-full border px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.16em] transition ${active ? "border-[#9a7335] bg-[#26324d] text-[#f5dfaa] shadow" : "border-[#aa8e60]/35 bg-white/30 text-[#725f42] hover:bg-white/55"}`}
                >
                  <span className="mr-1.5">{item.icon}</span>{item.label}
                </button>
              );
            })}
          </nav>

          <div className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-5">
            {selectedId === null ? (
              <>
                <JourneyPage progress={progress} />
                <div className="mt-4 rounded-xl border border-[#b9985e]/35 bg-[#fff8e7]/50 px-4 py-3 text-center font-serif-italic text-xs italic text-[#746246]">
                  Choose a section above, then open any written page to linger over its memory.
                </div>
              </>
            ) : null}

            {selectedId !== null ? (
              <div className="grid gap-3 lg:grid-cols-[250px_minmax(0,1fr)]">
                <aside className="rounded-[20px] border border-[#b99759]/45 bg-[#f3e6ca]/70 p-3 lg:max-h-[68dvh] lg:overflow-y-auto">
                  <p className="px-2 text-[8px] font-bold uppercase tracking-[0.25em] text-[#957442]">{TAB_NOTES[tab]}</p>
                  <div className="mt-3 space-y-1.5">
                    {visibleEntries.map((entry) => {
                      const open = entry.unlocked(progress);
                      const active = selected?.id === entry.id;
                      const sealedLabel = tab === "letters" ? "Sealed letter" : tab === "keepsakes" ? "Unfound keepsake" : entry.title;
                      return (
                        <button
                          key={entry.id}
                          type="button"
                          onClick={() => setSelectedId(entry.id)}
                          className={`flex w-full items-center gap-3 rounded-xl border p-2.5 text-left transition ${active ? "border-[#a77f3d] bg-[#fff9e9] shadow-sm" : "border-transparent hover:border-[#b99b68]/35 hover:bg-white/30"}`}
                        >
                          <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-sm ${open ? "border-[#c3a365]/45 bg-white/55 text-[#936c31]" : "border-[#a99a82]/30 bg-[#d7cbb5]/50 text-[#8f826d]"}`}>
                            {open ? entry.icon : tab === "letters" ? "✉" : "?"}
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate text-xs font-bold text-[#29334a]">{open ? entry.title : sealedLabel}</span>
                            <span className="mt-0.5 block truncate text-[9px] uppercase tracking-[0.12em] text-[#987f5b]">{open ? entry.eyebrow : "Waiting to be found"}</span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </aside>
                <div>
                  {selected && unlockedSelected ? <EntryPaper entry={selected} /> : null}
                  {selected && !unlockedSelected ? <LockedPaper kind={tab === "letters" ? "letter" : "relic"} /> : null}
                </div>
              </div>
            ) : null}

            {selectedId === null ? (
              <div className="mt-5 grid gap-2 sm:grid-cols-4">
                {JOURNAL_TABS.map((item) => {
                  const tabEntries = journalEntriesFor(item.id);
                  const available = tabEntries.filter((entry) => entry.unlocked(progress)).length;
                  return (
                    <button
                      key={`open-${item.id}`}
                      type="button"
                      onClick={() => openSection(item.id)}
                      className="rounded-xl border border-[#b39156]/45 bg-[#fff8e8]/55 p-3 text-left transition hover:bg-[#fffaf0]"
                    >
                      <span className="text-lg text-[#906a2d]">{item.icon}</span>
                      <span className="ml-2 text-xs font-bold text-[#2d374e]">{item.label}</span>
                      <span className="mt-1 block text-[9px] uppercase tracking-[0.15em] text-[#9a815c]">{available} written</span>
                    </button>
                  );
                })}
              </div>
            ) : null}
          </div>

          <footer className="relative flex shrink-0 items-center justify-between border-t border-[#b89555]/35 bg-[#efe0bf]/80 px-4 py-2 text-[9px] uppercase tracking-[0.18em] text-[#8b724e] sm:px-6">
            <span>Andrew &amp; Maria</span>
            <span>{ENVELOPES.filter((letter) => letter.id !== "wedding-hour" && progress.envelopes.includes(letter.id)).length}/5 letters found</span>
          </footer>
        </div>
      </div>
    </div>
  );
}

export default QuestJournal;