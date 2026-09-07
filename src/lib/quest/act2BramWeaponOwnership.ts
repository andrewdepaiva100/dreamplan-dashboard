// @ts-nocheck -- Act II migration guard for Bram's Ember Blade.
// Historical saves could already contain the Ember Blade from the old pre-Act-II
// blacksmith flow. New Act II story progression requires Bram to present it.

const ZONE = "wedding_garden";
const BLADE = "ember-blade";
const OWNERSHIP_KEY = "marias-quest-bram-ember-blade-v1";

function bramHasPresentedBlade() {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(OWNERSHIP_KEY) === "1";
  } catch {
    return false;
  }
}

function rememberBramPresentedBlade() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(OWNERSHIP_KEY, "1");
  } catch {
    // Storage is optional; the current save still owns the blade this session.
  }
}

function removeLegacyBlade(scene: any) {
  if (scene.save?.current_zone !== ZONE || bramHasPresentedBlade()) return false;
  const weapons = Array.isArray(scene.save?.weapons) ? scene.save.weapons : [];
  if (!weapons.includes(BLADE) && scene.save?.equipped_weapon !== BLADE) return false;

  scene.save.weapons = weapons.filter((weapon: string) => weapon !== BLADE);
  if (scene.save.equipped_weapon === BLADE) {
    scene.save.equipped_weapon = scene.save.weapons[0] ?? null;
  }
  return true;
}

export function installAct2BramWeaponOwnership(QuestScene: any) {
  const proto = QuestScene?.prototype;
  if (!proto || proto.__act2BramWeaponOwnershipInstalled) return;
  proto.__act2BramWeaponOwnershipInstalled = true;

  // Strip only the historical pre-Bram copy when Act II is being built.
  // Later-act saves are never touched, and once Bram has actually presented
  // the blade this migration never runs again on this device.
  const originalBuildAct2 = proto.buildAct2;
  proto.buildAct2 = function bramOwnsAct2Blade(...args: any[]) {
    const migrated = removeLegacyBlade(this);
    const result = originalBuildAct2.apply(this, args);
    if (migrated) {
      this.emitSave?.();
      this.pushHud?.(true);
    }
    return result;
  };

  // Bram's dialogue grants the blade while the scene is paused. On the first
  // resumed frame, remember that this copy came from Bram so reloads preserve it.
  const originalUpdate = proto.update;
  proto.update = function rememberBramBladeUpdate(time: number, delta: number) {
    const result = originalUpdate.call(this, time, delta);
    if (
      this.save?.current_zone === ZONE &&
      !bramHasPresentedBlade() &&
      this.save?.weapons?.includes?.(BLADE)
    ) {
      rememberBramPresentedBlade();
      this.emitSave?.();
    }
    return result;
  };
}
