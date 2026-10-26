import { test } from 'node:test';
import assert from 'node:assert/strict';
import { frames, palette, SPRITE_W } from '../src/sprite.ts';
test('every sprite row is full width and uses only palette colours', () => {
  for (const frame of frames) for (const row of frame) {
    assert.equal(row.length, SPRITE_W, row);
    for (const c of row) assert.ok(c === '.' || c in palette, `unknown pixel ${c}`);
  }
  assert.equal(frames[0].length, frames[1].length);
});
