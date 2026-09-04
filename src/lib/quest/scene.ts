import * as Phaser from "phaser";
import {
  ACT_BOSSES,
  ACT_GUIDES,
  BLACKSMITH,
  DEFAULT_WEAPON,
  ENVELOPES,
  RELICS,
  WEAPON_BY_ID,
  REST_STONE_LINES,
  ZONES,
  type ZoneId,
} from "./content";
import { EMPTY_SAVE, type QuestSave } from "./save";
import {
  SOLID_TILES,
  T,
  TILE,
  TILE_COUNT,
  buildSprites,
  buildTileset,
  preloadQuestArt,
} from "./textures";

export { EV } from "./events";
export type { HudState, ModalPayload } from "./events";
import { EV, type HudState, type ModalPayload } from "./events";

type Interactable = {
  obj: Phaser.GameObjects.Sprite;
  kind: string;
  id?: string;
  label: string;
  radius: number;
  enabled: boolean;
  data?: Record<string, unknown>;
};

/** Layouts are authored on a 132x102 design grid and scaled onto the real map. */
const DESIGN_W = 132;
const DESIGN_H = 102;
const MAP_W = 180;
const MAP_H = 180;
const SX = MAP_W / DESIGN_W;
const SY = MAP_H / DESIGN_H;
const SPEED = 120;
const DASH_MS = 170;
const DASH_COOLDOWN = 2000;

function irnd(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

export class QuestScene extends Phaser.Scene {
  save: QuestSave = { ...EMPTY_SAVE };

  private mapW = MAP_W;
  private mapH = MAP_H;
  private sxF = SX;
  private syF = SY;

  private player!: Phaser.Physics.Arcade.Sprite;
  private layer!: Phaser.Tilemaps.TilemapLayer;
  private map!: Phaser.Tilemaps.Tilemap;
  private aura!: Phaser.GameObjects.Arc;
  private enemies!: Phaser.Physics.Arcade.Group;
  private petals!: Phaser.Physics.Arcade.Group;
  private decor!: Phaser.GameObjects.Group;
  private blocks!: Phaser.Physics.Arcade.Group;
  private interactables: Interactable[] = [];
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private keys!: Record<string, Phaser.Input.Keyboard.Key>;

  private stick = { x: 0, y: 0 };
  private stamina = 100;
  private dashUntil = 0;
  private dashReadyAt = 0;
  private invulnUntil = 0;
  private shieldReadyAt = 0;
  private lastAura = 0;
  private lastHud = "";
  private animStep = 0;
  private lastStepAt = 0;
  private facing = 1;
  private lastDir: "down" | "up" | "side" = "down";
  private frozen = false;
  private objective = "";
  private prompt: string | null = null;
  private zoneState: Record<string, unknown> = {};
  private solidDecor!: Phaser.Physics.Arcade.StaticGroup;
  private promptText!: Phaser.GameObjects.Text;
  private arrow!: Phaser.GameObjects.Triangle;
  private boss: Phaser.Physics.Arcade.Sprite | null = null;
  spawnPoint = new Phaser.Math.Vector2(0, 0);
  private animals: Phaser.GameObjects.Sprite[] = [];
  private landmark: { sprite: Phaser.GameObjects.Sprite; title: string; body: string } | null = null;
  private cutscenePlayed = false;
  private autopilot: Phaser.Math.Vector2 | null = null;
  private companion: Phaser.GameObjects.Sprite | null = null;
  private bossPhase = 0;
  private bossHits = 0;
  private bossTimer?: Phaser.Time.TimerEvent;
  private bossHp = 0;
  private bossMax = 0;
  private bossName = "";
  private bossHitAt = 0;
  private swingAt = 0;

  constructor() {
    super("quest");
  }

  init(data: { save?: QuestSave }) {
    if (data?.save) this.save = { ...EMPTY_SAVE, ...data.save };
  }

  preload() {
    preloadQuestArt(this);
  }

  create() {
    buildTileset(this);
    buildSprites(this);

    this.frozen = false;
    this.stamina = 100;
    this.interactables = [];
    this.zoneState = {};
    this.boss = null;
    this.bossPhase = 0;
    this.bossHits = 0;
    this.bossHp = 0;
    this.bossMax = 0;
    this.bossName = "";
    if (this.save.weapons.length === 0) this.save.weapons = [];
    this.animals = [];
    this.landmark = null;
    this.cutscenePlayed = false;
    this.autopilot = null;
    this.companion = null;

    this.buildZone(this.save.current_zone);
    this.spawnCompanion();

    // ---- groups (pooled) -------------------------------------------------
    this.enemies = this.physics.add.group({ maxSize: 60, runChildUpdate: false });
    this.petals = this.physics.add.group({
      maxSize: 80,
      defaultKey: "petal",
      runChildUpdate: false,
    });
    this.decor = this.add.group({ maxSize: 80 });

    this.spawnEnemiesForZone(this.save.current_zone);

    this.physics.add.collider(this.player, this.layer);
    this.physics.add.collider(this.enemies, this.layer);
    this.physics.add.overlap(this.player, this.enemies, (_p, e) =>
      this.hurtPlayer(e as Phaser.Physics.Arcade.Sprite),
    );
    this.physics.add.overlap(this.petals, this.enemies, (p, e) => {
      (p as Phaser.Physics.Arcade.Sprite).setActive(false).setVisible(false).body!.stop();
      this.transformEnemy(e as Phaser.Physics.Arcade.Sprite);
    });

    // ---- input -----------------------------------------------------------
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.keys = this.input.keyboard!.addKeys(
      "W,A,S,D,SPACE,J,SHIFT,K,E,ENTER",
    ) as Record<string, Phaser.Input.Keyboard.Key>;
    this.keys["SPACE"]!.on("down", () => this.attack());
    this.keys["J"]!.on("down", () => this.attack());
    this.keys["SHIFT"]!.on("down", () => this.dash());
    this.keys["K"]!.on("down", () => this.dash());
    this.keys["E"]!.on("down", () => this.interact());
    this.keys["ENTER"]!.on("down", () => this.interact());

    const g = this.game.events;
    g.on(EV.stick, this.onStick, this);
    g.on(EV.action, this.attack, this);
    g.on(EV.dash, this.dash, this);
    g.on(EV.interact, this.interact, this);
    g.on(EV.resume, this.onResume, this);
    g.on(EV.travel, this.travelTo, this);
    g.on(EV.guideme, this.startAutopilot, this);
    g.on(EV.equip, this.equipWeapon, this);

    this.events.once("shutdown", () => {
      g.off(EV.stick, this.onStick, this);
      g.off(EV.action, this.attack, this);
      g.off(EV.dash, this.dash, this);
      g.off(EV.interact, this.interact, this);
      g.off(EV.resume, this.onResume, this);
      g.off(EV.travel, this.travelTo, this);
      g.off(EV.guideme, this.startAutopilot, this);
      g.off(EV.equip, this.equipWeapon, this);
      this.bossTimer?.remove();
    });

    // ---- camera ----------------------------------------------------------
    this.cameras.main.setBounds(0, 0, this.mapW * TILE, this.mapH * TILE);
    this.physics.world.setBounds(0, 0, this.mapW * TILE, this.mapH * TILE);
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);
    this.cameras.main.setZoom(this.scale.width < 620 ? 1.1 : 1.45);
    this.cameras.main.fadeIn(500, 8, 12, 30);

    // warm romantic sunlight wash across the whole scene
    const sunlight = this.add.rectangle(
      this.cameras.main.centerX,
      this.cameras.main.centerY,
      this.cameras.main.width * 3,
      this.cameras.main.height * 3,
      0xffe6b0,
      0.14,
    );
    sunlight.setScrollFactor(0);
    sunlight.setDepth(90);
    sunlight.setBlendMode(Phaser.BlendModes.ADD);
    this.tweens.add({
      targets: sunlight,
      alpha: { from: 0.1, to: 0.2 },
      duration: 3800,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    this.pushHud(true);
    this.emitSave();
  }

  // =======================================================================
  // ZONE CONSTRUCTION
  // =======================================================================

  private makeMap(base: number, seed: number, decorate: (d: number[][]) => void) {
    const rnd = irnd(seed);
    const data: number[][] = [];
    for (let y = 0; y < this.mapH; y++) {
      const row: number[] = [];
      for (let x = 0; x < this.mapW; x++) {
        const edge = x === 0 || y === 0 || x === this.mapW - 1 || y === this.mapH - 1;
        // full-colour ground: lush meadow mixed with the zone's own base tile
        row.push(edge ? T.WALL : rnd() < 0.5 ? T.MEADOW : base);
      }
      data.push(row);
    }
    decorate(data);
    this.map = this.make.tilemap({ data, tileWidth: TILE, tileHeight: TILE });
    const tiles = this.map.addTilesetImage("quest-tiles", "quest-tiles", TILE, TILE, 0, 0)!;
    this.layer = this.map.createLayer(0, tiles, 0, 0)!;
    this.layer.setCollision(SOLID_TILES as unknown as number[]);
    this.layer.setCullPadding(3, 3);
    this.layer.setSkipCull(false);
  }

  /** design-grid tile -> real grid tile */
  private sx(n: number) {
    return Math.round(n * this.sxF);
  }
  private sy(n: number) {
    return Math.round(n * this.syF);
  }
  /** design-grid tile -> world pixels */
  wx(n: number) {
    return n * this.sxF * TILE;
  }
  wy(n: number) {
    return n * this.syF * TILE;
  }

  private rect(d: number[][], x: number, y: number, w: number, h: number, t: number) {
    const x0 = this.sx(x);
    const y0 = this.sy(y);
    const w0 = Math.max(1, Math.round(w * this.sxF));
    const h0 = Math.max(1, Math.round(h * this.syF));
    for (let j = y0; j < y0 + h0; j++)
      for (let i = x0; i < x0 + w0; i++)
        if (d[j] && i >= 0 && i < this.mapW && j >= 0 && j < this.mapH) d[j]![i] = t;
  }

  /** Carve a road/trail through the design grid along a waypoint chain. */
  private road(d: number[][], pts: [number, number][], w = 3, tile = T.PATH) {
    for (let n = 0; n < pts.length - 1; n++) {
      const [ax, ay] = pts[n]!;
      const [bx, by] = pts[n + 1]!;
      this.rect(d, Math.min(ax, bx), ay, Math.abs(bx - ax) + w, w, tile);
      this.rect(d, bx, Math.min(ay, by), w, Math.abs(by - ay) + w, tile);
    }
  }

  private addPlayer(tx: number, ty: number) {
    const x = this.wx(Phaser.Math.Clamp(tx, 2, DESIGN_W - 3));
    const y = this.wy(Phaser.Math.Clamp(ty, 2, DESIGN_H - 3));
    this.makeWalkAnims("maria");
    this.makeWalkAnims("andrew");
    this.spawnPoint.set(x, y);
    this.player = this.physics.add.sprite(x, y, "maria-down-0");
    this.player.anims.play("maria-idle-down");
    this.player.setScale(1.1);
    this.player.setSize(13, 11).setOffset(5.5, 21.5);
    this.player.setCollideWorldBounds(true);
    this.player.setDepth(20);
    this.promptText = this.add
      .text(this.player.x, this.player.y - 36, "", {
        fontFamily: "system-ui, sans-serif",
        fontSize: "11px",
        color: "#0b1e3d",
        backgroundColor: "#ffd977",
        padding: { x: 6, y: 3 },
      })
      .setOrigin(0.5, 1)
      .setDepth(60)
      .setVisible(false);
    this.aura = this.add
      .circle(this.player.x, this.player.y, 92, 0xfff0bf, 0.13)
      .setDepth(5);
    this.tweens.add({
      targets: this.aura,
      alpha: { from: 0.09, to: 0.2 },
      scale: { from: 0.94, to: 1.05 },
      duration: 1600,
      yoyo: true,
      repeat: -1,
    });
  }

  /** 4-directional walk + idle animations for a character sheet. */
  private makeWalkAnims(who: "maria" | "andrew") {
    for (const dir of ["down", "side", "up"] as const) {
      if (!this.anims.exists(`${who}-walk-${dir}`)) {
        this.anims.create({
          key: `${who}-walk-${dir}`,
          frames: [
            { key: `${who}-${dir}-0` },
            { key: `${who}-${dir}-1` },
            { key: `${who}-${dir}-0` },
            { key: `${who}-${dir}-2` },
          ],
          frameRate: 9,
          repeat: -1,
        });
      }
      if (!this.anims.exists(`${who}-idle-${dir}`)) {
        this.anims.create({
          key: `${who}-idle-${dir}`,
          frames: [{ key: `${who}-${dir}-0` }],
          frameRate: 1,
          repeat: -1,
        });
      }
    }
  }

  // =======================================================================
  // LANDMARKS / WILDLIFE / TRAVEL
  // =======================================================================

  /** Places the act's flagship building with a solid footprint and a cutscene trigger. */
  private addLandmark(key: string, tx: number, ty: number, title: string, body: string) {
    const sprite = this.add.sprite(this.wx(tx), this.wy(ty), key).setDepth(11);
    if (!this.solidDecor) this.solidDecor = this.physics.add.staticGroup();
    const foot = this.solidDecor.create(
      sprite.x,
      sprite.y + sprite.height * 0.32,
      key,
    ) as Phaser.Physics.Arcade.Sprite;
    foot.setVisible(false);
    const b = foot.body as Phaser.Physics.Arcade.StaticBody;
    b.setSize(sprite.width * 0.72, Math.max(16, sprite.height * 0.22));
    b.updateFromGameObject?.();
    this.landmark = { sprite, title, body };
    this.tweens.add({
      targets: sprite,
      alpha: { from: 0.94, to: 1 },
      duration: 2600,
      yoyo: true,
      repeat: -1,
    });
  }

  /** Wandering, non-blocking wildlife that makes the realm feel alive. */
  private spawnAnimals(seed: number, specs: [string, number, number, number][]) {
    const rnd = irnd(seed);
    for (const [key, tx, ty, count] of specs) {
      for (let i = 0; i < count; i++) {
        const x = this.wx(tx + (rnd() - 0.5) * 12);
        const y = this.wy(ty + (rnd() - 0.5) * 8);
        const a = this.add.sprite(x, y, key).setDepth(9);
        a.setFlipX(rnd() < 0.5);
        this.animals.push(a);
        const roam = () => {
          const nx = Phaser.Math.Clamp(a.x + (rnd() - 0.5) * 200, 64, this.mapW * TILE - 64);
          const ny = Phaser.Math.Clamp(a.y + (rnd() - 0.5) * 160, 64, this.mapH * TILE - 64);
          a.setFlipX(nx < a.x);
          this.tweens.add({
            targets: a,
            x: nx,
            y: ny,
            duration: 2600 + rnd() * 3200,
            ease: "Sine.easeInOut",
            onComplete: () => this.time.delayedCall(700 + rnd() * 2600, roam),
          });
        };
        this.time.delayedCall(rnd() * 2000, roam);
      }
    }
  }

  /** Andrew walks with Maria once the ceremony is complete (free roam). */
  private spawnCompanion() {
    if (!this.save.wedding_completed || this.save.current_zone === "cathedral") return;
    this.companion = this.add
      .sprite(this.player.x - 40, this.player.y + 12, "andrew-down-0")
      .setDepth(19)
      .setScale(1.1);
    this.companion.anims.play("andrew-idle-down");
  }

  private updateCompanion() {
    const c = this.companion;
    if (!c) return;
    const dx = this.player.x - 34 - c.x;
    const dy = this.player.y + 10 - c.y;
    const d = Math.hypot(dx, dy);
    const moving = d > 12;
    if (moving) {
      const step = Math.min(SPEED * 1.05, d * 4) / 60;
      c.x += (dx / d) * step * 4;
      c.y += (dy / d) * step * 4;
    }
    let dir: "down" | "up" | "side" = "down";
    if (Math.abs(dx) > Math.abs(dy)) {
      dir = "side";
      c.setFlipX(dx < 0);
    } else dir = dy < 0 ? "up" : "down";
    const key = `andrew-${moving ? "walk" : "idle"}-${dir}`;
    if (c.anims.currentAnim?.key !== key) c.anims.play(key, true);
    c.setDepth(c.y > this.player.y ? 21 : 19);
  }

  /** Which acts the player may fast-travel to (everything reached so far). */
  zoneOrder(): ZoneId[] {
    return ["sunlit_shores", "wedding_garden", "the_haven", "starry_ascent", "cathedral"];
  }

  unlockedZones(): ZoneId[] {
    const order = this.zoneOrder();
    if (this.save.wedding_completed) return order;
    return order.slice(0, order.indexOf(this.save.current_zone) + 1);
  }

  /** Live minimap data for the React map overlay. */
  getMapSnapshot() {
    const step = 3;
    const rows: string[] = [];
    for (let y = 0; y < this.mapH; y += step) {
      let row = "";
      for (let x = 0; x < this.mapW; x += step) {
        row += String(this.layer?.getTileAt(x, y)?.index ?? 0);
      }
      rows.push(row);
    }
    const pins: { x: number; y: number; label: string; kind: string }[] = [];
    if (this.landmark)
      pins.push({
        x: this.landmark.sprite.x / (this.mapW * TILE),
        y: this.landmark.sprite.y / (this.mapH * TILE),
        label: this.landmark.title,
        kind: "landmark",
      });
    for (const it of this.interactables) {
      if (!it.enabled || !it.obj.active) continue;
      if (!["relic", "gateway", "guide", "vault", "andrew", "andrew-ceremony"].includes(it.kind))
        continue;
      pins.push({
        x: it.obj.x / (this.mapW * TILE),
        y: it.obj.y / (this.mapH * TILE),
        label: it.label,
        kind: it.kind,
      });
    }
    return {
      rows,
      player: { x: this.player.x / (this.mapW * TILE), y: this.player.y / (this.mapH * TILE) },
      pins,
      zone: this.save.current_zone,
      unlocked: this.unlockedZones(),
    };
  }

  private travelTo(zone: ZoneId) {
    if (zone === this.save.current_zone) {
      this.onResume();
      return;
    }
    if (!this.unlockedZones().includes(zone)) {
      this.emitToast("That realm is still sealed — reach it on foot first.");
      return;
    }
    this.save.current_zone = zone;
    this.emitSave();
    this.onResume();
    this.cameras.main.fadeOut(380, 0, 0, 0);
    this.time.delayedCall(420, () => this.scene.restart({ save: this.save }));
  }

  /** "Guide Me": Maria walks herself toward the current objective. */
  private startAutopilot() {
    this.onResume();
    const target = this.objectiveTarget();
    if (!target) {
      this.emitToast("No path to trace right now — explore a little further.");
      return;
    }
    this.autopilot = new Phaser.Math.Vector2(target.x, target.y);
    this.emitToast("A path of petals unfolds toward your goal.");
  }

  private cancelAutopilot() {
    this.autopilot = null;
  }

  /** Fires once when Maria first reaches the act's flagship landmark. */
  private checkCutscene() {
    if (this.cutscenePlayed || !this.landmark) return;
    const l = this.landmark;
    if (Phaser.Math.Distance.Between(this.player.x, this.player.y, l.sprite.x, l.sprite.y) > 230)
      return;
    this.cutscenePlayed = true;
    this.autopilot = null;
    this.frozen = true;
    this.player.setVelocity(0, 0);
    this.physics.pause();
    const cam = this.cameras.main;
    cam.stopFollow();
    cam.pan(l.sprite.x, l.sprite.y, 900, "Sine.easeInOut");
    cam.zoomTo(cam.zoom * 1.18, 900);
    this.game.events.emit(EV.act, { title: l.title });
    this.time.delayedCall(1500, () => {
      cam.pan(this.player.x, this.player.y, 600, "Sine.easeInOut");
      cam.zoomTo(this.scale.width < 620 ? 1.1 : 1.45, 600);
      cam.startFollow(this.player, true, 0.12, 0.12);
      this.openModal({ type: "info", title: l.title, body: l.body });
    });
  }

  private addInteractable(
    x: number,
    y: number,
    texture: string,
    kind: string,
    label: string,
    opts: { id?: string; radius?: number; data?: Record<string, unknown>; depth?: number } = {},
  ) {
    const obj = this.add.sprite(x, y, texture).setDepth(opts.depth ?? 12);
    if (texture.startsWith("andrew")) obj.setScale(1.1);
    this.tweens.add({
      targets: obj,
      y: y - 3,
      duration: 1400,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
    const it: Interactable = {
      obj,
      kind,
      label,
      radius: opts.radius ?? 46,
      enabled: true,
      ...(opts.id !== undefined ? { id: opts.id } : {}),
      ...(opts.data !== undefined ? { data: opts.data } : {}),
    };
    this.interactables.push(it);
    return it;
  }

  private has(list: string[], id: string) {
    return list.includes(id);
  }

  /**
   * Dense, collision-enabled environment decor. Solid props (houses, trees,
   * fences, lamps, benches) join a static body group Maria collides with;
   * flowers and bridges are flat ground dressing.
   */
  private scatterDecor(
    seed: number,
    opts: {
      village?: [number, number][];
      groves?: [number, number, number][];
      lamps?: [number, number][];
      benches?: [number, number][];
      fences?: [number, number, number][];
      bridges?: [number, number][];
      flowers?: number;
      border?: boolean;
    },
  ) {
    const rnd = irnd(seed);
    if (!this.solidDecor) this.solidDecor = this.physics.add.staticGroup();

    const solid = (tx: number, ty: number, key: string, footH = 0.35) => {
      const s = this.solidDecor.create(
        this.wx(tx),
        this.wy(ty),
        key,
      ) as Phaser.Physics.Arcade.Sprite;
      s.setDepth(10 + ty * 0.01);
      const b = s.body as Phaser.Physics.Arcade.StaticBody;
      const h = Math.max(10, s.height * footH);
      b.setSize(s.width * 0.7, h);
      b.setOffset(s.width * 0.15, s.height - h);
      b.updateFromGameObject?.();
      return s;
    };

    for (const [x, y] of opts.village ?? []) {
      solid(x, y, rnd() < 0.5 ? "house" : "cottage", 0.3);
    }
    for (const [x, y, n] of opts.groves ?? []) {
      for (let i = 0; i < n; i++) {
        const tx = x + Math.round((rnd() - 0.5) * 10);
        const ty = y + Math.round((rnd() - 0.5) * 8);
        solid(tx, ty, "tree", 0.28);
      }
    }
    for (const [x, y] of opts.lamps ?? []) solid(x, y, "lamp", 0.22);
    for (const [x, y] of opts.benches ?? []) solid(x, y, "bench", 0.5);
    for (const [x, y, n] of opts.fences ?? []) {
      for (let i = 0; i < n; i++) solid(x + i * 1.25, y, "fence", 0.6);
    }
    for (const [x, y] of opts.bridges ?? []) {
      this.add.sprite(this.wx(x), this.wy(y), "bridge").setDepth(3).setAlpha(0.96);
    }
    for (let i = 0; i < (opts.flowers ?? 0); i++) {
      const tx = 4 + rnd() * (DESIGN_W - 8);
      const ty = 4 + rnd() * (DESIGN_H - 8);
      this.add
        .sprite(this.wx(tx), this.wy(ty), "flowers")
        .setDepth(4)
        .setAlpha(0.9)
        .setScale(0.8 + rnd() * 0.5);
    }
    if (opts.border) {
      for (let x = 2; x < DESIGN_W - 2; x += 2) {
        solid(x, 1.4, "tree", 0.28);
        solid(x + 1, DESIGN_H - 2.2, "tree", 0.28);
      }
      for (let y = 3; y < DESIGN_H - 3; y += 2) {
        solid(1.4, y, "tree", 0.28);
        solid(DESIGN_W - 2.2, y + 1, "tree", 0.28);
      }
    }

    this.physics.add.collider(this.player, this.solidDecor);
  }

  /** The current act's guiding target: relic first, then the way onward. */
  private objectiveTarget(): Phaser.GameObjects.Sprite | null {
    const order = [
      "relic",
      "gateway",
      "andrew-ceremony",
      "season-key",
      "vault-key",
      "sheet",
      "pillar",
      "vault",
      "andrew",
      "guide",
    ];
    for (const kind of order) {
      let best: Interactable | null = null;
      let bestD = Infinity;
      for (const it of this.interactables) {
        if (!it.enabled || !it.obj.active || it.kind !== kind) continue;
        const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, it.obj.x, it.obj.y);
        if (d < bestD) {
          best = it;
          bestD = d;
        }
      }
      if (best) return best.obj;
    }
    return null;
  }

  private updateArrow() {
    if (!this.arrow) {
      this.arrow = this.add
        .triangle(0, 0, 0, 14, 8, -10, -8, -10, 0xffd977, 0.85)
        .setDepth(95)
        .setScrollFactor(0)
        .setVisible(false);
      this.arrow.setStrokeStyle(2, 0xfff3cf, 0.9);
    }
    const target = this.objectiveTarget();
    if (!target) {
      this.arrow.setVisible(false);
      return;
    }
    const dist = Phaser.Math.Distance.Between(
      this.player.x,
      this.player.y,
      target.x,
      target.y,
    );
    if (dist < 90) {
      this.arrow.setVisible(false);
      return;
    }
    const cam = this.cameras.main;
    const angle = Math.atan2(target.y - this.player.y, target.x - this.player.x);
    const px = (this.player.x - cam.worldView.x) * cam.zoom;
    const py = (this.player.y - cam.worldView.y) * cam.zoom;
    const r = 62;
    this.arrow
      .setVisible(true)
      .setPosition(px + Math.cos(angle) * r, py + Math.sin(angle) * r);
    this.arrow.setRotation(angle + Math.PI / 2);
    this.arrow.setAlpha(0.6 + 0.25 * Math.sin(this.time.now / 320));
  }

  private buildZone(zone: ZoneId) {
    this.objective = ZONES[zone].objective;
    // Act I is a compact, welcoming realm (~1/3 the area of the later acts).
    const small = zone === "sunlit_shores";
    this.mapW = small ? 104 : MAP_W;
    this.mapH = small ? 104 : MAP_H;
    this.sxF = this.mapW / DESIGN_W;
    this.syF = this.mapH / DESIGN_H;
    if (zone === "sunlit_shores") this.buildAct1();
    else if (zone === "wedding_garden") this.buildAct2();
    else if (zone === "the_haven") this.buildAct3();
    else if (zone === "starry_ascent") this.buildAct4();
    else this.buildAct5();
  }

  // ---------------- ACT I --------------------------------------------------
  private buildAct1() {
    this.cameras.main.setBackgroundColor("#6fb0e0");
    this.makeMap(T.BLOOM, 101, (d) => {
      // wide river running north-south through the realm
      this.rect(d, 54, 2, 12, 98, T.WATER);
      // western waterfall at the northern river mouth
      this.rect(d, 54, 2, 12, 10, T.WATER);
      // eastern sunken grotto — expansive cave system
      this.rect(d, 92, 12, 34, 46, T.PATH);
      this.rect(d, 90, 10, 38, 1, T.WALL);
      this.rect(d, 90, 59, 38, 1, T.WALL);
      this.rect(d, 90, 11, 2, 48, T.WALL);
      this.rect(d, 126, 11, 2, 48, T.WALL);
      // grotto inner chamber wall accents
      this.rect(d, 100, 25, 8, 1, T.WALL);
      this.rect(d, 116, 40, 8, 1, T.WALL);
      // western meadows with a winding trail
      this.rect(d, 8, 18, 38, 4, T.PATH);
      this.rect(d, 8, 42, 38, 4, T.PATH);
      this.rect(d, 8, 66, 38, 4, T.PATH);
      // small ponds and groves
      this.rect(d, 12, 8, 10, 6, T.WATER);
      this.rect(d, 34, 78, 12, 8, T.WATER);
      // hidden alcove behind western grove
      this.rect(d, 6, 4, 5, 1, T.WALL);
      this.rect(d, 6, 4, 1, 6, T.WALL);
      // main road: spawn -> river crossing -> grotto temple
      this.road(d, [
        [16, 50],
        [40, 50],
        [58, 50],
        [72, 30],
        [104, 30],
      ]);
    });

    this.addPlayer(18, 51);
    this.spawnGuideAndSignpost(22, 48);
    this.scatterDecor(11, {
      village: [
        [12, 34],
        [20, 62],
        [30, 38],
      ],
      groves: [
        [14, 12, 8],
        [34, 60, 9],
        [24, 88, 8],
        [46, 30, 7],
      ],
      lamps: [
        [16, 20],
        [28, 20],
        [16, 44],
        [28, 44],
        [16, 68],
        [28, 68],
      ],
      benches: [
        [22, 26],
        [34, 44],
      ],
      fences: [
        [8, 30, 8],
        [8, 72, 8],
      ],
      bridges: [
        [60, 20],
        [60, 51],
        [60, 82],
      ],
      flowers: 90,
      border: true,
    });

    // river gates puzzle: 3 plates on the west bank, 3 blocks to push
    this.blocks = this.physics.add.group();
    const plateTiles: [number, number][] = [
      [42, 24],
      [42, 51],
      [42, 78],
    ];
    const plates: Phaser.GameObjects.Sprite[] = plateTiles.map(([x, y]) =>
      this.add.sprite(this.wx(x!), this.wy(y!), "plate").setDepth(4).setAlpha(0.75),
    );
    const blockTiles: [number, number][] = [
      [24, 22],
      [26, 51],
      [22, 76],
    ];
    for (const [x, y] of blockTiles) {
      const b = this.blocks.create(this.wx(x!), this.wy(y!), "block") as Phaser.Physics.Arcade.Sprite;
      b.setImmovable(false).setDepth(11);
      b.setDrag(1400, 1400);
      (b.body as Phaser.Physics.Arcade.Body).setMass(6);
      b.setCollideWorldBounds(true);
    }
    this.physics.add.collider(this.blocks, this.layer);
    this.physics.add.collider(this.blocks, this.blocks);
    this.time.addEvent({
      delay: 220,
      loop: true,
      callback: () => {
        if (this.zoneState["gatesOpen"]) return;
        let solved = 0;
        plates.forEach((p, i) => {
          const near = (this.blocks.getChildren() as Phaser.Physics.Arcade.Sprite[]).some(
            (b) => Phaser.Math.Distance.Between(b.x, b.y, p.x, p.y) < 24,
          );
          p.setAlpha(near ? 1 : 0.75);
          p.setTint(near ? 0xfff0bf : 0xffffff);
          if (near) solved++;
          void i;
        });
        this.objective = `The River Gates — ${solved}/3 stones on the plates.`;
        if (solved === 3) {
          this.zoneState["gatesOpen"] = true;
          this.openRiverGates();
        }
      },
    });

    // waterfall envelope
    if (!this.has(this.save.secret_envelopes_found, "waterfall")) {
      this.addInteractable(this.wx(99), this.wy(28), "envelope", "envelope", "Read the letter", {
        id: "waterfall",
      });
    }
    this.addInteractable(this.wx(24), this.wy(30), "rest-stone", "rest", "Rest here");
    this.addLandmark(
      "landmark-temple",
      110,
      24,
      "The River Gate Temple",
      "Moss-covered arches mark the old crossing. Torches still burn here for travellers who choose the quiet road.",
    );
    this.spawnAnimals(1101, [
      ["duck", 60, 40, 5],
      ["duck", 60, 70, 4],
      ["deer", 20, 76, 3],
      ["bird", 30, 22, 5],
      ["cat", 14, 34, 2],
    ]);
    this.addStalls([
      [12, 30],
      [30, 40],
    ]);
    if (this.save.relics_collected.includes("lantern")) this.spawnGateway(this.wx(108), this.wy(28));
  }

  /** Village market stalls — flat, collidable dressing. */
  private addStalls(spots: [number, number][]) {
    if (!this.solidDecor) this.solidDecor = this.physics.add.staticGroup();
    for (const [x, y] of spots) {
      const st = this.solidDecor.create(
        this.wx(x),
        this.wy(y),
        "stall",
      ) as Phaser.Physics.Arcade.Sprite;
      st.setDepth(10);
      const b = st.body as Phaser.Physics.Arcade.StaticBody;
      b.setSize(st.width * 0.8, st.height * 0.4);
      b.setOffset(st.width * 0.1, st.height * 0.6);
      b.updateFromGameObject?.();
    }
  }

  private openRiverGates() {
    this.rectLive(90, 10, 38, 1, T.MARBLE);
    this.cameras.main.flash(400, 255, 240, 191);
    this.objective = "The grotto stairwell is open — claim the Lantern of Quiet Care.";
    this.emitToast("The river parts. The grotto stairwell opens.");
    if (!this.save.relics_collected.includes("lantern"))
      this.addInteractable(this.wx(108), this.wy(28), "relic", "relic", "Take the relic", {
        id: "lantern",
      });
    else this.spawnGateway(this.wx(108), this.wy(28));
  }

  private rectLive(x: number, y: number, w: number, h: number, index: number) {
    const x0 = this.sx(x);
    const y0 = this.sy(y);
    const w0 = Math.max(1, Math.round(w * this.sxF));
    const h0 = Math.max(1, Math.round(h * this.syF));
    for (let j = y0; j < y0 + h0; j++)
      for (let i = x0; i < x0 + w0; i++) this.layer.putTileAt(index, i, j);
    this.layer.setCollision(SOLID_TILES as unknown as number[]);
  }

  private spawnGuideAndSignpost(tx: number, ty: number) {
    this.addInteractable(this.wx(tx), this.wy(ty), "guide", "guide", "Read the Realm Map", {
      radius: 88,
    });
    this.addInteractable(this.wx(tx - 4), this.wy(ty), "signpost", "signpost", "Read the signpost", {
      radius: 84,
    });
  }

  // ---------------- ACT II -------------------------------------------------
  private buildAct2() {
    this.cameras.main.setBackgroundColor("#7fc08f");
    this.makeMap(T.BLOOM, 202, (d) => {
      // outer hedge boundary
      this.rect(d, 3, 3, 1, 96, T.HEDGE);
      this.rect(d, 128, 3, 1, 96, T.HEDGE);
      this.rect(d, 3, 3, 126, 1, T.HEDGE);
      this.rect(d, 3, 98, 126, 1, T.HEDGE);
      // labyrinth rows
      for (let y = 10; y < 96; y += 10) {
        this.rect(d, 8, y, 110, 1, T.HEDGE);
        const gap = 12 + ((y * 7) % 86);
        this.rect(d, gap, y, 8, 1, T.BLOOM);
      }
      // vertical hedge dividers
      for (let x = 24; x < 120; x += 24) {
        this.rect(d, x, 8, 1, 86, T.HEDGE);
        const gap = 18 + ((x * 5) % 62);
        this.rect(d, x, gap, 1, 8, T.BLOOM);
      }
      // grand conservatory on the eastern edge
      this.rect(d, 112, 36, 18, 30, T.MARBLE);
      this.rect(d, 111, 36, 1, 30, T.HEDGE);
      this.rect(d, 130, 36, 2, 30, T.HEDGE);
      this.rect(d, 112, 35, 18, 1, T.HEDGE);
      this.rect(d, 112, 66, 18, 1, T.HEDGE);
      this.rect(d, 111, 50, 1, 2, T.HEDGE); // sealed door
      // central fountain court
      this.rect(d, 54, 46, 24, 16, T.WATER);
      this.rect(d, 53, 45, 26, 1, T.WALL);
      this.rect(d, 53, 62, 26, 1, T.WALL);
      this.rect(d, 53, 46, 1, 16, T.WALL);
      this.rect(d, 79, 46, 1, 16, T.WALL);
      // garden promenade
      this.road(d, [
        [12, 92],
        [66, 92],
        [66, 68],
        [108, 68],
        [108, 50],
      ]);
    });
    this.addPlayer(12, 90);
    this.scatterDecor(22, {
      groves: [
        [16, 30, 6],
        [60, 24, 6],
        [100, 74, 6],
      ],
      lamps: [
        [30, 50],
        [66, 40],
        [100, 60],
      ],
      benches: [
        [58, 68],
        [76, 68],
      ],
      flowers: 120,
    });

    this.addLandmark(
      "landmark-conservatory",
      121,
      44,
      "The Grand Conservatory",
      "Glass and white iron hold an endless summer inside. Four seasonal keys wake its doors.",
    );
    this.spawnAnimals(2202, [
      ["bird", 40, 30, 6],
      ["cat", 60, 60, 3],
      ["deer", 100, 84, 2],
    ]);

    const seasons = ["Spring", "Summer", "Autumn", "Winter"];
    const spots: [number, number][] = [
      [18, 18],
      [96, 18],
      [18, 82],
      [96, 82],
    ];
    this.zoneState["keysFound"] = 0;
    seasons.forEach((s, i) => {
      const [x, y] = spots[i]!;
      this.addInteractable(this.wx(x), this.wy(y), "key", "season-key", `Take the ${s} key`, {
        id: s,
      });
    });

    this.addInteractable(
      this.wx(121),
      this.wy(51),
      "vault-door",
      "conservatory",
      "Open the Conservatory",
    );
    this.addInteractable(this.wx(66), this.wy(54), "rest-stone", "rest", "Rest here");

    if (!this.has(this.save.secret_envelopes_found, "hedge"))
      this.addInteractable(this.wx(102), this.wy(90), "block", "breakable", "Push through the hedge", {
        id: "hedge",
      });

    if (this.save.relics_collected.includes("anchor") && this.save.relics_collected.includes("bloom"))
      this.spawnGateway(this.wx(117), this.wy(51));
  }

  // =======================================================================
  // ACT BOSS (shared, approachable melee encounter)
  // =======================================================================

  private zoneRelicsDone(zone: ZoneId) {
    const need = RELICS.filter((r) => r.zone === zone).map((r) => r.id);
    return need.length > 0 && need.every((n) => this.save.relics_collected.includes(n));
  }

  private spawnActBoss(tx: number, ty: number) {
    const zone = this.save.current_zone;
    const cfg = ACT_BOSSES[zone];
    if (!cfg || this.boss || this.zoneRelicsDone(zone)) return;
    const x = this.wx(tx);
    const y = this.wy(ty);
    this.boss = this.physics.add.sprite(x, y, "spectre").setDepth(18).setScale(1.5);
    const bb = this.boss.body as Phaser.Physics.Arcade.Body;
    bb.setAllowGravity(false);
    this.boss.setCollideWorldBounds(true);
    this.boss.setCircle(20, 4, 4);
    this.bossHits = 0;
    this.bossPhase = 1;
    this.bossHp = cfg.hp;
    this.bossMax = cfg.hp;
    this.bossName = cfg.name;
    this.physics.add.overlap(this.player, this.boss, () => this.hurtPlayerDirect());
    this.objective = `${cfg.name} — swing your weapon until its worry lifts.`;
    this.emitToast(cfg.taunt);
    // gentle waves of minions; never overwhelming
    this.bossTimer = this.time.addEvent({
      delay: 5200,
      loop: true,
      callback: () => {
        if (!this.boss?.active) return;
        if (Phaser.Math.Distance.Between(this.boss.x, this.boss.y, this.player.x, this.player.y) > 520)
          return;
        for (let i = 0; i < 3; i++) {
          const a = (i / 3) * Math.PI * 2;
          const e = this.spawnEnemy(
            this.boss.x + Math.cos(a) * 60,
            this.boss.y + Math.sin(a) * 60,
            "enemy-rush",
            62,
            true,
          );
          if (e) this.time.delayedCall(7000, () => e.destroy());
        }
      },
    });
  }

  private damageBoss(amount: number) {
    if (!this.boss?.active || this.bossPhase !== 1) return;
    const now = this.time.now;
    if (now < this.bossHitAt) return;
    this.bossHitAt = now + 220;
    this.bossHp = Math.max(0, this.bossHp - amount);
    this.bossHits++;
    this.boss.setTint(0xffd7e5);
    this.time.delayedCall(120, () => this.boss?.clearTint());
    this.spawnSparkle(this.boss.x, this.boss.y, 0xffd7e5, 10);
    const a = Math.atan2(this.boss.y - this.player.y, this.boss.x - this.player.x);
    this.boss.setVelocity(Math.cos(a) * 140, Math.sin(a) * 140);
    this.time.delayedCall(200, () => this.boss?.setVelocity(0, 0));
    if (this.bossHp <= 0) this.defeatActBoss();
  }

  private defeatActBoss() {
    this.bossPhase = 3;
    this.bossTimer?.remove();
    const zone = this.save.current_zone;
    let bx = this.player.x;
    let by = this.player.y;
    if (this.boss) {
      bx = this.boss.x;
      by = this.boss.y;
      this.spawnSparkle(bx, by, 0xffd7e5, 30);
      this.boss.destroy();
      this.boss = null;
      this.add.sprite(bx, by, "arbor").setDepth(6);
    }
    (this.enemies.getChildren() as Phaser.Physics.Arcade.Sprite[]).forEach((e) => {
      if (e.active && e.getData("temp")) this.transformEnemy(e);
    });
    this.cameras.main.flash(500, 255, 215, 229);
    this.emitToast(`${this.bossName} softens into blossoms.`);
    const need = RELICS.filter((r) => r.zone === zone).map((r) => r.id);
    const missing = need.filter((n) => !this.save.relics_collected.includes(n));
    if (missing.length === 0) {
      this.spawnGateway(bx, by - 90);
      return;
    }
    this.objective = "Claim the relic left behind.";
    missing.forEach((id, i) => {
      this.addInteractable(bx + (i - (missing.length - 1) / 2) * 70, by + 60, "relic", "relic", "Take the relic", {
        id,
      });
    });
  }

  // ---------------- ACT III ------------------------------------------------
  private buildAct3() {
    this.cameras.main.setBackgroundColor("#cfe3f7");
    this.makeMap(T.MARBLE, 303, (d) => {
      this.rect(d, 1, 1, DESIGN_W - 2, DESIGN_H - 2, T.MARBLE);
      // grand central fountain
      this.rect(d, 54, 46, 24, 16, T.WATER);
      this.rect(d, 53, 45, 26, 1, T.WALL);
      this.rect(d, 53, 62, 26, 1, T.WALL);
      this.rect(d, 53, 46, 1, 16, T.WALL);
      this.rect(d, 79, 46, 1, 16, T.WALL);
      // coffee patio southwest
      this.rect(d, 8, 12, 28, 18, T.PATH);
      this.rect(d, 7, 11, 30, 1, T.WALL);
      this.rect(d, 7, 30, 30, 1, T.WALL);
      this.rect(d, 7, 12, 1, 18, T.WALL);
      this.rect(d, 37, 12, 1, 18, T.WALL);
      // flower beds along the north
      this.rect(d, 12, 8, 108, 4, T.BLOOM);
      // quiet chapel corner southeast
      this.rect(d, 96, 78, 28, 16, T.PATH);
      this.rect(d, 95, 77, 30, 1, T.WALL);
      this.rect(d, 95, 94, 30, 1, T.WALL);
      this.rect(d, 95, 78, 1, 16, T.WALL);
      // cobblestone streets of Haven Town
      this.road(d, [
        [14, 51],
        [66, 51],
        [66, 24],
      ], 4);
      this.road(d, [
        [22, 20],
        [22, 88],
      ], 3);
      this.road(d, [
        [110, 20],
        [110, 88],
      ], 3);
    });
    this.addPlayer(18, 51);
    this.scatterDecor(33, {
      village: [
        [16, 40],
        [26, 68],
        [40, 34],
        [88, 30],
        [100, 62],
        [46, 74],
      ],
      groves: [
        [70, 88, 7],
        [22, 92, 6],
        [116, 46, 6],
      ],
      lamps: [
        [48, 42],
        [84, 42],
        [48, 66],
        [84, 66],
        [66, 34],
      ],
      benches: [
        [50, 56],
        [82, 56],
        [66, 70],
      ],
      fences: [
        [12, 46, 6],
        [96, 70, 6],
      ],
      flowers: 100,
      border: true,
    });

    this.addLandmark(
      "landmark-townhall",
      66,
      18,
      "Haven Town Hall",
      "The clock above the square keeps a slow, kind time. Neighbours gather here at dusk.",
    );
    this.addStalls([
      [52, 30],
      [60, 30],
      [76, 30],
      [84, 30],
    ]);
    this.spawnAnimals(3303, [
      ["dog", 50, 60, 3],
      ["cat", 90, 60, 3],
      ["bird", 66, 40, 6],
      ["duck", 66, 54, 4],
    ]);

    this.zoneState["sheets"] = 0;
    const sheetSpots: [number, number][] = [
      [18, 18],
      [105, 22],
      [102, 86],
    ];
    sheetSpots.forEach(([x, y], i) =>
      this.addInteractable(this.wx(x), this.wy(y), "sheet", "sheet", "Pick up the music sheet", {
        id: String(i),
      }),
    );

    this.addInteractable(this.wx(66), this.wy(54), "andrew", "andrew", "Talk with Andrew", {
      radius: 54,
    });
    this.addInteractable(this.wx(60), this.wy(50), "stone-memory", "memory", "Touch the Memory Stone");
    if (!this.has(this.save.secret_envelopes_found, "patio"))
      this.addInteractable(this.wx(16), this.wy(18), "envelope", "envelope", "Read the letter", {
        id: "patio",
      });
    if ((this.zoneState["keyTaken"] as boolean) !== true && this.save.vault_keys_count < 3)
      this.addInteractable(this.wx(111), this.wy(16), "key", "vault-key", "Take the Golden Vault Key", {
        id: "haven",
      });
    this.addInteractable(this.wx(90), this.wy(54), "rest-stone", "rest", "Rest here");

    if (this.save.relics_collected.includes("shield")) this.spawnGateway(this.wx(66), this.wy(18));
  }

  // ---------------- ACT IV -------------------------------------------------
  private buildAct4() {
    this.cameras.main.setBackgroundColor("#0d1226");
    this.makeMap(T.SKY, 404, (d) => {
      this.rect(d, 0, 0, DESIGN_W, DESIGN_H, T.VOID);
      const islands: [number, number, number, number][] = [
        [8, 78, 24, 14],
        [42, 72, 20, 12],
        [78, 62, 20, 12],
        [14, 52, 24, 12],
        [48, 40, 24, 14],
        [92, 30, 24, 14],
        [30, 18, 24, 12],
        [72, 10, 24, 12],
      ];
      for (const [x, y, w, h] of islands) this.rect(d, x, y, w, h, T.MARBLE);
      // bridges
      this.rect(d, 30, 84, 14, 3, T.PATH);
      this.rect(d, 60, 76, 20, 3, T.PATH);
      this.rect(d, 36, 58, 14, 3, T.PATH);
      this.rect(d, 70, 50, 24, 3, T.PATH);
      this.rect(d, 56, 30, 18, 3, T.PATH);
      this.rect(d, 42, 42, 8, 5, T.PATH);
      this.rect(d, 94, 20, 8, 5, T.PATH);
      // full-colour bloom accents on the islands (no grey noise)
      for (const [x, y, w, h] of islands)
        for (let j = 0; j < h; j += 3)
          for (let i = 0; i < w; i += 3) this.rect(d, x + i, y + j, 1, 1, T.BLOOM);
    });
    this.addPlayer(20, 85);
    this.addLandmark(
      "landmark-observatory",
      100,
      22,
      "The Starry Observatory",
      "A crystal dome tuned to the constellations. Align the three pillars and the stairway of stars appears.",
    );
    this.spawnAnimals(4404, [["bird", 60, 50, 8]]);

    this.zoneState["pillars"] = [0, 0, 0];
    const pillarSpots: [number, number][] = [
      [54, 78],
      [88, 68],
      [42, 46],
    ];
    pillarSpots.forEach(([x, y], i) =>
      this.addInteractable(this.wx(x!), this.wy(y!), "pillar", "pillar", "Turn the crystal pillar", {
        id: String(i),
      }),
    );

    if (!this.has(this.save.secret_envelopes_found, "summit"))
      this.addInteractable(this.wx(102), this.wy(68), "envelope", "envelope", "Read the letter", {
        id: "summit",
      });
    this.addInteractable(this.wx(60), this.wy(46), "rest-stone", "rest", "Rest here");
    if (this.save.vault_keys_count < 3)
      this.addInteractable(this.wx(103), this.wy(36), "key", "vault-key", "Take the Golden Vault Key", {
        id: "ascent",
      });
    this.addInteractable(this.wx(115), this.wy(36), "vault-door", "vault", "Open the Vault of Gratitude");

    // moving platform ferry between two islands
    const ferry = this.add.rectangle(this.wx(42), this.wy(58), 64, 48, 0xd7e0ff, 0.9).setDepth(3);
    this.tweens.add({
      targets: ferry,
      y: this.wy(30),
      duration: 5200,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
    this.zoneState["ferry"] = ferry;

    if (this.save.relics_collected.includes("seal")) this.spawnGateway(this.wx(84), this.wy(16));
  }

  private openStaircase() {
    this.rect2Live();
    this.objective = "The Celestial Staircase forms — reach the Altar of Joy.";
    this.emitToast("Three lights align. A staircase of stars unfolds.");
    if (!this.save.relics_collected.includes("seal"))
      this.addInteractable(this.wx(84), this.wy(16), "relic", "relic", "Take the Seal of Perfect Peace", {
        id: "seal",
      });
  }

  private rect2Live() {
    for (let j = this.sy(8); j < this.sy(18); j++)
      for (let i = this.sx(80); i < this.sx(88); i++) this.layer.putTileAt(T.MARBLE, i, j);
    this.layer.setCollision(SOLID_TILES as unknown as number[]);
    this.cameras.main.flash(400, 215, 224, 255);
  }

  // ---------------- ACT V --------------------------------------------------
  private buildAct5() {
    this.cameras.main.setBackgroundColor("#2a1f38");
    this.makeMap(T.CANDLE, 505, (d) => {
      this.rect(d, 0, 0, DESIGN_W, DESIGN_H, T.CANDLE);
      // grand nave
      this.rect(d, 36, 12, 60, 78, T.MARBLE);
      this.rect(d, 34, 12, 2, 78, T.WALL);
      this.rect(d, 96, 12, 2, 78, T.WALL);
      this.rect(d, 36, 10, 60, 2, T.WALL);
      // side chapels
      this.rect(d, 14, 24, 20, 20, T.MARBLE);
      this.rect(d, 98, 24, 20, 20, T.MARBLE);
      this.rect(d, 14, 58, 20, 20, T.MARBLE);
      this.rect(d, 98, 58, 20, 20, T.MARBLE);
      // transept crossing
      this.rect(d, 24, 46, 84, 10, T.MARBLE);
    });
    this.addPlayer(66, 88);
    this.scatterDecor(55, {
      lamps: [
        [40, 30],
        [92, 30],
        [40, 70],
        [92, 70],
      ],
      flowers: 40,
    });
    this.addLandmark(
      "landmark-cathedral",
      66,
      6,
      "The Grand Cathedral of Serenity",
      "Rose glass, candlelight, and every soul you love waiting inside. The long road ends in joy.",
    );
    this.spawnAnimals(5505, [["bird", 66, 40, 5]]);
    for (let i = 0; i < 24; i++) {
      this.add.sprite(this.wx(38 + (i % 2) * 56), this.wy(18 + Math.floor(i / 2) * 5), "guest").setDepth(6);
    }
    if (!this.has(this.save.secret_envelopes_found, "cathedral"))
      this.addInteractable(this.wx(42), this.wy(82), "envelope", "envelope", "Read the letter", {
        id: "cathedral",
      });
    this.addInteractable(this.wx(66), this.wy(18), "andrew-ceremony", "andrew-ceremony", "Meet Andrew", {
      radius: 60,
    });
    // stained glass glow
    this.add.rectangle(this.wx(66), this.wy(14), 280, 56, 0xc9a24b, 0.5).setDepth(2);
  }

  // =======================================================================
  // ENEMIES / COMBAT
  // =======================================================================

  private spawnEnemiesForZone(zone: ZoneId) {
    if (zone === "the_haven" || zone === "cathedral") return;
    const config: Record<string, { key: string; count: number; speed: number }> = {
      sunlit_shores: { key: "enemy-distraction", count: 18, speed: 48 },
      wedding_garden: { key: "enemy-rush", count: 22, speed: 68 },
      starry_ascent: { key: "enemy-weariness", count: 18, speed: 42 },
    };
    const c = config[zone]!;
    const rnd = irnd(zone.length * 37 + 11);
    let placed = 0;
    let guard = 0;
    while (placed < c.count && guard++ < 1200) {
      const x = Math.floor(rnd() * (this.mapW - 8)) + 4;
      const y = Math.floor(rnd() * (this.mapH - 8)) + 4;
      const tile = this.layer.getTileAt(x, y);
      if (!tile || SOLID_TILES.includes(tile.index as (typeof SOLID_TILES)[number])) continue;
      if (Phaser.Math.Distance.Between(x * TILE, y * TILE, this.player.x, this.player.y) < 220)
        continue;
      this.spawnEnemy(x * TILE, y * TILE, c.key, c.speed, false);
      placed++;
    }
  }

  private spawnEnemy(x: number, y: number, key: string, speed: number, temp: boolean) {
    const e = this.enemies.get(x, y, key) as Phaser.Physics.Arcade.Sprite | null;
    if (!e) return null;
    e.setTexture(key);
    e.setActive(true).setVisible(true).setDepth(15);
    e.setPosition(x, y);
    e.body!.reset(x, y);
    e.setData("speed", speed);
    e.setData("temp", temp);
    e.setCircle(10);
    return e;
  }

  private transformEnemy(e: Phaser.Physics.Arcade.Sprite) {
    if (!e.active) return;
    const { x, y } = e;
    e.disableBody(true, true);
    this.spawnSparkle(x, y, 0xffd7e5);
    const b = this.add.sprite(x, y, "butterfly").setDepth(14);
    this.tweens.add({
      targets: b,
      y: y - 70,
      x: x + Phaser.Math.Between(-40, 40),
      alpha: 0,
      duration: 1600,
      onComplete: () => b.destroy(),
    });
  }

  private spawnSparkle(x: number, y: number, tint: number, count = 12) {
    for (let i = 0; i < count; i++) {
      const s = this.add.sprite(x, y, "spark").setTint(tint).setDepth(16);
      const a = (i / count) * Math.PI * 2;
      this.tweens.add({
        targets: s,
        x: x + Math.cos(a) * Phaser.Math.Between(20, 60),
        y: y + Math.sin(a) * Phaser.Math.Between(20, 60),
        alpha: 0,
        scale: 0.2,
        duration: 600,
        onComplete: () => s.destroy(),
      });
    }
  }

  private equippedWeapon() {
    return WEAPON_BY_ID[this.save.equipped_weapon ?? DEFAULT_WEAPON] ?? WEAPON_BY_ID[DEFAULT_WEAPON]!;
  }

  /** Melee swing with the equipped weapon — everything struck turns to butterflies. */
  private attack() {
    if (this.frozen || !this.player.active) return;
    if (!this.save.weapons.includes(this.save.equipped_weapon ?? "")) {
      this.emitToast("You have no weapon yet — find the Blacksmith for a wooden sword.");
      return;
    }
    const now = this.time.now;
    if (now < this.swingAt) return;
    this.swingAt = now + 320;
    if (this.stamina >= 6) this.stamina -= 6;
    const w = this.equippedWeapon();
    const dir =
      this.lastDir === "up"
        ? -Math.PI / 2
        : this.lastDir === "down"
          ? Math.PI / 2
          : this.facing > 0
            ? 0
            : Math.PI;

    // swing arc visual
    const arc = this.add
      .arc(this.player.x, this.player.y, w.reach, Phaser.Math.RadToDeg(dir) - 55, Phaser.Math.RadToDeg(dir) + 55, false, w.color, 0.35)
      .setDepth(19);
    this.tweens.add({
      targets: arc,
      alpha: 0,
      scale: 1.15,
      duration: 240,
      onComplete: () => arc.destroy(),
    });
    this.spawnSparkle(
      this.player.x + Math.cos(dir) * w.reach * 0.6,
      this.player.y + Math.sin(dir) * w.reach * 0.6,
      w.color,
      8,
    );

    const inArc = (x: number, y: number, pad = 0) => {
      const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, x, y);
      if (d > w.reach + pad) return false;
      const a = Math.atan2(y - this.player.y, x - this.player.x);
      return Math.abs(Phaser.Math.Angle.Wrap(a - dir)) < 1.15;
    };

    (this.enemies.getChildren() as Phaser.Physics.Arcade.Sprite[]).forEach((e) => {
      if (e.active && inArc(e.x, e.y)) this.transformEnemy(e);
    });
    if (this.boss?.active && inArc(this.boss.x, this.boss.y, 22)) this.damageBoss(w.damage);
  }

  private dash() {
    if (this.frozen) return;
    const now = this.time.now;
    if (now < this.dashReadyAt || this.stamina < 20) return;
    this.stamina -= 20;
    this.dashUntil = now + DASH_MS;
    this.dashReadyAt = now + DASH_COOLDOWN;
    this.invulnUntil = Math.max(this.invulnUntil, now + DASH_MS + 120);
    this.spawnSparkle(this.player.x, this.player.y, 0xfff0bf, 8);
  }

  private hurtPlayer(e: Phaser.Physics.Arcade.Sprite) {
    if (!e.active || this.frozen) return;
    const now = this.time.now;
    if (now < this.invulnUntil) return;
    this.invulnUntil = now + 1100;
    this.save.player_health = Math.max(0, this.save.player_health - 1);
    this.cameras.main.shake(160, 0.006);
    this.player.setTint(0xff9aa5);
    this.time.delayedCall(300, () => this.player.clearTint());
    this.emitSave();

    if (this.save.player_health <= 1 && this.save.relics_collected.includes("shield")) {
      if (now > this.shieldReadyAt) {
        this.shieldReadyAt = now + 8000;
        const ring = this.add.circle(this.player.x, this.player.y, 30, 0xc9a24b, 0.3).setDepth(9);
        this.tweens.add({
          targets: ring,
          radius: 150,
          alpha: 0,
          duration: 600,
          onComplete: () => ring.destroy(),
        });
        (this.enemies.getChildren() as Phaser.Physics.Arcade.Sprite[]).forEach((en) => {
          if (en.active && Phaser.Math.Distance.Between(en.x, en.y, this.player.x, this.player.y) < 150)
            this.transformEnemy(en);
        });
        this.emitToast("The Shield of Unshakable Faith pulses — faith holds you steady.");
      }
    }

    if (this.save.player_health <= 0) {
      this.save.player_health = 5;
      this.stamina = 100;
      this.emitSave();
      this.cameras.main.fadeOut(280, 0, 0, 0);
      this.time.delayedCall(320, () => {
        this.player.setPosition(this.spawnPoint.x, this.spawnPoint.y);
        this.cameras.main.fadeIn(320, 0, 0, 0);
        this.emitToast("You pause, breathe, and begin again. Hearts restored.");
      });
    }
  }

  // =======================================================================
  // INTERACTION
  // =======================================================================

  private nearest(): Interactable | null {
    let best: Interactable | null = null;
    let bestD = Infinity;
    for (const it of this.interactables) {
      if (!it.enabled || !it.obj.active) continue;
      const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, it.obj.x, it.obj.y);
      if (d < it.radius && d < bestD) {
        best = it;
        bestD = d;
      }
    }
    return best;
  }

  private removeInteractable(it: Interactable) {
    it.enabled = false;
    it.obj.destroy();
    this.interactables = this.interactables.filter((i) => i !== it);
  }

  private interact() {
    if (this.frozen) return;
    const it = this.nearest();
    if (!it) return;
    switch (it.kind) {
      case "relic":
        this.collectRelic(it);
        break;
      case "envelope":
        if (it.id && !this.save.secret_envelopes_found.includes(it.id)) {
          this.save.secret_envelopes_found = [...this.save.secret_envelopes_found, it.id];
          this.emitSave();
        }
        this.removeInteractable(it);
        this.openModal({ type: "envelope", envelopeId: it.id! });
        break;
      case "rest":
        this.save.player_health = 5;
        this.stamina = 100;
        this.emitSave();
        this.spawnSparkle(this.player.x, this.player.y, 0xfff0bf, 16);
        this.emitToast(REST_STONE_LINES[Phaser.Math.Between(0, REST_STONE_LINES.length - 1)]!);
        break;
      case "andrew": {
        this.save.player_health = 5;
        this.stamina = 100;
        this.emitSave();
        const sheets = this.zoneState["sheets"] as number;
        if (sheets >= 3 && !this.save.relics_collected.includes("shield")) {
          this.zoneState["melodyPlayed"] = true;
          this.objective = "Andrew plays the golden harp — take the Shield of Unshakable Faith.";
          this.addInteractable(this.wx(66), this.wy(58), "relic", "relic", "Take the relic", {
            id: "shield",
          });
          this.openModal({
            type: "andrew",
            line: "You found every last page. Listen — this is the melody I always hear when I think of you. Take this with you: my faith in us has never once wavered.",
          });
        } else {
          this.openModal({
            type: "andrew",
            line:
              sheets >= 3
                ? "The melody is ours now. Whenever the world gets loud, hum it and remember I'm right here."
                : `Three pages of our song blew across the plaza — I've found ${sheets}/3 so far. Help me gather them and I'll play it for you.`,
          });
        }
        break;
      }
      case "andrew-ceremony":
        this.frozen = true;
        this.physics.pause();
        this.game.events.emit(EV.ceremony);
        break;
      case "memory":
        this.openModal({ type: "memory" });
        break;
      case "sheet": {
        this.removeInteractable(it);
        const n = ((this.zoneState["sheets"] as number) ?? 0) + 1;
        this.zoneState["sheets"] = n;
        this.objective = `The Missing Melody — ${n}/3 music sheets gathered.`;
        this.emitToast(`Music sheet ${n}/3 recovered.`);
        if (n >= 3) this.objective = "Bring the melody back to Andrew by the fountain.";
        break;
      }
      case "season-key": {
        this.removeInteractable(it);
        const n = ((this.zoneState["keysFound"] as number) ?? 0) + 1;
        this.zoneState["keysFound"] = n;
        this.objective = `The Seasons Tile Lock — ${n}/4 seasonal keys.`;
        this.emitToast(`${it.id} key collected (${n}/4).`);
        break;
      }
      case "conservatory": {
        const n = (this.zoneState["keysFound"] as number) ?? 0;
        if (n < 4) {
          this.emitToast(`The Conservatory needs all four seasons — ${n}/4.`);
          return;
        }
        this.removeInteractable(it);
        this.rectLive(111, 50, 1, 2, T.MARBLE);
        this.spawnActBoss(121, 51);
        break;
      }
      case "breakable": {
        this.removeInteractable(it);
        this.spawnSparkle(it.obj.x, it.obj.y, 0x2b8a4d, 14);
        this.addInteractable(it.obj.x + 40, it.obj.y, "envelope", "envelope", "Read the letter", {
          id: "hedge",
        });
        if (this.save.vault_keys_count < 3)
          this.addInteractable(it.obj.x + 80, it.obj.y, "key", "vault-key", "Take the Golden Vault Key", {
            id: "garden",
          });
        this.emitToast("The hedge parts, revealing a hidden alcove.");
        break;
      }
      case "vault-key": {
        this.removeInteractable(it);
        this.save.vault_keys_count = Math.min(3, this.save.vault_keys_count + 1);
        this.emitSave();
        this.emitToast(`Golden Vault Key acquired (${this.save.vault_keys_count}/3).`);
        break;
      }
      case "vault": {
        if (this.save.vault_keys_count < 3) {
          this.emitToast(
            `The Vault of Gratitude needs 3 Golden Keys — you have ${this.save.vault_keys_count}.`,
          );
          return;
        }
        this.openModal({ type: "vault" });
        break;
      }
      case "pillar": {
        const arr = this.zoneState["pillars"] as number[];
        const i = Number(it.id);
        arr[i] = ((arr[i] ?? 0) + 1) % 3;
        it.obj.setTint([0x8fa6ff, 0xfff0bf, 0xffd7e5][arr[i]!]!);
        this.spawnSparkle(it.obj.x, it.obj.y, 0xd7e0ff, 8);
        const aligned = arr.every((v) => v === 1);
        this.objective = aligned
          ? "The pillars align."
          : `The Celestial Staircase — align all three pillars to warm gold (${arr.filter((v) => v === 1).length}/3).`;
        if (aligned && !this.zoneState["stairs"]) {
          this.zoneState["stairs"] = true;
          this.openStaircase();
        }
        break;
      }
      case "blacksmith": {
        const fresh = this.grantWeapon(BLACKSMITH.weapon);
        this.openModal({
          type: fresh ? "weapon" : "info",
          ...(fresh
            ? { weaponId: BLACKSMITH.weapon, speaker: BLACKSMITH.name, line: BLACKSMITH.line }
            : { title: BLACKSMITH.name, body: BLACKSMITH.repeat }),
        } as ModalPayload);
        break;
      }
      case "act-guide": {
        const g = ACT_GUIDES[this.save.current_zone];
        const fresh = this.grantWeapon(g.weapon);
        this.openModal({
          type: fresh ? "weapon" : "info",
          ...(fresh
            ? { weaponId: g.weapon, speaker: g.name, line: g.line }
            : { title: g.name, body: g.line }),
        } as ModalPayload);
        break;
      }
      case "guide":
      case "signpost":
        this.openModal({ type: "guide" });
        break;
      case "gateway":
        this.advanceZone();
        break;
      default:
        break;
    }
  }

  private hurtPlayerDirect() {
    const now = this.time.now;
    if (now < this.invulnUntil) return;
    this.invulnUntil = now + 900;
    this.save.player_health = Math.max(1, this.save.player_health - 1);
    this.cameras.main.shake(140, 0.005);
    this.emitSave();
  }

  private collectRelic(it: Interactable) {
    const id = it.id!;
    this.removeInteractable(it);
    if (!this.save.relics_collected.includes(id)) {
      this.save.relics_collected = [...this.save.relics_collected, id];
      this.emitSave();
    }
    this.spawnSparkle(this.player.x, this.player.y, 0xc9a24b, 20);
    this.cameras.main.flash(350, 255, 240, 191);
    this.openModal({ type: "relic", relicId: id });

    if (id === "seal") {
      this.zoneState["finale"] = true;
    } else {
      const zone = this.save.current_zone;
      const need = RELICS.filter((r) => r.zone === zone).map((r) => r.id);
      if (need.every((n) => this.save.relics_collected.includes(n))) {
        this.objective = "The way forward opens — step through the gateway of light.";
        this.spawnGateway(this.player.x, this.player.y - 90);
      }
    }
  }

  private spawnGateway(x: number, y: number) {
    if (this.interactables.some((i) => i.kind === "gateway")) return;
    const order = this.zoneOrder();
    const next = order[Math.min(order.length - 1, order.indexOf(this.save.current_zone) + 1)]!;
    const it = this.addInteractable(x, y, "portal", "gateway", `Portal — ${ZONES[next].title}`, {
      radius: 62,
    });
    this.add
      .sprite(x, y, "glow")
      .setDepth(11)
      .setScale(4)
      .setAlpha(0.5)
      .setBlendMode(Phaser.BlendModes.ADD);
    this.tweens.add({
      targets: it.obj,
      alpha: { from: 0.75, to: 1 },
      duration: 900,
      yoyo: true,
      repeat: -1,
    });
  }

  private advanceZone() {
    const order: ZoneId[] = [
      "sunlit_shores",
      "wedding_garden",
      "the_haven",
      "starry_ascent",
      "cathedral",
    ];
    const idx = order.indexOf(this.save.current_zone);
    const next = order[Math.min(order.length - 1, idx + 1)]!;
    this.save.current_zone = next;
    this.save.player_health = 5;
    this.emitSave();
    this.cameras.main.fadeOut(420, 0, 0, 0);
    this.time.delayedCall(460, () => this.scene.restart({ save: this.save }));
  }

  // =======================================================================
  // MODAL / EVENT PLUMBING
  // =======================================================================

  private openModal(payload: ModalPayload) {
    this.frozen = true;
    this.physics.pause();
    this.game.events.emit(EV.modal, payload);
  }

  private equipWeapon(id: string) {
    if (!this.save.weapons.includes(id)) return;
    this.save.equipped_weapon = id;
    this.emitSave();
    this.pushHud(true);
    this.emitToast(`${WEAPON_BY_ID[id]?.name ?? "Weapon"} equipped.`);
  }

  /** Permanently award a weapon and auto-equip it if it is stronger. */
  private grantWeapon(id: string) {
    const w = WEAPON_BY_ID[id];
    if (!w) return false;
    if (this.save.weapons.includes(id)) return false;
    this.save.weapons = [...this.save.weapons, id];
    const cur = WEAPON_BY_ID[this.save.equipped_weapon ?? ""];
    if (!cur || w.damage >= cur.damage) this.save.equipped_weapon = id;
    this.emitSave();
    this.pushHud(true);
    this.spawnSparkle(this.player.x, this.player.y, w.color, 22);
    this.cameras.main.flash(300, 255, 240, 191);
    return true;
  }

  private onResume() {
    this.frozen = false;
    this.physics.resume();
    this.stick = { x: 0, y: 0 };
  }

  private onStick(v: { x: number; y: number }) {
    this.stick = v;
  }

  private emitToast(message: string) {
    this.game.events.emit(EV.toast, message);
  }

  emitSave() {
    this.game.events.emit(EV.save, { ...this.save });
  }

  completeWedding() {
    this.save.wedding_completed = true;
    this.emitSave();
  }

  private pushHud(force = false) {
    const now = this.time.now;
    const state: HudState = {
      health: this.save.player_health,
      maxHealth: 5,
      stamina: Math.round(this.stamina),
      dashProgress: Math.max(0, Math.min(1, 1 - (this.dashReadyAt - now) / DASH_COOLDOWN)),
      zone: this.save.current_zone,
      zoneTitle: ZONES[this.save.current_zone].title,
      act: ZONES[this.save.current_zone].act,
      objective: this.objective,
      relics: this.save.relics_collected,
      envelopes: this.save.secret_envelopes_found,
      keys: this.save.vault_keys_count,
      prompt: this.prompt,
      weddingCompleted: this.save.wedding_completed,
      weapons: this.save.weapons,
      equipped: this.save.equipped_weapon,
      boss:
        this.boss?.active && this.bossPhase === 1
          ? { name: this.bossName, hp: this.bossHp, max: this.bossMax }
          : null,
    };
    const sig = JSON.stringify({ ...state, dashProgress: Math.round(state.dashProgress * 10) });
    if (!force && sig === this.lastHud) return;
    this.lastHud = sig;
    this.game.events.emit(EV.hud, state);
  }

  // =======================================================================
  // UPDATE LOOP (no React state updates in here)
  // =======================================================================

  override update(time: number, delta: number) {
    if (!this.player?.body) return;
    if (this.frozen) {
      this.player.setVelocity(0, 0);
      return;
    }

    let vx = this.stick.x;
    let vy = this.stick.y;
    const k = this.keys;
    if (this.cursors.left.isDown || k["A"]!.isDown) vx -= 1;
    if (this.cursors.right.isDown || k["D"]!.isDown) vx += 1;
    if (this.cursors.up.isDown || k["W"]!.isDown) vy -= 1;
    if (this.cursors.down.isDown || k["S"]!.isDown) vy += 1;
    let len = Math.hypot(vx, vy);
    if (len > 0.05) this.cancelAutopilot();
    if (len < 0.05 && this.autopilot) {
      const d = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        this.autopilot.x,
        this.autopilot.y,
      );
      if (d < 70) this.cancelAutopilot();
      else {
        const a = Math.atan2(this.autopilot.y - this.player.y, this.autopilot.x - this.player.x);
        vx = Math.cos(a);
        vy = Math.sin(a);
        len = 1;
        if (time - this.lastAura > 120) this.auraTrail(true);
      }
    }
    if (len > 1) {
      vx /= len;
      vy /= len;
    }
    const dashing = time < this.dashUntil;
    const speed = SPEED * (dashing ? 3 : 1);
    this.player.setVelocity(vx * speed, vy * speed);

    // 4-directional animation
    const moving = len > 0.05;
    let dir: "down" | "up" | "side" = "down";
    if (moving) {
      if (Math.abs(vx) > Math.abs(vy)) {
        dir = "side";
        this.facing = vx > 0 ? 1 : -1;
      } else {
        dir = vy < 0 ? "up" : "down";
      }
      this.lastDir = dir;
    } else {
      dir = this.lastDir;
    }
    this.player.setFlipX(dir === "side" && this.facing < 0);
    const animKey = `maria-${moving ? "walk" : "idle"}-${dir}`;
    if (this.player.anims.currentAnim?.key !== animKey) this.player.anims.play(animKey, true);
    this.animStep = moving ? 1 : 0;
    this.lastStepAt = time;

    // stamina
    this.stamina = Math.min(100, this.stamina + (len > 0.05 ? 0.012 : 0.03) * delta);

    // aura position + radiant petal / sparkle trail (throttled)
    this.aura.setPosition(this.player.x, this.player.y);
    if (time - this.lastAura > 90) {
      this.lastAura = time;
      this.auraTrail(moving);
    }

    // enemies chase
    const children = this.enemies.getChildren() as Phaser.Physics.Arcade.Sprite[];
    for (const e of children) {
      if (!e.active) continue;
      const d = Phaser.Math.Distance.Between(e.x, e.y, this.player.x, this.player.y);
      const sp = (e.getData("speed") as number) ?? 50;
      if (d < 260) {
        const a = Math.atan2(this.player.y - e.y, this.player.x - e.x);
        e.setVelocity(Math.cos(a) * sp, Math.sin(a) * sp);
      } else {
        e.setVelocity(
          Math.cos(time / 900 + e.x) * sp * 0.4,
          Math.sin(time / 1100 + e.y) * sp * 0.4,
        );
      }
      // enemies within the aura slowly surrender to peace
      if (d < 70 && Phaser.Math.Between(0, 100) > 97) this.transformEnemy(e);
    }

    // ferry ride in Act IV
    const ferry = this.zoneState["ferry"] as Phaser.GameObjects.Rectangle | undefined;
    if (ferry) {
      const onFerry =
        Math.abs(this.player.x - ferry.x) < 36 && Math.abs(this.player.y - ferry.y) < 30;
      if (onFerry && len < 0.05) this.player.y = ferry.y;
    }

    // player facing invulnerability blink
    this.player.setAlpha(time < this.invulnUntil ? (Math.floor(time / 80) % 2 ? 0.45 : 1) : 1);

    const near = this.nearest();
    this.prompt = near ? near.label : null;
    if (this.promptText) {
      this.promptText
        .setPosition(this.player.x, this.player.y - 30)
        .setText(near ? `E / ACTION — ${near.label}` : "")
        .setVisible(!!near);
    }
    this.updateCompanion();
    this.checkCutscene();
    this.updateArrow();
    this.pushHud();
  }

  /** Maria's aura leaves a golden light trail of blooming petals and sparkles. */
  private auraTrail(moving: boolean) {
    const count = moving ? 2 : 1;
    for (let i = 0; i < count; i++) {
      const ox = Phaser.Math.Between(-22, 22);
      const oy = Phaser.Math.Between(-6, 20);
      const isPetal = Phaser.Math.Between(0, 100) > 45;
      const s = this.add
        .sprite(this.player.x + ox, this.player.y + oy, isPetal ? "petal" : "spark")
        .setDepth(8)
        .setAlpha(0.95)
        .setScale(isPetal ? Phaser.Math.FloatBetween(0.7, 1.2) : Phaser.Math.FloatBetween(1, 1.8));
      if (!isPetal) s.setTint(0xffe9a8);
      this.tweens.add({
        targets: s,
        y: s.y - Phaser.Math.Between(14, 30),
        x: s.x + Phaser.Math.Between(-10, 10),
        angle: isPetal ? Phaser.Math.Between(-140, 140) : 0,
        alpha: 0,
        scale: 0.2,
        duration: Phaser.Math.Between(700, 1200),
        ease: "Sine.easeOut",
        onComplete: () => s.destroy(),
      });
    }
  }
}

export function createQuestGame(parent: HTMLElement, save: QuestSave) {
  const game = new Phaser.Game({
    type: Phaser.WEBGL,
    parent,
    width: parent.clientWidth || 800,
    height: parent.clientHeight || 600,
    backgroundColor: "#0b1e3d",
    pixelArt: false,
    roundPixels: true,
    antialias: true,
    fps: { target: 60, forceSetTimeOut: false },
    physics: { default: "arcade", arcade: { gravity: { x: 0, y: 0 }, debug: false } },
    scale: { mode: Phaser.Scale.RESIZE, autoCenter: Phaser.Scale.CENTER_BOTH },
    scene: [QuestScene],
  });
  game.scene.start("quest", { save });
  void TILE_COUNT;
  return game;
}
