import type { ZoneId } from "./content";

export const EV = {
  hud: "quest:hud",
  modal: "quest:modal",
  toast: "quest:toast",
  save: "quest:save",
  ceremony: "quest:ceremony",
  resume: "quest:resume",
  stick: "quest:stick",
  action: "quest:action",
  dash: "quest:dash",
  interact: "quest:interact",
  guide: "quest:guide",
  act: "quest:act",
  travel: "quest:travel",
  guideme: "quest:guideme",
} as const;

export type HudState = {
  health: number;
  maxHealth: number;
  stamina: number;
  dashProgress: number;
  zone: ZoneId;
  zoneTitle: string;
  act: string;
  objective: string;
  relics: string[];
  envelopes: string[];
  keys: number;
  prompt: string | null;
  weddingCompleted: boolean;
};

export type ModalPayload =
  | { type: "relic"; relicId: string }
  | { type: "envelope"; envelopeId: string }
  | { type: "memory" }
  | { type: "andrew"; line: string }
  | { type: "vault" }
  | { type: "info"; title: string; body: string }
  | { type: "guide" };
