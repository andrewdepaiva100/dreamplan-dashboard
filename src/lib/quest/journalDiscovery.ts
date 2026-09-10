// @ts-nocheck -- Lightweight, presentation-only discovery registry for Maria's Journal.

// v1 could falsely unlock names that were only mentioned inside another person's
// dialogue (for example Andre inside Andrew). Do not migrate that contaminated
// registry: v2 starts clean and records only the actual conversation speaker.
const STORAGE_KEY = "marias-quest-journal-people-v2";
const LEGACY_SILAS_KEY = "marias-quest-journal-silas-met";
const UPDATED_EVENT = "marias-quest-journal-people-updated";

const ALIASES: Record<string, string> = {
  wren: "Wren of the Shores",
  "wren of the shores": "Wren of the Shores",
  silas: "Silas",
  elara: "Elara",
  pip: "Pip",
  maeve: "Maeve",
  lorena: "Lorena",
  ivy: "Ivy the Gardener",
  "ivy the gardener": "Ivy the Gardener",
  evelyn: "Evelyn",
  bram: "Bram the Forgemaster",
  "bram the smith": "Bram the Forgemaster",
  "bram the forgemaster": "Bram the Forgemaster",
  marlowe: "Marlowe the Bellkeeper",
  "marlowe the bellkeeper": "Marlowe the Bellkeeper",
  andrew: "Andrew",
  astra: "Astra the Stargazer",
  "astra the stargazer": "Astra the Stargazer",
  "pastor adriel": "Pastor Adriel",
  adriel: "Pastor Adriel",
  "sister lumen": "Sister Lumen",
  lumen: "Sister Lumen",
  "pastor alcir": "Pastor Alcir",
  alcir: "Pastor Alcir",
  alicia: "Alicia",
  pedro: "Pedro",
  gianluca: "Gianluca",
  raquel: "Mom (Raquel)",
  "mom raquel": "Mom (Raquel)",
  "mom (raquel)": "Mom (Raquel)",
  marcos: "Dad (Marcos)",
  "dad marcos": "Dad (Marcos)",
  "dad (marcos)": "Dad (Marcos)",
  silvia: "Mom (Silvia)",
  "mom silvia": "Mom (Silvia)",
  "mom (silvia)": "Mom (Silvia)",
  gustavo: "Dad (Gustavo)",
  "dad gustavo": "Dad (Gustavo)",
  "dad (gustavo)": "Dad (Gustavo)",
  andre: "Andre",
  andré: "Andre",
  phillip: "Phillip",
  italo: "Italo",
  gabe: "Gabe",
  andressa: "Andressa",
};

const JOURNAL_PEOPLE = [
  "Wren of the Shores",
  "Silas",
  "Elara",
  "Pip",
  "Maeve",
  "Lorena",
  "Ivy the Gardener",
  "Evelyn",
  "Bram the Forgemaster",
  "Alicia",
  "Marlowe the Bellkeeper",
  "Andrew",
  "Astra the Stargazer",
  "Pastor Adriel",
  "Sister Lumen",
  "Pastor Alcir",
  "Pedro",
  "Gianluca",
  "Mom (Raquel)",
  "Dad (Marcos)",
  "Mom (Silvia)",
  "Dad (Gustavo)",
  "Andre",
  "Phillip",
  "Italo",
  "Gabe",
  "Andressa",
] as const;

const DIALOGUE_SELECTORS = [
  '[role="dialog"]',
  '[class*="dialogue"]',
  '[class*="conversation"]',
  '[class*="modal"]',
  '[id*="dialogue"]',
  '[id*="conversation"]',
  '#quest-wren-intro',
].join(",");

const GENERIC_NAMES = new Set([
  "guest", "guide", "villager", "traveler", "traveller", "companion", "keeper", "smith", "pastor", "friend",
]);

function cleanName(value: unknown) {
  let name = String(value ?? "").trim();
  if (!name) return "";
  name = name
    .replace(/^(?:e\s*[·•-]\s*)/i, "")
    .replace(/^(?:talk|speak|chat)\s+(?:to|with)\s+/i, "")
    .replace(/^(?:meet|visit)\s+/i, "")
    .replace(/\s+[—–-]\s+press\s+.+$/i, "")
    .replace(/\s*\([^)]*press[^)]*\)\s*$/i, "")
    .replace(/[.!]+$/, "")
    .trim();
  const alias = ALIASES[name.toLowerCase()];
  return alias ?? name;
}

function validPersonName(name: string) {
  if (!name || name.length < 2 || name.length > 80) return false;
  if (name.toLowerCase() === "maria") return false;
  if (GENERIC_NAMES.has(name.toLowerCase())) return false;
  if (/^(?:the\s+)?(?:door|gate|portal|relic|letter|envelope|chest|hearth|bed|stone|shrine|house|home|map|sign|fountain|conservatory|cathedral|temple|crossing blade)$/i.test(name)) return false;
  return /[A-Za-zÀ-ÿ]/.test(name);
}

export function getJournalPeople(): string[] {
  if (typeof window === "undefined") return [];
  const found = new Set<string>();
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]");
    if (Array.isArray(parsed)) {
      for (const value of parsed) {
        const name = cleanName(value);
        if (validPersonName(name)) found.add(name);
      }
    }
    // Preserve Silas for players who met him before the shared registry existed.
    if (window.localStorage.getItem(LEGACY_SILAS_KEY) === "1") found.add("Silas");
  } catch {
    // Journal discovery is optional presentation state; gameplay must never fail here.
  }
  return [...found];
}

export function registerJournalPerson(value: unknown) {
  if (typeof window === "undefined") return;
  const name = cleanName(value);
  if (!validPersonName(name)) return;
  try {
    const people = new Set(getJournalPeople());
    if (people.has(name)) return;
    people.add(name);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...people]));
    window.dispatchEvent(new CustomEvent(UPDATED_EVENT, { detail: { name } }));
  } catch {
    // Never let optional Journal persistence interfere with an interaction.
  }
}

export function hasMetJournalPerson(value: unknown) {
  const name = cleanName(value);
  if (!name) return false;
  const target = name.toLowerCase();
  return getJournalPeople().some((person) => person.toLowerCase() === target);
}

function dialogueRootFor(node: Element) {
  if (node.matches?.(DIALOGUE_SELECTORS)) return node;
  return node.closest?.(DIALOGUE_SELECTORS) ?? node.querySelector?.(DIALOGUE_SELECTORS) ?? null;
}

function normalizeForMatch(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function boundaryMatchIndex(haystack: string, needle: string) {
  const source = normalizeForMatch(haystack);
  const target = normalizeForMatch(needle);
  if (!target) return -1;

  let from = 0;
  while (from <= source.length - target.length) {
    const index = source.indexOf(target, from);
    if (index < 0) return -1;
    const before = index === 0 ? "" : source[index - 1]!;
    const after = index + target.length >= source.length ? "" : source[index + target.length]!;
    const beforeOk = !before || !/[a-z0-9]/i.test(before);
    const afterOk = !after || !/[a-z0-9]/i.test(after);
    if (beforeOk && afterOk) return index;
    from = index + 1;
  }
  return -1;
}

function dialogueSpeaker(root: Element) {
  // Character presentation consistently puts the actual speaker in the title/header
  // before dialogue copy. Limit matching to the opening text so names merely mentioned
  // later in conversation never unlock their Journal entries.
  const openingText = String(root.textContent ?? "").replace(/\s+/g, " ").trim().slice(0, 320);
  if (!openingText) return "";

  let best: { name: string; index: number; length: number } | null = null;
  for (const canonical of JOURNAL_PEOPLE) {
    const variants = [canonical, ...Object.entries(ALIASES)
      .filter(([, target]) => target === canonical)
      .map(([alias]) => alias)];

    for (const variant of variants) {
      const index = boundaryMatchIndex(openingText, variant);
      if (index < 0) continue;
      const candidate = { name: canonical, index, length: variant.length };
      if (!best || candidate.index < best.index || (candidate.index === best.index && candidate.length > best.length)) {
        best = candidate;
      }
    }
  }
  return best?.name ?? "";
}

function registerDialogueSpeaker(root: Element) {
  const speaker = dialogueSpeaker(root);
  if (speaker) registerJournalPerson(speaker);
}

function inspectAddedNode(node: Node) {
  if (!(node instanceof Element)) return;
  const root = dialogueRootFor(node);
  if (root) registerDialogueSpeaker(root);
}

function installPassiveDialogueDiscovery() {
  if (typeof window === "undefined" || typeof document === "undefined") return;
  if ((window as any).__mariasQuestJournalDialogueDiscoveryInstalled) return;
  (window as any).__mariasQuestJournalDialogueDiscoveryInstalled = true;

  const start = () => {
    if (!document.body) return;
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of Array.from(mutation.addedNodes)) inspectAddedNode(node);
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    // Catch a dialogue that happened to mount in the same frame as this module.
    for (const root of Array.from(document.querySelectorAll(DIALOGUE_SELECTORS))) {
      registerDialogueSpeaker(root);
    }
  };

  if (document.body) start();
  else document.addEventListener("DOMContentLoaded", start, { once: true });
}

// Journal discovery is deliberately passive. It observes only conversation DOM
// and never wraps QuestScene.interact/openModal, so it cannot alter quest runtime.
installPassiveDialogueDiscovery();
