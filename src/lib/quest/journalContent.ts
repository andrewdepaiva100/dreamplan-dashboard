import { ENVELOPES, RELICS, ZONES, type ZoneId } from "./content";

export type JournalTab = "people" | "places" | "keepsakes" | "letters";

export type JournalProgress = {
  zone: ZoneId;
  relics: string[];
  envelopes: string[];
  weapons: string[];
  weddingCompleted?: boolean;
};

export type JournalEntry = {
  id: string;
  tab: JournalTab;
  title: string;
  eyebrow: string;
  body: string;
  quote?: string;
  icon: string;
  zone?: ZoneId;
  unlocked: (progress: JournalProgress) => boolean;
};

export const JOURNAL_TABS: { id: JournalTab; label: string; icon: string }[] = [
  { id: "people", label: "People", icon: "♡" },
  { id: "places", label: "Places", icon: "⌂" },
  { id: "keepsakes", label: "Keepsakes", icon: "✦" },
  { id: "letters", label: "Letters", icon: "✉" },
];

export const JOURNAL_ZONE_ORDER: ZoneId[] = [
  "sunlit_shores",
  "wedding_garden",
  "the_haven",
  "starry_ascent",
  "cathedral",
];

export const JOURNAL_ZONE_MOTIFS: Record<ZoneId, { symbol: string; line: string }> = {
  sunlit_shores: { symbol: "☀", line: "Where the road begins in light." },
  wedding_garden: { symbol: "❀", line: "Every season teaches the heart how to bloom." },
  the_haven: { symbol: "♪", line: "Home is the melody two people keep choosing." },
  starry_ascent: { symbol: "✧", line: "Rest beneath the stars, then rise." },
  cathedral: { symbol: "♢", line: "At the end of the road waits a promise." },
};

export function hasReachedZone(progress: JournalProgress, zone: ZoneId) {
  return JOURNAL_ZONE_ORDER.indexOf(progress.zone) >= JOURNAL_ZONE_ORDER.indexOf(zone);
}

const PEOPLE: JournalEntry[] = [
  {
    id: "maria",
    tab: "people",
    title: "Maria",
    eyebrow: "The Bringer of Peace",
    icon: "♥",
    body: "She crosses each realm carrying a gentleness that never asks to be mistaken for weakness. Worry becomes something she can face, love becomes something she can gather, and every road keeps pointing her toward the life she is choosing.",
    quote: "A soft heart can still be a brave one.",
    unlocked: () => true,
  },
  {
    id: "andrew",
    tab: "people",
    title: "Andrew",
    eyebrow: "The one waiting at the end — and walking beside her",
    icon: "♡",
    body: "Andrew's words are tucked throughout the realms, but in the Haven he stops being only a destination. He joins Maria's search, fights beside her, and turns the missing melody into something they recover together.",
    quote: "Not just the wedding. The Tuesdays after it.",
    unlocked: (p) => hasReachedZone(p, "the_haven") || p.weapons.includes("love-sword"),
  },
  {
    id: "guides",
    tab: "people",
    title: "The Realm Guides",
    eyebrow: "Kind voices along the road",
    icon: "✦",
    body: "Across the five realms, friends and guides make the journey feel inhabited rather than lonely. Their gifts, directions, jokes, prayers, and small acts of care are reminders that a wedding is never only about two people — it is held by a community.",
    unlocked: () => true,
  },
  {
    id: "wedding-family",
    tab: "people",
    title: "The Wedding Company",
    eyebrow: "Family, friends, witnesses",
    icon: "❦",
    body: "By the cathedral, the scattered faces of the journey become one gathering. Every witness carries a different piece of the story, and together they turn the final promise into something celebrated, remembered, and shared.",
    unlocked: (p) => hasReachedZone(p, "cathedral") || Boolean(p.weddingCompleted),
  },
];

const PLACES: JournalEntry[] = JOURNAL_ZONE_ORDER.map((zone) => ({
  id: zone,
  tab: "places" as const,
  title: ZONES[zone].title,
  eyebrow: ZONES[zone].act,
  icon: JOURNAL_ZONE_MOTIFS[zone].symbol,
  zone,
  body:
    zone === "sunlit_shores"
      ? "Sun-warmed roads, bright water, and the hidden hush of the Sunken Grotto. The first realm teaches Maria that peace is not the absence of fear; it is the light she carries into it."
      : zone === "wedding_garden"
        ? "A garden divided into seasons, each beautiful in a different way. Its keys and Conservatory turn preparation, pressure, and change into a lesson about making room for peace in every season."
        : zone === "the_haven"
          ? "A lived-in town of fountains, music, promises, and imagined ordinary days. The Haven is where the quest becomes most clearly about a shared life: not only reaching a wedding, but building a home after it."
          : zone === "starry_ascent"
            ? "A quieter realm beneath an enormous sky. Rest, crystal light, and the climb upward make this the breath before the final promise — a place to remember that stillness can be part of courage."
            : "The last courtyard and the threshold of the wedding itself. Here the relics, letters, friends, and promises stop feeling like separate discoveries and become one story: two people choosing forever in front of everyone who loves them.",
  quote: JOURNAL_ZONE_MOTIFS[zone].line,
  unlocked: (p) => hasReachedZone(p, zone),
}));

const KEEPSAKES: JournalEntry[] = RELICS.map((relic) => ({
  id: relic.id,
  tab: "keepsakes" as const,
  title: relic.name,
  eyebrow: relic.note,
  icon: "✦",
  zone: relic.zone,
  body: relic.card,
  quote: `Found in ${ZONES[relic.zone].title}.`,
  unlocked: (p) => p.relics.includes(relic.id),
}));

const LETTERS: JournalEntry[] = ENVELOPES.map((letter) => ({
  id: letter.id,
  tab: "letters" as const,
  title: letter.title,
  eyebrow: letter.id === "wedding-hour" ? "A final sealed moment" : "A letter from Andrew",
  icon: "✉",
  zone: letter.zone,
  body: letter.letter,
  unlocked: (p) => p.envelopes.includes(letter.id),
}));

export const JOURNAL_ENTRIES: JournalEntry[] = [...PEOPLE, ...PLACES, ...KEEPSAKES, ...LETTERS];

export function journalEntriesFor(tab: JournalTab) {
  return JOURNAL_ENTRIES.filter((entry) => entry.tab === tab);
}

export function journalCounts(progress: JournalProgress) {
  const standardLetters = ENVELOPES.filter((entry) => entry.id !== "wedding-hour");
  return {
    realms: JOURNAL_ZONE_ORDER.filter((zone) => hasReachedZone(progress, zone)).length,
    relics: RELICS.filter((entry) => progress.relics.includes(entry.id)).length,
    letters: standardLetters.filter((entry) => progress.envelopes.includes(entry.id)).length,
  };
}
