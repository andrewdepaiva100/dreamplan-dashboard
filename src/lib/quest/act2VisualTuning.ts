// @ts-nocheck -- Small Act II-only visual and interaction tuning decorator.

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

  // Give each Seasonal Key a clear proper name and make the nearby interaction
  // read like opening that key. The existing E/Enter interaction and collection
  // logic remains authoritative, so progression and save behavior do not change.
  const originalAddInteractable = proto.addInteractable;
  proto.addInteractable = function act2NamedSeasonKey(
    x: number,
    y: number,
    texture: string,
    kind: string,
    label: string,
    opts: any = {},
  ) {
    if (this.save?.current_zone === ZONE && kind === "season-key" && SEASON_KEYS.has(opts?.id)) {
      label = `Open ${opts.id} Key`;
    }
    return originalAddInteractable.call(this, x, y, texture, kind, label, opts);
  };

  // Keep the four Seasonal Keys readable, but make their glow low, soft and
  // compact instead of a tall beacon. Other beacons are untouched.
  const originalAddKeyBeacon = proto.addKeyBeacon;
  proto.addKeyBeacon = function act2CompactSeasonKeyBeacon(x: number, y: number, id: string, tint: number) {
    const result = originalAddKeyBeacon.call(this, x, y, id, tint);
    if (this.save?.current_zone !== ZONE || !SEASON_KEYS.has(id)) return result;

    const beacon = this.keyBeacons?.get?.(id);
    if (!beacon) return result;

    // Much softer overall intensity and roughly half-height/footprint.
    beacon.setAlpha?.(0.34);
    beacon.setScale?.(0.64, 0.48);

    const children = beacon.list ?? beacon.getAll?.() ?? [];
    for (const child of children) {
      if (typeof child?.alpha === "number") child.setAlpha?.(Math.min(child.alpha, 0.34));

      // Pull any stacked beacon elements closer to the key so the effect hugs
      // the pickup rather than rising like a column of light.
      if (typeof child?.y === "number") child.y *= 0.58;
      if (typeof child?.scaleY === "number") child.scaleY *= 0.72;
      if (typeof child?.scaleX === "number") child.scaleX *= 0.86;
    }
    return result;
  };
}
