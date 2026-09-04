import { supabase } from "@/integrations/supabase/client";
import type { ZoneId } from "./content";

export type QuestSave = {
  current_zone: ZoneId;
  player_health: number;
  relics_collected: string[];
  secret_envelopes_found: string[];
  vault_keys_count: number;
  wedding_completed: boolean;
  weapons: string[];
  equipped_weapon: string | null;
};

export const SLOT = "maria";

export const EMPTY_SAVE: QuestSave = {
  current_zone: "sunlit_shores",
  player_health: 5,
  relics_collected: [],
  secret_envelopes_found: [],
  vault_keys_count: 0,
  wedding_completed: false,
  weapons: [],
  equipped_weapon: null,
};

const LOCAL_KEY = "marias-quest-save-v1";

function readLocal(): QuestSave | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(LOCAL_KEY);
    if (!raw) return null;
    return { ...EMPTY_SAVE, ...(JSON.parse(raw) as Partial<QuestSave>) };
  } catch {
    return null;
  }
}

function writeLocal(save: QuestSave) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LOCAL_KEY, JSON.stringify(save));
  } catch {
    /* storage full or unavailable — cloud save still applies */
  }
}

export async function loadSave(): Promise<QuestSave | null> {
  try {
    const { data, error } = await supabase
      .from("maria_quest_saves")
      .select(
        "current_zone, player_health, relics_collected, secret_envelopes_found, vault_keys_count, wedding_completed, weapons, equipped_weapon",
      )
      .eq("slot", SLOT)
      .maybeSingle();
    if (error) throw error;
    if (!data) return readLocal();
    const remote: QuestSave = {
      current_zone: (data.current_zone as ZoneId) ?? "sunlit_shores",
      player_health: data.player_health ?? 5,
      relics_collected: Array.isArray(data.relics_collected)
        ? (data.relics_collected as string[])
        : [],
      secret_envelopes_found: Array.isArray(data.secret_envelopes_found)
        ? (data.secret_envelopes_found as string[])
        : [],
      vault_keys_count: data.vault_keys_count ?? 0,
      wedding_completed: Boolean(data.wedding_completed),
      weapons: Array.isArray(data.weapons) ? (data.weapons as string[]) : [],
      equipped_weapon: (data.equipped_weapon as string | null) ?? null,
    };
    const migrated = migrateWeapons(remote);
    writeLocal(migrated);
    return migrated;
  } catch (e) {
    console.error("[quest] load failed, using local save", e);
    return readLocal();
  }
}

export async function persistSave(save: QuestSave): Promise<void> {
  writeLocal(save);
  try {
    const { error } = await supabase
      .from("maria_quest_saves")
      .upsert(
        {
          slot: SLOT,
          current_zone: save.current_zone,
          player_health: save.player_health,
          relics_collected: save.relics_collected,
          secret_envelopes_found: save.secret_envelopes_found,
          vault_keys_count: save.vault_keys_count,
          wedding_completed: save.wedding_completed,
          weapons: save.weapons,
          equipped_weapon: save.equipped_weapon,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "slot" },
      );
    if (error) throw error;
  } catch (e) {
    console.error("[quest] cloud save failed (local copy kept)", e);
  }
}

/** Debounced cloud persistence so the 60fps loop never blocks on the network. */
export function createDebouncedSaver(delay = 1200) {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let pending: QuestSave | null = null;
  const flush = () => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    if (pending) {
      const next = pending;
      pending = null;
      void persistSave(next);
    }
  };
  return {
    queue(save: QuestSave) {
      pending = save;
      if (timer) clearTimeout(timer);
      timer = setTimeout(flush, delay);
    },
    flush,
    async flushNow(save?: QuestSave) {
      if (save) pending = save;
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      const next = pending;
      pending = null;
      if (next) await persistSave(next);
    },
  };
}

export async function hasSave(): Promise<boolean> {
  const s = await loadSave();
  if (!s) return false;
  return (
    s.relics_collected.length > 0 ||
    s.secret_envelopes_found.length > 0 ||
    s.vault_keys_count > 0 ||
    s.wedding_completed ||
    s.current_zone !== "sunlit_shores"
  );
}
