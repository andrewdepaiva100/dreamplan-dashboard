// @ts-nocheck -- Lightweight, presentation-only discovery registry for Maria's Journal.

const STORAGE_KEY = "marias-quest-journal-people-v1";
const LEGACY_SILAS_KEY = "marias-quest-journal-silas-met";

const ALIASES: Record<string, string> = {
  wren: "Wren of the Shores",
  "wren of the shores": "Wren of the Shores",
  silas: "Silas",
  evelyn: "Evelyn",
  bram: "Bram the Forgemaster",
  "bram the smith": "Bram the Forgemaster",
  "bram the forgemaster": "Bram the Forgemaster",
  andrew: "Andrew",
  elara: "Elara",
  pip: "Pip",
  maeve: "Maeve",
};

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

function personFromInteractable(it: any) {
  if (!it?.enabled && it?.enabled !== undefined) return "";
  const kind = String(it?.kind ?? "").toLowerCase();
  const id = String(it?.id ?? "").toLowerCase();

  if (kind === "last-crossing-silas" || id === "silas") return "Silas";
  if (kind === "garden-keeper") return "Evelyn";
  if (kind === "smith") return "Bram the Forgemaster";
  if (kind === "andrew") return "Andrew";

  const personLike = /guest|guide|npc|keeper|smith|andrew|pastor|silas|villager|companion|friend/.test(kind);
  if (!personLike) return "";
  return cleanName(it?.name ?? it?.label ?? it?.id);
}

function personFromModal(payload: any) {
  const type = String(payload?.type ?? "").toLowerCase();
  if (type === "andrew") return "Andrew";
  if (["guest", "guidetalk", "companion"].includes(type)) return cleanName(payload?.name);
  if (type === "weapon") return cleanName(payload?.speaker);
  return "";
}

export function installJournalDiscovery(QuestScene: any) {
  const proto = QuestScene?.prototype;
  if (!proto || proto.__journalDiscoveryInstalled) return;
  proto.__journalDiscoveryInstalled = true;

  const originalInteract = proto.interact;
  if (typeof originalInteract === "function") {
    proto.interact = function journalDiscoveryInteract(...args: any[]) {
      try {
        const it = typeof this.nearest === "function" ? this.nearest() : null;
        const name = personFromInteractable(it);
        if (name) registerJournalPerson(name);
      } catch {
        // The interaction itself must remain authoritative even if discovery fails.
      }
      return originalInteract.apply(this, args);
    };
  }

  const originalOpenModal = proto.openModal;
  if (typeof originalOpenModal === "function") {
    proto.openModal = function journalDiscoveryModal(payload: any, ...args: any[]) {
      try {
        const name = personFromModal(payload);
        if (name) registerJournalPerson(name);
      } catch {
        // Presentation-only side effect; never block a modal.
      }
      return originalOpenModal.call(this, payload, ...args);
    };
  }
}
