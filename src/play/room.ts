import * as Phaser from 'phaser';
import type { Stage } from '../stages';
import { input } from './input';
import { done, ensureTextures } from './world';
import * as hud from './hud';

export const FLOOR = 150, ROOM_W = 320;
export type Spot = { id: string; x: number; label: string; markerY?: number };

/**
 * A room you walk through and use things in. Each level draws its room,
 * lists its spots, and decides what E (and number keys) do.
 */
export abstract class Room extends Phaser.Scene {
  protected player!: Phaser.GameObjects.Image;
  protected near: Spot | null = null;
  protected over = false;
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
  /** Prompt shown when standing at a spot. */
  protected hint(spot: Spot) { return `E: ${spot.label}`; }

  create() {
    ensureTextures(this);
    this.over = false;
    this.near = null;
    this.reset();
    this.draw(this.add.graphics());
    this.player = this.add.image(16, FLOOR, 'akash0').setOrigin(0.5, 1).setDepth(5);
    this.marker = this.add.triangle(0, 0, 0, 0, 8, 0, 4, 5, 0xe4b367).setVisible(false).setDepth(6);
    input.handler = key => {
      if (key === 'Escape') this.leave();
      else if (this.over) return;
      else if ((key === 'e' || key === 'Enter') && this.near) this.use(this.near.id);
      else this.choose(key);
    };
    hud.where(this.stage);
    hud.prompt('← → walk · E use · Esc back to the street');
    hud.say(this.intro);
  }

  update(_: number, delta: number) {
    const dir = hud.cardOpen() ? 0 : (input.right ? 1 : 0) - (input.left ? 1 : 0);
    input.jump = false;
    if (dir) {
      this.player.x = Phaser.Math.Clamp(this.player.x + dir * 70 * delta / 1000, 10, ROOM_W - 10);
      this.player.setFlipX(dir < 0);
      this.walkClock += delta;
    }
    this.player.setTexture(`akash${dir ? Math.floor(this.walkClock / 160) % 2 : 0}`);
    const near = this.spots.find(s => Math.abs(s.x - this.player.x) < 14) ?? null;
    if (near) this.marker.setPosition(near.x, (near.markerY ?? 70) + Math.sin(this.time.now / 200) * 1.5);
    if (near !== this.near) {
      this.near = near;
      this.marker.setVisible(!!near);
      this.refreshPrompt();
    }
    if (!this.over) this.tick(delta);
  }

  protected refreshPrompt() {
    hud.prompt(this.near ? this.hint(this.near) : '← → walk · E use · Esc back to the street');
  }

  protected finish() {
    this.over = true;
    hud.card(this.stage, () => { done.add(this.stage.id); this.leave(); });
  }

  protected leave() { this.scene.start('world', { x: this.stage.x }); }
}
