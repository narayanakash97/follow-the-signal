import * as Phaser from 'phaser';
import { stages, type Stage } from '../stages';
import { input } from './input';
import { done, ensureTextures } from './world';
import * as hud from './hud';

export const FLOOR = 150, ROOM_W = 320;
export type Spot = { id: string; x: number; label: string; markerY?: number };
/** Every room has a way out at its right-hand end. */
const EXIT: Spot = { id: 'exit', x: 312, label: 'Door to the street', markerY: 104 };

/**
 * A room you walk through and use things in. Each level draws its room,
 * lists its spots, and decides what E (and number keys) do.
 */
export abstract class Room extends Phaser.Scene {
  protected player!: Phaser.GameObjects.Image;
  protected near: Spot | null = null;
  protected over = false;
  /** When true, ← → are left for the level (e.g. an EQ) instead of walking. */
  protected frozen = false;
  /** Countdown in ms; 0 means no clock. */
  protected limit = 0;
  protected left = 0;
  protected outOfTime = 'Out of time.';
  private marker!: Phaser.GameObjects.Triangle;
  private walkClock = 0;

  abstract stage: Stage;
  abstract spots: Spot[];
  abstract intro: string;
  protected abstract draw(g: Phaser.GameObjects.Graphics): void;
  protected abstract use(id: string): void;
  protected choose(_key: string): void {}
  protected tick(_delta: number): void {}
  protected reset(): void {}
  /** Prompt shown when standing at a spot. Names the thing; working out what to do is the game. */
  protected hint(spot: Spot) { return `${spot.label} · E`; }

  create() {
    ensureTextures(this);
    this.over = false;
    this.frozen = false;
    this.near = null;
    this.left = this.limit;
    this.reset();
    this.draw(this.add.graphics());
    drawDoor(this.add.graphics());
    this.player = this.add.image(16, FLOOR, 'akash0').setOrigin(0.5, 1).setDepth(5);
    this.marker = this.add.triangle(0, 0, 0, 0, 8, 0, 4, 5, 0xe4b367).setVisible(false).setDepth(6);
    input.handler = key => {
      if (key === 'Escape') this.leave();
      else if (this.over) return;
      else if ((key === 'e' || key === 'Enter') && this.near?.id === 'exit') this.leave();
      else if ((key === 'e' || key === 'Enter') && this.near) this.use(this.near.id);
      else this.choose(key);
    };
    hud.where(this.stage);
    hud.prompt('← → walk · E use · the door on the right leads back to the street');
    hud.say(this.intro);
  }

  update(_: number, delta: number) {
    const dir = hud.cardOpen() || this.frozen ? 0 : (input.right ? 1 : 0) - (input.left ? 1 : 0);
    input.jump = false;
    if (dir) {
      this.player.x = Phaser.Math.Clamp(this.player.x + dir * 70 * delta / 1000, 10, ROOM_W - 10);
      this.player.setFlipX(dir < 0);
      this.walkClock += delta;
    }
    this.player.setTexture(`akash${dir ? Math.floor(this.walkClock / 160) % 2 : 0}`);
    const near = this.player.x > EXIT.x - 10 ? EXIT : this.spots.find(s => Math.abs(s.x - this.player.x) < 14) ?? null;
    if (near) this.marker.setPosition(near.x, (near.markerY ?? 70) + Math.sin(this.time.now / 200) * 1.5);
    if (near !== this.near) {
      this.near = near;
      this.marker.setVisible(!!near);
      this.refreshPrompt();
    }
    if (this.over) return;
    if (this.limit) {
      this.left -= delta;
      hud.status(`${this.stage.place} · ${Math.max(0, Math.ceil(this.left / 1000))}s left`);
      if (this.left <= 0) return this.fail(this.outOfTime);
    }
    this.tick(delta);
  }

  /** Costs time for a wrong move. */
  protected penalty(ms: number) { if (this.limit) this.left -= ms; }

  protected fail(text: string) {
    this.over = true;
    this.frozen = false;
    hud.say(`${text} Trying again.`);
    this.time.delayedCall(2500, () => this.scene.restart());
  }

  protected refreshPrompt() {
    hud.prompt(this.near ? this.hint(this.near) : '← → walk · E use · the door on the right leads back to the street');
  }

  protected finish() {
    this.over = true;
    hud.card(this.stage, () => {
      done.add(this.stage.id);
      if (this.stage.id === stages[stages.length - 1].id) hud.queueEnding();
      this.leave();
    });
  }

  protected leave() { this.scene.start('world', { x: this.stage.x }); }
}

/** The exit door, drawn the same in every room. Shared with the studio. */
export function drawDoor(g: Phaser.GameObjects.Graphics) {
  g.setDepth(1);
  g.fillStyle(0x15141a).fillRect(304, 108, 16, 42);
  g.lineStyle(2, 0x8a6a4a).strokeRect(304, 108, 16, 42);
  g.fillStyle(0xe4b367).fillCircle(308, 130, 1.5);
  g.fillStyle(0x7fd18b).fillRect(306, 102, 12, 4);
}
