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

    // ---- room shell -----------------------------------------------------
    const floor = this.add.graphics().setDepth(0);
    floor.fillStyle(0x9a6d3f, 1);
    floor.fillRect(ox, oy + 70, ROOM_W, ROOM_H - 70);
    floor.fillStyle(0xb0824d, 1);
    for (let y = 0; y < 12; y++) {
      for (let x = 0; x < 16; x++) {
        if ((x + y) % 2 === 0) floor.fillRect(ox + x * 40, oy + 70 + y * 30, 40, 30);
      }
    }
    const wall = this.add.graphics().setDepth(1);
    wall.fillStyle(0x6d5036, 1);
    wall.fillRect(ox, oy, ROOM_W, 70);
    wall.fillStyle(0x543c27, 1);
    wall.fillRect(ox, oy + 62, ROOM_W, 10);
    wall.lineStyle(6, 0x2a1d12, 1);
    wall.strokeRect(ox, oy, ROOM_W, ROOM_H);

    this.add.sprite(ox + 90, oy + 34, "window-warm").setDepth(2).setScale(1.2);
    this.add.sprite(ox + ROOM_W - 90, oy + 34, "window-warm").setDepth(2).setScale(1.2);
    this.add.sprite(cx, oy + 250, "rug").setDepth(2).setAlpha(0.95);
    this.add.sprite(ox + 120, oy + 300, "table").setDepth(6);

    // ---- warm light ------------------------------------------------------
    for (const [lx, ly, sc] of [
      [cx, oy + 150, 3.4],
      [ox + 120, oy + 140, 2],
      [ox + ROOM_W - 120, oy + 300, 1.8],
    ] as [number, number, number][]) {
      const l = this.add
        .sprite(lx, ly, "light-warm")
        .setDepth(30)
        .setBlendMode(Phaser.BlendModes.ADD)
        .setScale(sc)
        .setAlpha(0.4);
      this.tweens.add({
        targets: l,
        alpha: { from: 0.34, to: 0.5 },
        duration: 2200,
        yoyo: true,
        repeat: -1,
      });
    }

    // ---- furniture -------------------------------------------------------
    this.furniture(ox + 110, oy + 130, "hearth", 1.6, "hearth", "Cook at the hearth");
    this.furniture(ox + ROOM_W - 140, oy + 160, "chest", 1.5, "chest", "Open the chest");
    this.furniture(ox + ROOM_W - 130, oy + 330, "bed", 1.6, "bed", "Sleep until morning");

    // door back outside
    const door = this.add.rectangle(cx, oy + ROOM_H - 8, 84, 16, 0x2a1d12).setDepth(5);
    this.add
      .text(door.x, door.y - 22, "▼ Outside", {
        fontFamily: "system-ui, sans-serif",
        fontSize: "12px",
        color: "#ffd977",
      })
      .setOrigin(0.5)
      .setDepth(40);
    this.spots.push({ x: door.x, y: door.y, kind: "door", label: "Step back outside" });

    // ---- Maria -----------------------------------------------------------
    this.player = this.physics.add.sprite(cx, oy + ROOM_H - 70, "maria-down-0");
    this.player.setScale(1.3).setDepth(20);
    this.player.anims.play("maria-idle-down");
    this.physics.world.setBounds(ox + 16, oy + 78, ROOM_W - 32, ROOM_H - 92);
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

    this.add
      .text(cx, oy + 30, HOUSE.name, {
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
