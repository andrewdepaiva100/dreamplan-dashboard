// @ts-nocheck -- Restores reliable point-blank melee registration without changing normal weapon arcs.

const CLOSE_RADIUS = 26;

export function installMeleeHitPolish(QuestScene: any) {
  const proto = QuestScene?.prototype;
  if (!proto || proto.__meleeHitPolishInstalled) return;
  proto.__meleeHitPolishInstalled = true;

  const originalAttack = proto.attack;
  proto.attack = function meleeHitPolishAttack(...args: any[]) {
    // Mirror the base attack's early exits so point-blank correction never
    // bypasses cooldowns, weapon ownership, frozen state, or inactive player.
    if (this.frozen || !this.player?.active) return originalAttack.apply(this, args);
    if (!this.save?.weapons?.includes(this.save?.equipped_weapon ?? "")) {
      return originalAttack.apply(this, args);
    }
    const now = this.time?.now ?? 0;
    if (now < (this.swingAt ?? 0)) return originalAttack.apply(this, args);

    const w = this.equippedWeapon?.();
    if (!w) return originalAttack.apply(this, args);

    const dir =
      this.lastDir === "up"
        ? -Math.PI / 2
        : this.lastDir === "down"
          ? Math.PI / 2
          : this.facing > 0
            ? 0
            : Math.PI;

    const baseWouldHit = (x: number, y: number, pad = 0) => {
      const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, x, y);
      if (d > w.reach + pad) return false;
      const a = Math.atan2(y - this.player.y, x - this.player.x);
      return Math.abs(Phaser.Math.Angle.Wrap(a - dir)) < 1.15;
    };

    const pointBlank = (x: number, y: number, pad = 0) =>
      Phaser.Math.Distance.Between(this.player.x, this.player.y, x, y) <= CLOSE_RADIUS + pad;

    // Only correct targets that the base directional arc would miss. Targets
    // already inside the normal arc are left entirely to the original attack,
    // preventing double hits or double animal damage.
    const enemies = this.enemies?.getChildren?.() ?? [];
    for (const e of enemies) {
      if (e?.active && pointBlank(e.x, e.y) && !baseWouldHit(e.x, e.y)) {
        this.transformEnemy(e);
      }
    }

    for (const animal of this.animals ?? []) {
      if (
        animal?.active &&
        pointBlank(animal.x, animal.y, 10) &&
        !baseWouldHit(animal.x, animal.y, 10)
      ) {
        this.damageAnimal(animal, w.damage);
      }
    }

    if (
      this.boss?.active &&
      pointBlank(this.boss.x, this.boss.y, 22) &&
      !baseWouldHit(this.boss.x, this.boss.y, 22)
    ) {
      this.damageBoss(w.damage);
    }

    return originalAttack.apply(this, args);
  };
}
