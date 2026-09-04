import * as Phaser from "phaser";

import { EV, type HudState } from "./events";
import { FOOD_BY_ID, HOUSE, ZONES } from "./content";
import type { QuestSave } from "./save";
import { buildHomeSprites } from "./textures";

type Parent = Phaser.Scene & { resumeFromHouse: () => void; save: QuestSave };

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

    // ---- stone fireplace on the back wall --------------------------------
    const fp = this.add.graphics().setDepth(2);
    const fpx = cx;
    // chimney stack
    fp.fillStyle(0x9aa0a6, 1);
    fp.fillRect(fpx - 34, oy - 4, 68, 46);
    fp.fillStyle(0x7d848a, 1);
    fp.fillRect(fpx - 40, oy + 34, 80, 12);
    // mantel body, widening down
    fp.fillStyle(0xb3b9be, 1);
    fp.fillRect(fpx - 62, oy + 46, 124, 40);
    fp.fillStyle(0x9aa0a6, 1);
    fp.fillRect(fpx - 78, oy + 76, 156, 42);
    // stone seams
    fp.fillStyle(0x767c82, 1);
    for (let r = 0; r < 5; r++) fp.fillRect(fpx - 78, oy + 8 + r * 22, 156, 2);
    for (let c = -3; c <= 3; c++) fp.fillRect(fpx + c * 24, oy + 8, 2, 108);
    // firebox
    fp.fillStyle(0x8a2f2a, 1);
    fp.fillRect(fpx - 42, oy + 52, 84, 60);
    fp.fillStyle(0x140d09, 1);
    fp.fillRect(fpx - 36, oy + 58, 72, 54);
    // flames + log bed
    fp.fillStyle(0xff8a2b, 1);
    fp.fillEllipse(fpx, oy + 98, 42, 26);
    fp.fillStyle(0xffd166, 1);
    fp.fillEllipse(fpx, oy + 100, 24, 16);
    fp.fillStyle(0x5b3f26, 1);
    fp.fillRect(fpx - 36, oy + 106, 72, 8);

    // ---- green woven rug with a fringed border ---------------------------
    const rug = this.add.graphics().setDepth(3);
    const rw = 150;
    const rh = 250;
    const rx = cx - 190;
    const ry = fy + 90;
    rug.fillStyle(0xe8dfc0, 1);
    rug.fillRect(rx - 5, ry - 5, rw + 10, rh + 10);
    rug.fillStyle(0x3f7a3f, 1);
    rug.fillRect(rx, ry, rw, rh);
    rug.fillStyle(0x4d9147, 1);
    rug.fillRect(rx + 6, ry + 6, rw - 12, rh - 12);
    rug.fillStyle(0x3f7a3f, 0.8);
    rug.fillRect(rx, ry + rh / 2 - 2, rw, 4);

    // ---- fur pelt on the boards ------------------------------------------
    const pelt = this.add.graphics().setDepth(3);
    pelt.fillStyle(0x6d4527, 1);
    pelt.fillEllipse(cx + 90, fy + 200, 190, 96);
    pelt.fillEllipse(cx + 10, fy + 178, 70, 56);
    pelt.fillEllipse(cx + 170, fy + 226, 66, 44);
    pelt.fillStyle(0x845732, 1);
    pelt.fillEllipse(cx + 96, fy + 196, 120, 54);

    // ---- bookshelf + potted tree -----------------------------------------
    const bs = this.add.graphics().setDepth(9);
    const bx = ox + 250;
    bs.fillStyle(0xc79a5b, 1);
    bs.fillRect(bx - 44, fy - 62, 88, 22);
    bs.fillStyle(0x9c6b3a, 1);
    bs.fillRect(bx - 40, fy - 40, 80, 62);
    bs.fillStyle(0x6b4a2c, 1);
    bs.fillRect(bx - 40, fy - 14, 80, 5);
    const bookCols = [0xd94f4f, 0x4f7fd9, 0x4fd97f, 0xe0c14a, 0xb06fd0];
    for (let r = 0; r < 2; r++)
      for (let i = 0; i < 5; i++) {
        bs.fillStyle(bookCols[(i + r) % bookCols.length]!, 1);
        bs.fillRect(bx - 34 + i * 14, fy - 36 + r * 26, 10, 20);
      }
    const pot = this.add.graphics().setDepth(9);
    pot.fillStyle(0x2f6b3a, 1);
    pot.fillTriangle(bx + 96, fy - 54, bx + 74, fy - 8, bx + 118, fy - 8);
    pot.fillStyle(0x3f8a4a, 1);
    pot.fillTriangle(bx + 96, fy - 40, bx + 80, fy - 10, bx + 112, fy - 10);
    pot.fillStyle(0xa8603a, 1);
    pot.fillRect(bx + 82, fy - 10, 28, 18);

    // ---- framed pictures on the wall -------------------------------------
    for (const [px, tone] of [
      [ox + 70, 0x6fa8dc],
      [cx + 190, 0x8fbf6f],
    ] as [number, number][]) {
      const pic = this.add.graphics().setDepth(2);
      pic.fillStyle(0x6b4a2c, 1);
      pic.fillRect(px - 32, oy + 34, 64, 48);
      pic.fillStyle(tone, 1);
      pic.fillRect(px - 26, oy + 40, 52, 36);
      pic.fillStyle(0x3f7a3f, 1);
      pic.fillRect(px - 26, oy + 62, 52, 14);
      pic.fillStyle(0xf2cf8e, 1);
      pic.fillCircle(px + 12, oy + 50, 7);
    }

    // small framed cluster low on the wall
    const cluster = this.add.graphics().setDepth(2);
    for (let i = 0; i < 4; i++) {
      cluster.fillStyle(0x9c6b3a, 1);
      cluster.fillRect(cx - 320 + (i % 2) * 34, oy + 60 + Math.floor(i / 2) * 26, 24, 20);
      cluster.fillStyle(0xdfe6ea, 1);
      cluster.fillRect(cx - 316 + (i % 2) * 34, oy + 64 + Math.floor(i / 2) * 26, 16, 12);
    }

    // ---- furniture -------------------------------------------------------
    this.furniture(cx, fy + 34, "hearth", 1.5, "hearth", "Cook at the hearth");
    this.furniture(ox + 96, fy + 210, "chest", 1.6, "chest", "Open the chest");
    this.furniture(ox + 104, fy + 90, "bed", 1.8, "bed", "Sleep until morning");

    // ---- warm light: fire glow + soft lamp, small and soft ---------------
    for (const [lx, ly, sc, a] of [
      [cx, oy + 100, 1.6, 0.34],
      [ox + 250, fy - 30, 0.7, 0.18],
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
    this.physics.resume();
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
      // Always wake at 7:00 AM, whatever hour Maria lay down.
      this.save.time_of_day = 7 / 24;
      this.save.player_health = 5;
      this.parentScene.save.time_of_day = 7 / 24;
      this.parentScene.save.player_health = 5;
      this.game.events.emit(EV.toast, "You slept until morning. Full hearts, 7:00 AM.");
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
