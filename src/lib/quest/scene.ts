import * as Phaser from "phaser";
import {
  ENVELOPES,
  RELICS,
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

const MAP_W = 132;
const MAP_H = 102;
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
  private frozen = false;
  private objective = "";
  private prompt: string | null = null;
  private zoneState: Record<string, unknown> = {};
  private boss: Phaser.Physics.Arcade.Sprite | null = null;
  private bossPhase = 0;
  private bossHits = 0;
  private bossTimer?: Phaser.Time.TimerEvent;

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

    this.buildZone(this.save.current_zone);

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
    this.keys["SPACE"]!.on("down", () => this.peaceBurst());
    this.keys["J"]!.on("down", () => this.peaceBurst());
    this.keys["SHIFT"]!.on("down", () => this.dash());
    this.keys["K"]!.on("down", () => this.dash());
    this.keys["E"]!.on("down", () => this.interact());
    this.keys["ENTER"]!.on("down", () => this.interact());

    const g = this.game.events;
    g.on(EV.stick, this.onStick, this);
    g.on(EV.action, this.peaceBurst, this);
    g.on(EV.dash, this.dash, this);
    g.on(EV.interact, this.interact, this);
    g.on(EV.resume, this.onResume, this);

    this.events.once("shutdown", () => {
      g.off(EV.stick, this.onStick, this);
      g.off(EV.action, this.peaceBurst, this);
      g.off(EV.dash, this.dash, this);
      g.off(EV.interact, this.interact, this);
      g.off(EV.resume, this.onResume, this);
      this.bossTimer?.remove();
    });

    // ---- camera ----------------------------------------------------------
    this.cameras.main.setBounds(0, 0, MAP_W * TILE, MAP_H * TILE);
    this.physics.world.setBounds(0, 0, MAP_W * TILE, MAP_H * TILE);
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
    for (let y = 0; y < MAP_H; y++) {
      const row: number[] = [];
      for (let x = 0; x < MAP_W; x++) {
        const edge = x === 0 || y === 0 || x === MAP_W - 1 || y === MAP_H - 1;
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

  private rect(d: number[][], x: number, y: number, w: number, h: number, t: number) {
    for (let j = y; j < y + h; j++)
      for (let i = x; i < x + w; i++)
        if (d[j] && i >= 0 && i < MAP_W && j >= 0 && j < MAP_H) d[j]![i] = t;
  }

  private addPlayer(tx: number, ty: number) {
    const x = Phaser.Math.Clamp(tx, 2, MAP_W - 3) * TILE;
    const y = Phaser.Math.Clamp(ty, 2, MAP_H - 3) * TILE;
    this.makeWalkAnims();
    this.player = this.physics.add.sprite(x, y, "maria-down-0");
    this.player.anims.play("maria-idle-down");
    this.player.setSize(14, 12).setOffset(5, 21);
    this.player.setCollideWorldBounds(true);
    this.player.setDepth(20);
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

  /** 4-directional walk + idle animations for Maria. */
  private makeWalkAnims() {
    for (const dir of ["down", "side", "up"] as const) {
      if (!this.anims.exists(`maria-walk-${dir}`)) {
        this.anims.create({
          key: `maria-walk-${dir}`,
          frames: [{ key: `maria-${dir}-0` }, { key: `maria-${dir}-1` }],
          frameRate: 6,
          repeat: -1,
        });
      }
      if (!this.anims.exists(`maria-idle-${dir}`)) {
        this.anims.create({
          key: `maria-idle-${dir}`,
          frames: [{ key: `maria-${dir}-0` }],
          frameRate: 1,
          repeat: -1,
        });
      }
    }
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

  private buildZone(zone: ZoneId) {
    this.objective = ZONES[zone].objective;
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
    });

    this.addPlayer(18, 51);
    this.spawnGuideAndSignpost(22, 48);

    // river gates puzzle: 3 plates on the west bank, 3 blocks to push
    this.blocks = this.physics.add.group();
    const plateTiles: [number, number][] = [
      [42, 24],
      [42, 51],
      [42, 78],
    ];
    const plates: Phaser.GameObjects.Sprite[] = plateTiles.map(([x, y]) =>
      this.add.sprite(x! * TILE, y! * TILE, "plate").setDepth(4).setAlpha(0.75),
    );
    const blockTiles: [number, number][] = [
      [24, 22],
      [26, 51],
      [22, 76],
    ];
    for (const [x, y] of blockTiles) {
      const b = this.blocks.create(x! * TILE, y! * TILE, "block") as Phaser.Physics.Arcade.Sprite;
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
      this.addInteractable(99 * TILE, 28 * TILE, "envelope", "envelope", "Read the letter", {
        id: "waterfall",
      });
    }
    this.addInteractable(24 * TILE, 30 * TILE, "rest-stone", "rest", "Rest here");
    if (this.save.relics_collected.includes("lantern")) this.spawnGateway(108 * TILE, 28 * TILE);
  }

  private openRiverGates() {
    this.rectLive(90, 10, 38, 1, T.MARBLE);
    this.cameras.main.flash(400, 255, 240, 191);
    this.objective = "The grotto stairwell is open — claim the Lantern of Quiet Care.";
    this.emitToast("The river parts. The grotto stairwell opens.");
    if (!this.save.relics_collected.includes("lantern"))
      this.addInteractable(108 * TILE, 28 * TILE, "relic", "relic", "Take the relic", {
        id: "lantern",
      });
    else this.spawnGateway(108 * TILE, 28 * TILE);
  }

  private rectLive(x: number, y: number, w: number, h: number, index: number) {
    for (let j = y; j < y + h; j++)
      for (let i = x; i < x + w; i++) this.layer.putTileAt(index, i, j);
    this.layer.setCollision(SOLID_TILES as unknown as number[]);
  }

  private spawnGuideAndSignpost(tx: number, ty: number) {
    this.addInteractable(tx * TILE, ty * TILE, "guide", "guide", "Speak with the Realm Guide", {
      radius: 60,
    });
    this.addInteractable((tx - 4) * TILE, ty * TILE, "signpost", "signpost", "Read the signpost", {
      radius: 52,
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
    });
    this.addPlayer(12, 90);

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
      this.addInteractable(x * TILE, y * TILE, "key", "season-key", `Take the ${s} key`, {
        id: s,
      });
    });

    this.addInteractable(
      121 * TILE,
      51 * TILE,
      "vault-door",
      "conservatory",
      "Open the Conservatory",
    );
    this.addInteractable(66 * TILE, 54 * TILE, "rest-stone", "rest", "Rest here");

    if (!this.has(this.save.secret_envelopes_found, "hedge"))
      this.addInteractable(102 * TILE, 90 * TILE, "block", "breakable", "Push through the hedge", {
        id: "hedge",
      });

    if (this.save.relics_collected.includes("anchor") && this.save.relics_collected.includes("bloom"))
      this.spawnGateway(117 * TILE, 51 * TILE);
  }

  private startBoss() {
    const cx = 121 * TILE;
    const cy = 51 * TILE;
    this.bossPhase = 1;
    this.bossHits = 0;
    this.objective = "The Stress Spectre — Phase 1: dodge the shadow bursts and answer with peace.";
    this.boss = this.physics.add.sprite(cx, cy, "spectre").setDepth(18);
    this.boss.setImmovable(true);
    (this.boss.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
    this.physics.add.overlap(this.petals, this.boss, (p) => {
      (p as Phaser.Physics.Arcade.Sprite).setActive(false).setVisible(false);
      if (this.bossPhase !== 1 || !this.boss) return;
      this.bossHits++;
      this.boss.setTint(0xffd7e5);
      this.time.delayedCall(120, () => this.boss?.clearTint());
      this.spawnSparkle(this.boss.x, this.boss.y, 0xffd7e5);
      if (this.bossHits >= 6) this.bossPhaseTwo();
    });
    this.bossTimer = this.time.addEvent({
      delay: 1400,
      loop: true,
      callback: () => {
        if (this.bossPhase !== 1 || !this.boss) return;
        for (let i = 0; i < 8; i++) {
          const e = this.spawnEnemy(
            this.boss.x + Math.cos((i / 8) * Math.PI * 2) * 40,
            this.boss.y + Math.sin((i / 8) * Math.PI * 2) * 40,
            "enemy-overwhelm",
            110,
            true,
          );
          if (e) this.time.delayedCall(3200, () => e.destroy());
        }
      },
    });
    this.emitToast("The Stress Spectre rises. Breathe — you have done harder things.");
  }

  private bossPhaseTwo() {
    this.bossPhase = 2;
    this.bossTimer?.remove();
    this.boss?.setAlpha(0.4);
    this.objective = "Phase 2: find the one true golden heart among the illusions.";
    const cx = 121 * TILE;
    const cy = 51 * TILE;
    const trueIndex = Phaser.Math.Between(0, 2);
    [-72, 0, 72].forEach((dx, i) => {
      const it = this.addInteractable(cx + dx, cy + 60, "golden-heart", "boss-heart", "Choose this heart", {
        id: String(i),
        data: { correct: i === trueIndex },
      });
      if (i === trueIndex) {
        this.tweens.add({
          targets: it.obj,
          alpha: { from: 0.85, to: 1 },
          duration: 700,
          yoyo: true,
          repeat: -1,
        });
      } else {
        it.obj.setAlpha(0.85);
      }
    });
    this.emitToast("The illusions scatter. One heart beats true.");
  }

  private defeatBoss() {
    this.bossPhase = 3;
    this.bossTimer?.remove();
    if (this.boss) {
      const { x, y } = this.boss;
      this.spawnSparkle(x, y, 0xffd7e5, 26);
      this.boss.destroy();
      this.boss = null;
      this.add.sprite(x, y, "arbor").setDepth(6);
    }
    this.interactables = this.interactables.filter((i) => {
      if (i.kind === "boss-heart") {
        i.obj.destroy();
        return false;
      }
      return true;
    });
    this.cameras.main.flash(500, 255, 215, 229);
    this.emitToast("The Spectre becomes a blooming garden arbor.");
    this.objective = "Claim the Anchor of Comfort and the Bloom of Reflection.";
    if (!this.save.relics_collected.includes("anchor"))
      this.addInteractable(113 * TILE, 45 * TILE, "relic", "relic", "Take the relic", { id: "anchor" });
    if (!this.save.relics_collected.includes("bloom"))
      this.addInteractable(129 * TILE, 45 * TILE, "relic", "relic", "Take the relic", { id: "bloom" });
  }

  // ---------------- ACT III ------------------------------------------------
  private buildAct3() {
    this.cameras.main.setBackgroundColor("#cfe3f7");
    this.makeMap(T.MARBLE, 303, (d) => {
      this.rect(d, 1, 1, MAP_W - 2, MAP_H - 2, T.MARBLE);
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
    });
    this.addPlayer(18, 51);

    this.zoneState["sheets"] = 0;
    const sheetSpots: [number, number][] = [
      [18, 18],
      [105, 22],
      [102, 86],
    ];
    sheetSpots.forEach(([x, y], i) =>
      this.addInteractable(x * TILE, y * TILE, "sheet", "sheet", "Pick up the music sheet", {
        id: String(i),
      }),
    );

    this.addInteractable(66 * TILE, 54 * TILE, "andrew", "andrew", "Talk with Andrew", {
      radius: 54,
    });
    this.addInteractable(60 * TILE, 50 * TILE, "stone-memory", "memory", "Touch the Memory Stone");
    if (!this.has(this.save.secret_envelopes_found, "patio"))
      this.addInteractable(16 * TILE, 18 * TILE, "envelope", "envelope", "Read the letter", {
        id: "patio",
      });
    if ((this.zoneState["keyTaken"] as boolean) !== true && this.save.vault_keys_count < 3)
      this.addInteractable(111 * TILE, 16 * TILE, "key", "vault-key", "Take the Golden Vault Key", {
        id: "haven",
      });
    this.addInteractable(90 * TILE, 54 * TILE, "rest-stone", "rest", "Rest here");

    if (this.save.relics_collected.includes("shield")) this.spawnGateway(66 * TILE, 18 * TILE);
  }

  // ---------------- ACT IV -------------------------------------------------
  private buildAct4() {
    this.cameras.main.setBackgroundColor("#0d1226");
    this.makeMap(T.SKY, 404, (d) => {
      this.rect(d, 0, 0, MAP_W, MAP_H, T.VOID);
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
      // scatter grey noise on the islands
      for (const [x, y, w, h] of islands)
        for (let j = 0; j < h; j++)
          for (let i = 0; i < w; i++) if ((i * 3 + j * 5) % 4 === 0) d[y + j]![x + i] = T.GREY;
    });
    this.addPlayer(20, 85);

    this.zoneState["pillars"] = [0, 0, 0];
    const pillarSpots: [number, number][] = [
      [54, 78],
      [88, 68],
      [42, 46],
    ];
    pillarSpots.forEach(([x, y], i) =>
      this.addInteractable(x! * TILE, y! * TILE, "pillar", "pillar", "Turn the crystal pillar", {
        id: String(i),
      }),
    );

    if (!this.has(this.save.secret_envelopes_found, "summit"))
      this.addInteractable(102 * TILE, 68 * TILE, "envelope", "envelope", "Read the letter", {
        id: "summit",
      });
    this.addInteractable(60 * TILE, 46 * TILE, "rest-stone", "rest", "Rest here");
    if (this.save.vault_keys_count < 3)
      this.addInteractable(103 * TILE, 36 * TILE, "key", "vault-key", "Take the Golden Vault Key", {
        id: "ascent",
      });
    this.addInteractable(115 * TILE, 36 * TILE, "vault-door", "vault", "Open the Vault of Gratitude");

    // moving platform ferry between two islands
    const ferry = this.add.rectangle(42 * TILE, 58 * TILE, 64, 48, 0xd7e0ff, 0.9).setDepth(3);
    this.tweens.add({
      targets: ferry,
      y: 30 * TILE,
      duration: 5200,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
    this.zoneState["ferry"] = ferry;

    if (this.save.relics_collected.includes("seal")) this.spawnGateway(84 * TILE, 16 * TILE);
  }

  private openStaircase() {
    this.rect2Live();
    this.objective = "The Celestial Staircase forms — reach the Altar of Joy.";
    this.emitToast("Three lights align. A staircase of stars unfolds.");
    if (!this.save.relics_collected.includes("seal"))
      this.addInteractable(84 * TILE, 16 * TILE, "relic", "relic", "Take the Seal of Perfect Peace", {
        id: "seal",
      });
  }

  private rect2Live() {
    for (let j = 8; j < 18; j++)
      for (let i = 80; i < 88; i++) this.layer.putTileAt(T.MARBLE, i, j);
    this.layer.setCollision(SOLID_TILES as unknown as number[]);
    this.cameras.main.flash(400, 215, 224, 255);
  }

  // ---------------- ACT V --------------------------------------------------
  private buildAct5() {
    this.cameras.main.setBackgroundColor("#2a1f38");
    this.makeMap(T.CANDLE, 505, (d) => {
      this.rect(d, 0, 0, MAP_W, MAP_H, T.CANDLE);
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
    for (let i = 0; i < 24; i++) {
      this.add.sprite((38 + (i % 2) * 56) * TILE, (18 + Math.floor(i / 2) * 5) * TILE, "guest").setDepth(6);
    }
    if (!this.has(this.save.secret_envelopes_found, "cathedral"))
      this.addInteractable(42 * TILE, 82 * TILE, "envelope", "envelope", "Read the letter", {
        id: "cathedral",
      });
    this.addInteractable(66 * TILE, 18 * TILE, "andrew-ceremony", "andrew-ceremony", "Meet Andrew", {
      radius: 60,
    });
    // stained glass glow
    this.add.rectangle(66 * TILE, 14 * TILE, 280, 56, 0xc9a24b, 0.5).setDepth(2);
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
      const x = Math.floor(rnd() * (MAP_W - 8)) + 4;
      const y = Math.floor(rnd() * (MAP_H - 8)) + 4;
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

  private peaceBurst() {
    if (this.frozen || !this.player.active) return;
    if (this.stamina < 12) return;
    this.stamina = Math.max(0, this.stamina - 12);
    const ring = this.add.circle(this.player.x, this.player.y, 20, 0xd61f2c, 0.22).setDepth(9);
    this.tweens.add({
      targets: ring,
      radius: 110,
      alpha: 0,
      duration: 420,
      onComplete: () => ring.destroy(),
    });
    for (let i = 0; i < 10; i++) {
      const p = this.petals.get(this.player.x, this.player.y, "petal") as
        | Phaser.Physics.Arcade.Sprite
        | null;
      if (!p) break;
      p.setActive(true).setVisible(true).setDepth(17);
      p.body!.reset(this.player.x, this.player.y);
      p.setCircle(5);
      const a = (i / 10) * Math.PI * 2;
      p.setVelocity(Math.cos(a) * 260, Math.sin(a) * 260);
      p.setAngularVelocity(300);
      this.time.delayedCall(520, () => {
        p.setActive(false).setVisible(false);
        p.body?.stop();
      });
    }
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
        this.player.setPosition(6 * TILE, 28 * TILE);
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
          this.addInteractable(66 * TILE, 58 * TILE, "relic", "relic", "Take the relic", {
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
        this.startBoss();
        break;
      }
      case "boss-heart": {
        const correct = Boolean(it.data?.["correct"]);
        if (correct) this.defeatBoss();
        else {
          this.removeInteractable(it);
          this.emitToast("An illusion dissolves. Look again.");
          this.hurtPlayerDirect();
        }
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
    const it = this.addInteractable(x, y, "gateway", "gateway", "Step through the gateway", {
      radius: 54,
    });
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
    const len = Math.hypot(vx, vy);
    if (len > 1) {
      vx /= len;
      vy /= len;
    }
    const dashing = time < this.dashUntil;
    const speed = SPEED * (dashing ? 3 : 1);
    this.player.setVelocity(vx * speed, vy * speed);

    if (vx !== 0) {
      this.facing = vx > 0 ? 1 : -1;
      this.player.setFlipX(this.facing < 0);
    }
    if (len > 0.05 && time - this.lastStepAt > 180) {
      this.lastStepAt = time;
      this.animStep = this.animStep === 0 ? 1 : 0;
      this.player.setTexture(`maria-${this.animStep}`);
    } else if (len <= 0.05) {
      this.player.setTexture("maria-0");
    }

    // stamina
    this.stamina = Math.min(100, this.stamina + (len > 0.05 ? 0.012 : 0.03) * delta);

    // aura position + tile transformation (throttled)
    this.aura.setPosition(this.player.x, this.player.y);
    if (time - this.lastAura > 90) {
      this.lastAura = time;
      this.transformTiles();
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
    this.pushHud();
  }

  private transformTiles() {
    const cx = Math.floor(this.player.x / TILE);
    const cy = Math.floor(this.player.y / TILE);
    const r = 3;
    const bloom = this.save.current_zone === "starry_ascent" ? T.SKY : T.BLOOM;
    for (let y = cy - r; y <= cy + r; y++) {
      for (let x = cx - r; x <= cx + r; x++) {
        const tile = this.layer.getTileAt(x, y);
        if (!tile || tile.index !== T.GREY) continue;
        if (Phaser.Math.Distance.Between(x * TILE, y * TILE, this.player.x, this.player.y) > 92)
          continue;
        this.layer.putTileAt(bloom, x, y);
        if (Phaser.Math.Between(0, 100) > 88) {
          const s = this.add
            .sprite(x * TILE + 16, y * TILE + 16, "spark")
            .setTint(0xffd7e5)
            .setDepth(8);
          this.tweens.add({
            targets: s,
            y: s.y - 24,
            alpha: 0,
            duration: 900,
            onComplete: () => s.destroy(),
          });
        }
      }
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
