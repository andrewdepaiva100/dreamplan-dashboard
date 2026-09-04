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
  ping: "quest:ping",
  equip: "quest:equip",
  bosschoice: "quest:bosschoice",
  companion: "quest:companion",
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
  weapons: string[];
  equipped: string | null;
  boss: { name: string; hp: number; max: number } | null;
  shield: { owned: boolean; ready: boolean } | null;
};

export type ModalPayload =
  | { type: "relic"; relicId: string }
  | { type: "envelope"; envelopeId: string }
  | { type: "memory" }
  | { type: "andrew"; line: string }
  | { type: "vault" }
  | { type: "info"; title: string; body: string }
  | { type: "guide" }
  | { type: "weapon"; weaponId: string; speaker: string; line: string }
  | { type: "directions"; title: string; lines: string[] }
  | { type: "guest"; id: string; name: string; role?: string; lines: string[] }
  | { type: "companion"; name: string; body: string; owned: boolean }
  | {
      type: "boss";
      name: string;
      art: string;
      intro: string;
      choices: { id: string; text: string }[];
    };
