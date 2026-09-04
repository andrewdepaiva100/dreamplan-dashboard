import * as Phaser from "phaser";

import { EV, type HudState } from "./events";
import { FOOD_BY_ID, HOUSE, ZONES } from "./content";
import type { QuestSave } from "./save";
import { buildHomeSprites } from "./textures";

type Parent = Phaser.Scene & { resumeFromHouse: () => void };

const ROOM_W = 860;
const ROOM_H = 560;

/**
 * Maria's home — one warm, hand-lit room she can step into from any act.
 * Chest for storage, hearth for cooking, bed for sleeping through the night.
 */
export class QuestHouseScene extends Phaser.Scene {
  private save!: QuestSave;
  private parentScene!: Parent;
  private player!: Phaser.Physics.Arcade.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private keys!: Record<string, Phaser.Input.Keyboard.Key>;
  private spots: { x: number; y: number; kind: string; label: string }[] = [];
  private promptText!: Phaser.GameObjects.Text;
  private stick = { x: 0, y: 0 };
  private frozen = false;
  private lastDir: "down" | "up" | "side" = "down";
  private facing = 1;

  constructor() {
    super("quest-house");
  }

  init(data: { save: QuestSave; parent: Parent }) {
    this.save = data.save;
    this.parentScene = data.parent;
  }

  create() {
    buildHomeSprites(this);
    this.frozen = false;
    this.spots = [];
    this.cameras.main.fadeIn(320, 0, 0, 0);
    this.cameras.main.setBackgroundColor("#241710");

    const ox = (this.scale.width - ROOM_W) / 2;
    const oy = (this.scale.height - ROOM_H) / 2;
    const cx = ox + ROOM_W / 2;

    const WALL_H = 118;
    const fy = oy + WALL_H;
    const fh = ROOM_H - WALL_H;

    // ---- plank floor -----------------------------------------------------
    const floor = this.add.graphics().setDepth(0);
    floor.fillStyle(0x7d5730, 1);
    floor.fillRect(ox, fy, ROOM_W, fh);
    const boards = [0x8a613a, 0x835c35, 0x91683e, 0x7f5932];
    const bh = 34;
    for (let i = 0; i * bh < fh; i++) {
      floor.fillStyle(boards[i % boards.length]!, 1);
      floor.fillRect(ox, fy + i * bh, ROOM_W, bh - 2);
      // seam
      floor.fillStyle(0x5d3f21, 0.5);
      floor.fillRect(ox, fy + i * bh + bh - 2, ROOM_W, 2);
      // staggered board joints
      const off = (i % 2) * 130;
      for (let x = off; x < ROOM_W; x += 260) {
        floor.fillStyle(0x5d3f21, 0.4);
        floor.fillRect(ox + x, fy + i * bh, 2, bh - 2);
      }
      // grain
      floor.fillStyle(0x000000, 0.05);
      floor.fillRect(ox, fy + i * bh + 8, ROOM_W, 2);
    }

    // ---- plaster wall with timber beams ----------------------------------
    const wall = this.add.graphics().setDepth(1);
    wall.fillStyle(0xc9ab86, 1);
    wall.fillRect(ox, oy, ROOM_W, WALL_H);
    wall.fillStyle(0xb99973, 0.55);
    wall.fillRect(ox, oy, ROOM_W, 26);
    wall.fillStyle(0x4a3320, 1);
    for (let x = 0; x <= ROOM_W - 22; x += 176) wall.fillRect(ox + x, oy, 22, WALL_H);
    wall.fillRect(ox, oy, ROOM_W, 16);
    // baseboard where wall meets floor
    wall.fillStyle(0x5b3f26, 1);
    wall.fillRect(ox, fy - 16, ROOM_W, 16);
    wall.fillStyle(0x2a1d12, 0.35);
    wall.fillRect(ox, fy, ROOM_W, 5);
    wall.lineStyle(6, 0x2a1d12, 1);
    wall.strokeRect(ox, oy, ROOM_W, ROOM_H);

    // ---- framed windows + daylight pools ---------------------------------
    for (const wx of [ox + 150, ox + ROOM_W - 150]) {
      const g = this.add.graphics().setDepth(2);
      g.fillStyle(0x4a3320, 1);
      g.fillRect(wx - 46, oy + 26, 92, 66);
      g.fillStyle(0x8fc4dd, 1);
      g.fillRect(wx - 38, oy + 33, 76, 50);
      g.fillStyle(0xd6ecf7, 0.5);
      g.fillRect(wx - 38, oy + 33, 76, 18);
      g.fillStyle(0x4a3320, 1);
      g.fillRect(wx - 3, oy + 33, 6, 50);
      g.fillRect(wx - 38, oy + 55, 76, 5);
      g.fillStyle(0x6b4a2c, 1);
      g.fillRect(wx - 54, oy + 90, 108, 9);
      // soft square of daylight on the boards below
      const pool = this.add.graphics().setDepth(3);
      pool.fillStyle(0xffe9b8, 0.16);
      pool.fillRect(wx - 44, fy + 6, 88, 74);
      pool.fillStyle(0xffe9b8, 0.1);
      pool.fillRect(wx - 60, fy + 6, 120, 110);
    }

    // ---- rug, table, shelf, picture --------------------------------------
    const rug = this.add.graphics().setDepth(3);
    rug.fillStyle(0x7d2f43, 1);
    rug.fillEllipse(cx, fy + 210, 300, 150);
    rug.fillStyle(0xc9a44c, 1);
    rug.fillEllipse(cx, fy + 210, 250, 118);
    rug.fillStyle(0x8f3550, 1);
    rug.fillEllipse(cx, fy + 210, 214, 96);
    rug.fillStyle(0xf0e0c0, 0.85);
    rug.fillEllipse(cx, fy + 210, 120, 52);
    rug.fillStyle(0x8f3550, 1);
    rug.fillEllipse(cx, fy + 210, 92, 36);

    // little side table with a candle and a mug
    const tbl = this.add.graphics().setDepth(9);
    tbl.fillStyle(0x6b4a2c, 1);
    tbl.fillRect(ox + 96, fy + 118, 96, 12);
    tbl.fillRect(ox + 104, fy + 130, 10, 40);
    tbl.fillRect(ox + 174, fy + 130, 10, 40);
    tbl.fillStyle(0xf1e3c6, 1);
    tbl.fillRect(ox + 128, fy + 96, 9, 24);
    tbl.fillStyle(0xffb347, 1);
    tbl.fillEllipse(ox + 132.5, fy + 92, 9, 14);
    tbl.fillStyle(0xd8dbe0, 1);
    tbl.fillRect(ox + 156, fy + 104, 16, 14);

    // hanging shelf + framed picture on the wall
    const shelf = this.add.graphics().setDepth(2);
    shelf.fillStyle(0x6b4a2c, 1);
    shelf.fillRect(cx - 70, oy + 74, 140, 8);
    shelf.fillStyle(0x9c6b3a, 1);
    shelf.fillRect(cx - 54, oy + 58, 14, 16);
    shelf.fillStyle(0xc36a7c, 1);
    shelf.fillRect(cx - 26, oy + 60, 12, 14);
    shelf.fillStyle(0x7fa88a, 1);
    shelf.fillRect(cx + 4, oy + 56, 16, 18);
    const pic = this.add.graphics().setDepth(2);
    pic.fillStyle(0xc9a44c, 1);
    pic.fillRect(cx + 120, oy + 34, 62, 48);
    pic.fillStyle(0x35507a, 1);
    pic.fillRect(cx + 126, oy + 40, 50, 36);
    pic.fillStyle(0xf2cf8e, 1);
    pic.fillCircle(cx + 151, oy + 54, 9);

    // ---- furniture -------------------------------------------------------
    this.furniture(ox + 120, fy + 60, "hearth", 1.7, "hearth", "Cook at the hearth");
    this.furniture(ox + ROOM_W - 150, fy + 60, "chest", 1.6, "chest", "Open the chest");
    this.furniture(ox + ROOM_W - 140, fy + 250, "bed", 1.8, "bed", "Sleep until morning");

    // ---- warm light: fire glow + candle, small and soft ------------------
    for (const [lx, ly, sc, a] of [
      [ox + 120, fy + 66, 1.5, 0.34],
      [ox + 132, fy + 92, 0.8, 0.26],
    ] as [number, number, number, number][]) {
      const l = this.add
        .sprite(lx, ly, "light-warm")
        .setDepth(30)
        .setBlendMode(Phaser.BlendModes.ADD)
        .setScale(sc)
        .setAlpha(a);
      this.tweens.add({
        targets: l,
        alpha: { from: a * 0.8, to: a * 1.15 },
        duration: 1700,
        yoyo: true,
        repeat: -1,
      });
    }

    // gentle vignette so the room edges fall away
    const vig = this.add.graphics().setDepth(33);
    for (let i = 0; i < 10; i++) {
      vig.fillStyle(0x1a0f08, 0.045);
      vig.fillRect(ox + i * 4, oy + i * 4, ROOM_W - i * 8, ROOM_H - i * 8);
    }

    // ---- door back outside ------------------------------------------------
    const dw = 104;
    const dg = this.add.graphics().setDepth(5);
    dg.fillStyle(0x4a3320, 1);
    dg.fillRect(cx - dw / 2 - 8, oy + ROOM_H - 66, dw + 16, 66);
    dg.fillStyle(0x2a1d12, 1);
    dg.fillRect(cx - dw / 2, oy + ROOM_H - 58, dw, 58);
    dg.fillStyle(0x6b4a2c, 0.6);
    dg.fillRect(cx - dw / 2 + 10, oy + ROOM_H - 26, dw - 20, 14);
    const door = { x: cx, y: oy + ROOM_H - 30 };
    this.add
      .text(door.x, oy + ROOM_H - 74, "▼ Outside", {
        fontFamily: "system-ui, sans-serif",
        fontSize: "12px",
        color: "#ffd977",
      })
      .setOrigin(0.5)
      .setDepth(40);
    this.spots.push({ x: door.x, y: door.y, kind: "door", label: "Step back outside" });

    // ---- Maria -----------------------------------------------------------
    this.player = this.physics.add.sprite(cx, oy + ROOM_H - 100, "maria-down-0");
    this.player.setScale(1.3).setDepth(20);
    this.player.anims.play("maria-idle-down");
    this.physics.world.setBounds(ox + 16, fy + 6, ROOM_W - 32, ROOM_H - WALL_H - 22);
    this.player.setCollideWorldBounds(true);
    this.add
      .ellipse(this.player.x, this.player.y + 18, 26, 12, 0x000000, 0.28)
      .setDepth(19)
      .setName("shadow");

    this.promptText = this.add
      .text(0, 0, "", {
        fontFamily: "system-ui, sans-serif",
        fontSize: "10px",
        color: "#0b1e3d",
        backgroundColor: "#ffffff",
        padding: { x: 5, y: 2 },
      })
      .setOrigin(0.5, 1)
      .setDepth(50)
      .setVisible(false);

    // ---- wooden name sign -------------------------------------------------
    const sign = this.add.graphics().setDepth(39);
    sign.fillStyle(0x3d2917, 1);
    sign.fillRoundedRect(cx - 108, oy + 20, 216, 34, 8);
    sign.lineStyle(3, 0xc9a44c, 1);
    sign.strokeRoundedRect(cx - 108, oy + 20, 216, 34, 8);
    this.add
      .text(cx, oy + 37, HOUSE.name, {
        fontFamily: "Georgia, serif",
        fontSize: "18px",
        color: "#ffe0a8",
      })
      .setOrigin(0.5)
      .setDepth(40);

    // ---- input -----------------------------------------------------------
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.keys = this.input.keyboard!.addKeys("W,A,S,D,E,ENTER") as Record<
      string,
      Phaser.Input.Keyboard.Key
    >;
    this.keys["E"]!.on("down", () => this.interact());
    this.keys["ENTER"]!.on("down", () => this.interact());

    const g = this.game.events;
    g.on(EV.stick, this.onStick, this);
    g.on(EV.interact, this.interact, this);
    g.on(EV.action, this.interact, this);
    g.on(EV.resume, this.onResume, this);
    g.on(EV.item, this.onItem, this);
    this.events.once("shutdown", () => {
      g.off(EV.stick, this.onStick, this);
      g.off(EV.interact, this.interact, this);
      g.off(EV.action, this.interact, this);
      g.off(EV.resume, this.onResume, this);
      g.off(EV.item, this.onItem, this);
    });

    this.game.events.emit(EV.music, "home");
    this.game.events.emit(EV.toast, HOUSE.welcome);
    this.pushHud();
  }

  private furniture(
    x: number,
    y: number,
    key: string,
    scale: number,
    kind: string,
    label: string,
  ) {
    this.add.sprite(x, y, key).setDepth(10).setScale(scale);
    this.spots.push({ x, y: y + 12, kind, label });
  }

  private onStick(v: { x: number; y: number }) {
    this.stick = v;
  }

  private onResume() {
    this.frozen = false;
  }

  private nearest() {
    let best: (typeof this.spots)[number] | null = null;
    let bd = 66;
    for (const s of this.spots) {
      const d = Phaser.Math.Distance.Between(s.x, s.y, this.player.x, this.player.y);
      if (d < bd) {
        bd = d;
        best = s;
      }
    }
    return best;
  }

  private interact() {
    if (this.frozen) return;
    const near = this.nearest();
    if (!near) return;
    if (near.kind === "door") {
      this.leave();
      return;
    }
    this.frozen = true;
    this.physics.pause();
    if (near.kind === "chest") {
      this.game.events.emit(EV.modal, {
        type: "chest",
        inventory: { ...this.save.inventory },
        chest: { ...this.save.chest },
      });
    } else if (near.kind === "hearth") {
      this.game.events.emit(EV.modal, { type: "hearth", inventory: { ...this.save.inventory } });
    } else {
      this.game.events.emit(EV.modal, { type: "bed" });
    }
  }

  /** Chest transfers, hearth cooking and sleeping all land here. */
  private onItem(msg: { action: string; id?: string }) {
    const id = msg.id ?? "";
    const inv = { ...this.save.inventory };
    const chest = { ...this.save.chest };
    const move = (from: Record<string, number>, to: Record<string, number>) => {
      if ((from[id] ?? 0) <= 0) return false;
      from[id] = from[id]! - 1;
      if (from[id]! <= 0) delete from[id];
      to[id] = (to[id] ?? 0) + 1;
      return true;
    };
    if (msg.action === "stash") {
      if (!move(inv, chest)) return;
      this.save.inventory = inv;
      this.save.chest = chest;
    } else if (msg.action === "take") {
      if (!move(chest, inv)) return;
      this.save.inventory = inv;
      this.save.chest = chest;
    } else if (msg.action === "cook") {
      const food = FOOD_BY_ID[id];
      if (!food?.cookedId || (inv[id] ?? 0) <= 0) return;
      inv[id] = inv[id]! - 1;
      if (inv[id]! <= 0) delete inv[id];
      inv[food.cookedId] = (inv[food.cookedId] ?? 0) + 1;
      this.save.inventory = inv;
      this.game.events.emit(EV.toast, `${food.name} cooked into ${FOOD_BY_ID[food.cookedId]?.name}.`);
    } else if (msg.action === "sleep") {
      this.save.time_of_day = 0.12;
      this.save.player_health = 5;
      this.game.events.emit(EV.toast, "You slept through the night. Full hearts, new morning.");
    } else {
      return;
    }
    this.game.events.emit(EV.save, { ...this.save });
    this.pushHud();
  }

  private leave() {
    this.frozen = true;
    this.cameras.main.fadeOut(260, 0, 0, 0);
    this.time.delayedCall(300, () => {
      this.game.events.emit(EV.music, "explore");
      this.scene.stop();
      this.scene.resume("quest");
      this.parentScene.resumeFromHouse();
    });
  }

  private pushHud() {
    const state: HudState = {
      health: this.save.player_health,
      maxHealth: 5,
      stamina: 100,
      dashProgress: 1,
      zone: this.save.current_zone,
      zoneTitle: HOUSE.name,
      act: ZONES[this.save.current_zone].act,
      objective: "Rest a while — cook, store what you've gathered, or sleep.",
      relics: this.save.relics_collected,
      envelopes: this.save.secret_envelopes_found,
      keys: this.save.vault_keys_count,
      prompt: null,
      weddingCompleted: this.save.wedding_completed,
      weapons: this.save.weapons,
      equipped: this.save.equipped_weapon,
      shield: null,
      timeOfDay: this.save.time_of_day,
      night: false,
      clock: "Home",
      inventory: this.save.inventory,
      indoors: true,
      boss: null,
    };
    this.game.events.emit(EV.hud, state);
  }

  override update(_time: number, _delta: number) {
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
    this.player.setVelocity(vx * 130, vy * 130);

    const moving = len > 0.05;
    let dir: "down" | "up" | "side" = this.lastDir;
    if (moving) {
      if (Math.abs(vx) > Math.abs(vy)) {
        dir = "side";
        this.facing = vx > 0 ? 1 : -1;
      } else {
        dir = vy < 0 ? "up" : "down";
      }
      this.lastDir = dir;
    }
    this.player.setFlipX(dir === "side" && this.facing < 0);
    const anim = `maria-${moving ? "walk" : "idle"}-${dir}`;
    if (this.player.anims.currentAnim?.key !== anim) this.player.anims.play(anim, true);

    const shadow = this.children.getByName("shadow") as Phaser.GameObjects.Ellipse | null;
    shadow?.setPosition(this.player.x, this.player.y + 18);

    const near = this.nearest();
    this.promptText
      .setPosition(this.player.x, this.player.y - 26)
      .setText(near ? `E — ${near.label}` : "")
      .setVisible(Boolean(near));
  }
}
