import { ENVELOPES, RELICS, ZONES, type ZoneId } from "./content";
import { getJournalPeople, hasMetJournalPerson } from "./journalDiscovery";

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

function slug(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const PERSON_PROFILES: Record<string, Omit<JournalEntry, "id" | "tab" | "unlocked">> = {
  "Wren of the Shores": {
    title: "Wren of the Shores",
    eyebrow: "Keeper of the first road",
    icon: "✦",
    body: "Wren was the first voice waiting for me on the Sunlit Shores. She taught me that the creatures in my path were worries given shape, not enemies that deserved cruelty, and she trusted me with the Radiant Spark Wand so I could bring light where fear had taken hold.",
    quote: "Today you only need the road in front of your feet.",
    zone: "sunlit_shores",
  },
  Silas: {
    title: "Silas",
    eyebrow: "Cartographer of the Last Crossing",
    icon: "⌖",
    body: "Silas met me at the bridge with a mapmaker's habit of noticing where courage needs a little direction. He did not tell me to turn back — only to listen first, learn what the crossing had cost other travelers, and remember that confidence is stronger when it makes room for wisdom.",
    quote: "Confidence is useful; information is better.",
    zone: "sunlit_shores",
  },
  Elara: {
    title: "Elara",
    eyebrow: "Former Knight of the Last Crossing",
    icon: "⚔",
    body: "Elara knows what it costs to mistake retreat for failure. She carried the memory of her own crossing long enough to turn it into something useful for mine, and reminded me that surviving can be its own kind of courage.",
    quote: "Sometimes coming home is the bravest thing you do.",
    zone: "sunlit_shores",
  },
  Pip: {
    title: "Pip",
    eyebrow: "Inventor of the Last Crossing",
    icon: "⚙",
    body: "Pip meets fear by building, testing, failing, and building again. Beneath all the jokes is someone who learned that cleverness cannot erase fear — but it can still become part of the way forward.",
    quote: "Fear knows how to swim.",
    zone: "sunlit_shores",
  },
  Maeve: {
    title: "Maeve",
    eyebrow: "Healer of the Last Crossing",
    icon: "✚",
    body: "Maeve reached farther into the crossing than the others and came back carrying a question instead of an answer. She understands that some thresholds are guarded less by monsters than by the part of us that wants to turn around.",
    quote: "He's guarding the part of you that wants to turn around.",
    zone: "sunlit_shores",
  },
  Lorena: {
    title: "Lorena",
    eyebrow: "Maria's closest friend",
    icon: "❀",
    body: "Lorena has the wonderful talent of making something feel real by getting excited about it loudly enough for both of us. She has been in my corner through plans, nerves, color-coded wedding chaos, and every version of me that needed a friend before a solution.",
    quote: "Whatever shows up, I am in your corner.",
    zone: "sunlit_shores",
  },
  "Ivy the Gardener": {
    title: "Ivy the Gardener",
    eyebrow: "Keeper of the Wedding Garden",
    icon: "✿",
    body: "Ivy tends the garden like promises deserve tending: with patience, attention, and no shortcuts. She helped me see that beauty is not something a lasting thing keeps by accident.",
    quote: "A wedding is also the people who witnessed the love becoming real.",
    zone: "wedding_garden",
  },
  Evelyn: {
    title: "Evelyn",
    eyebrow: "Keeper of the Four Seasons",
    icon: "❦",
    body: "Evelyn watches over the Wedding Garden and the rhythm that keeps its seasons moving. She taught me that lasting love is not an endless spring day, but the willingness to keep choosing each other while everything changes.",
    quote: "The promise is that you keep choosing one another as it changes.",
    zone: "wedding_garden",
  },
  "Bram the Forgemaster": {
    title: "Bram the Forgemaster",
    eyebrow: "Keeper of the forge",
    icon: "⚒",
    body: "Bram mends what has to endure. To him, steel and promises are not strong because they never bend; they last because someone cares enough to bring them back true through heat, patience, pressure, and rest.",
    quote: "Don't confuse an easy season with a lasting one.",
    zone: "wedding_garden",
  },
  Alicia: {
    title: "Alicia",
    eyebrow: "Bridesmaid · Lifelong friend",
    icon: "✿",
    body: "Alicia brings the kind of joy that notices every flower, every happy tear, and every excuse to celebrate. Some friendships become part of the architecture of a life; ours is one of them.",
    quote: "There is nowhere else I would be.",
    zone: "wedding_garden",
  },
  "Marlowe the Bellkeeper": {
    title: "Marlowe the Bellkeeper",
    eyebrow: "Bellkeeper of the Haven",
    icon: "◈",
    body: "Marlowe knows the difference between noise and danger, and when a town needs waking versus when it needs quiet. He made Haven feel less like a destination and more like a place where ordinary years could actually happen.",
    quote: "Ordinary kindness is what keeps a home standing.",
    zone: "the_haven",
  },
  Andrew: {
    title: "Andrew",
    eyebrow: "The one waiting at the end — and walking beside me",
    icon: "♡",
    body: "Andrew's words are tucked throughout the realms, but in the Haven he stops being only a destination. He joins my search, fights beside me, and turns the missing melody into something we recover together. The road keeps pointing me toward him because home does too.",
    quote: "Not just the wedding. The Tuesdays after it.",
    zone: "the_haven",
  },
  "Astra the Stargazer": {
    title: "Astra the Stargazer",
    eyebrow: "Watcher of the Starry Ascent",
    icon: "✦",
    body: "Astra watches the climb without mistaking speed for progress. She helped me see that being close to the end is not a reason to hurry past the last stretch.",
    quote: "Some victories look almost like slowing down.",
    zone: "starry_ascent",
  },
  "Pastor Adriel": {
    title: "Pastor Adriel",
    eyebrow: "Pastor · Friend of our story",
    icon: "✧",
    body: "Pastor Adriel has carried our names in prayer and meets the final climb with a steady kind of faith. He reminds me that a promise this serious deserves prayer before applause.",
    quote: "Let that make you grateful, not hurried.",
    zone: "starry_ascent",
  },
  "Sister Lumen": {
    title: "Sister Lumen",
    eyebrow: "Keeper of the Cathedral Light",
    icon: "☼",
    body: "Sister Lumen guards the last threshold with quiet warmth. After so many realms of movement and struggle, she is the voice that finally tells me I can put my shoulders down and notice where I have arrived.",
    quote: "Some thresholds deserve to be noticed.",
    zone: "cathedral",
  },
  "Pastor Alcir": {
    title: "Pastor Alcir",
    eyebrow: "Andrew's grandfather · Officiant",
    icon: "✦",
    body: "Pastor Alcir stands at the altar as both pastor and family. His faith, humor, and years of prayer make the ceremony feel less like the ending of a quest and more like the beginning of every ordinary morning after it.",
    quote: "Today is the beginning, not the finish.",
    zone: "cathedral",
  },
  Pedro: {
    title: "Pedro",
    eyebrow: "Maria's little brother",
    icon: "★",
    body: "Pedro can make even the most enormous moment feel like family again. His excitement, teasing, and very serious little-brother approval are exactly the kind of ordinary love I want waiting around the wedding.",
    zone: "cathedral",
  },
  Gianluca: {
    title: "Gianluca",
    eyebrow: "Best Man",
    icon: "◆",
    body: "Gianluca stands beside Andrew with the familiarity of someone who has seen the story from close enough to know both the jokes and the weight behind them. I am grateful our wedding has friends who know how to hold both.",
    zone: "cathedral",
  },
  "Mom (Raquel)": {
    title: "Mom (Raquel)",
    eyebrow: "Andrew's mother",
    icon: "♥",
    body: "Raquel carries the tenderness of a mother watching her son step into a new family without leaving the old one behind. Her presence makes the wedding feel rooted in generations, not just one day.",
    zone: "cathedral",
  },
  "Dad (Marcos)": {
    title: "Dad (Marcos)",
    eyebrow: "Andrew's father",
    icon: "◆",
    body: "Marcos brings the steady pride of a father who has watched Andrew become the man now waiting at the altar. Some blessings are spoken; others are simply the way family shows up.",
    zone: "cathedral",
  },
  "Mom (Silvia)": {
    title: "Mom (Silvia)",
    eyebrow: "Maria's mother",
    icon: "♥",
    body: "Silvia has known every earlier version of me that had to grow into the woman walking this road. Seeing her here makes the whole journey feel connected to where I came from.",
    zone: "cathedral",
  },
  "Dad (Gustavo)": {
    title: "Dad (Gustavo)",
    eyebrow: "Maria's father",
    icon: "◆",
    body: "Gustavo's presence carries the quiet weight of family history into the cathedral. The road toward a new home does not erase the home that helped shape me.",
    zone: "cathedral",
  },
  Andre: {
    title: "Andre",
    eyebrow: "Wedding friend",
    icon: "◇",
    body: "Andre is one of the familiar faces that turns a ceremony into a gathering of real lives and shared history. Every friend here is another reminder that love grows in community too.",
    zone: "cathedral",
  },
  Phillip: {
    title: "Phillip",
    eyebrow: "Lifelong friend",
    icon: "◇",
    body: "Phillip carries the ease of a friendship old enough to have seen whole chapters come and go. Having people like that at the wedding makes forever feel witnessed by the road behind us as well as the road ahead.",
    zone: "cathedral",
  },
  Italo: {
    title: "Italo",
    eyebrow: "Wedding friend",
    icon: "◇",
    body: "Italo is part of the circle of friends who make the cathedral feel lived-in rather than ceremonial. The day matters because the people around it do.",
    zone: "cathedral",
  },
  Gabe: {
    title: "Gabe",
    eyebrow: "Closest friend",
    icon: "◇",
    body: "Gabe is the kind of friend whose presence says there is history behind the celebration. A wedding gathers not only promises, but the people who helped two lives reach the place where they could make them.",
    zone: "cathedral",
  },
  Andressa: {
    title: "Andressa",
    eyebrow: "Andrew's sister",
    icon: "♥",
    body: "Andressa brings Andrew's family history into the room in a way no speech could. Becoming family with someone also means learning the constellation of people who helped make them who they are.",
    zone: "cathedral",
  },
};

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
  ...Object.entries(PERSON_PROFILES).map(([name, profile]) => ({
    id: `person-${slug(name)}`,
    tab: "people" as const,
    ...profile,
    unlocked: (p: JournalProgress) =>
      hasMetJournalPerson(name) ||
      (name === "Wren of the Shores" && p.weapons.includes("spark-wand")) ||
      (name === "Andrew" && p.weapons.includes("love-sword")),
  })),
];

function dynamicPeopleEntries(): JournalEntry[] {
  const known = new Set(["Maria", ...Object.keys(PERSON_PROFILES)].map((name) => name.toLowerCase()));
  return getJournalPeople()
    .filter((name) => !known.has(name.toLowerCase()))
    .sort((a, b) => a.localeCompare(b))
    .map((name) => ({
      id: `person-${slug(name)}`,
      tab: "people" as const,
      title: name,
      eyebrow: "Someone I met along the road",
      icon: "♡",
      body: `${name} became part of this journey the moment we stopped long enough to speak. I want to remember the people along the road, not only the things I carried away from it.`,
      quote: "A journey is also the people who interrupt the map.",
      unlocked: () => true,
    }));
}

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
  if (tab === "people") return [...PEOPLE, ...dynamicPeopleEntries()];
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
