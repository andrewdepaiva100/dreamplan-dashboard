// @ts-nocheck -- Small Act II-only visual tuning decorator.

const ZONE = "wedding_garden";
const SEASON_KEYS = new Set(["Spring", "Summer", "Autumn", "Winter"]);

export function installAct2VisualTuning(QuestScene: any) {
  const proto = QuestScene?.prototype;
  if (!proto || proto.__act2VisualTuningInstalled) return;
  proto.__act2VisualTuningInstalled = true;

  // Reduce only the ambient scatter in the Wedding Garden by 15%.
  // Story flowers around Evelyn and the final rose reveal remain untouched.
  const originalScatterDecor = proto.scatterDecor;
  proto.scatterDecor = function act2ReducedFlowers(seed: number, opts: any) {
    if (this.save?.current_zone !== ZONE || !opts || typeof opts.flowers !== "number") {
      return originalScatterDecor.call(this, seed, opts);
    }
    return originalScatterDecor.call(this, seed, {
      ...opts,
      flowers: Math.round(opts.flowers * 0.85),
    });
  };

  // Keep the four Seasonal Keys readable while making their beacons much less
  // overpowering. Other beacons (letters, relic presentation, etc.) are unchanged.
  const originalAddKeyBeacon = proto.addKeyBeacon;
  proto.addKeyBeacon = function act2SofterSeasonKeyBeacon(x: number, y: number, id: string, tint: number) {
    const result = originalAddKeyBeacon.call(this, x, y, id, tint);
    if (this.save?.current_zone !== ZONE || !SEASON_KEYS.has(id)) return result;

    const beacon = this.keyBeacons?.get?.(id);
    if (!beacon) return result;

    // Tone down the entire glow stack while preserving the colored identity.
    beacon.setAlpha?.(0.58);
    beacon.setScale?.(0.88);
    const children = beacon.list ?? beacon.getAll?.() ?? [];
    for (const child of children) {
      if (typeof child?.alpha === "number") child.setAlpha?.(Math.min(child.alpha, 0.58));
      if (child?.setBlendMode && child?.blendMode != null) {
        // Do not change blend mode; only intensity/footprint are reduced above.
      }
    }
    return result;
  };
}
