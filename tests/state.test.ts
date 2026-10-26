import { test } from 'node:test';
import assert from 'node:assert/strict';
import { act, initialState, issues, type Action } from '../src/state.ts';
const run = (...actions: Action[]) => actions.reduce((s, a) => act(s, a).state, initialState());
test('a room fix does not repair an already recorded take', () => {
  const state = run('read', 'record', 'fan', 'quiet', 'ground', 'deliver');
  assert.equal(state.delivered, false);
  assert.equal(issues(state.take).length, 3);
});
test('a fresh quiet raw take can be delivered', () => {
  const state = run('read', 'record', 'fan', 'quiet', 'ground', 'record', 'deliver');
  assert.equal(state.delivered, true);
  assert.deepEqual(issues(state.take), []);
});
test('processing prevents acceptance until a new raw take is made', () => {
  const state = run('read', 'fan', 'quiet', 'ground', 'record', 'process', 'deliver');
  assert.equal(state.delivered, false);
  assert.match(issues(state.take)[0], /processed/);
  assert.equal(act(act(state, 'record').state, 'deliver').state.delivered, true);
});
test('the hum survives fixing the fan and the window until the ground loop is fixed', () => {
  const state = run('read', 'fan', 'quiet', 'record', 'deliver');
  assert.equal(state.delivered, false);
  assert.deepEqual(issues(state.take), ['A low 50 Hz hum runs under the whole take.']);
});
test('recording requires the brief and delivery requires a take', () => {
  assert.equal(run('record').take, null);
  assert.equal(run('read', 'fan', 'quiet', 'ground', 'deliver').delivered, false);
});
test('repeat actions cannot mutate a delivered session; reset creates fresh state', () => {
  const state = run('read', 'fan', 'quiet', 'ground', 'record', 'deliver');
  assert.deepEqual(act(state, 'process').state, state);
  const reset = initialState();
  assert.equal(reset.take, null);
  assert.equal(reset.fan, true);
  assert.equal(reset.delivered, false);
});
