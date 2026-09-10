// @ts-nocheck -- Lightweight, presentation-only discovery registry for Maria's Journal.

const STORAGE_KEY = "marias-quest-journal-people-v1";
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

function registerPeopleMentionedByDialogue(root: Element) {
  const text = String(root.textContent ?? "").replace(/\s+/g, " ").trim();
  if (!text) return;
  const lower = text.toLowerCase();

  for (const canonical of JOURNAL_PEOPLE) {
    const variants = [canonical, ...Object.entries(ALIASES)
      .filter(([, target]) => target === canonical)
      .map(([alias]) => alias)];
    if (variants.some((variant) => lower.includes(variant.toLowerCase()))) {
      registerJournalPerson(canonical);
    }
  }
}

function inspectAddedNode(node: Node) {
  if (!(node instanceof Element)) return;
  const root = dialogueRootFor(node);
  if (root) registerPeopleMentionedByDialogue(root);
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
      registerPeopleMentionedByDialogue(root);
    }
  };

  if (document.body) start();
  else document.addEventListener("DOMContentLoaded", start, { once: true });
}

// Journal discovery is deliberately passive. It observes only conversation DOM
// and never wraps QuestScene.interact/openModal, so it cannot alter quest runtime.
installPassiveDialogueDiscovery();
