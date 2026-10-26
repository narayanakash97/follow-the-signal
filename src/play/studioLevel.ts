import { StudioScene } from '../studio';
import { act, initialState, issues, type Action, type Station } from '../state';
import { stages, brief } from '../stages';
import { audio } from './sound';
import { input } from './input';
import { done } from './world';
import * as hud from './hud';

// Square Wave Studios inside the game: keyboard only, text in the HUD.
const stage = stages.find(s => s.id === 'squarewave')!;
let state = initialState();
let near: Station | null = null;

const primary: Record<Exclude<Station, 'desk'>, Action> = { brief: 'read', fan: 'fan', window: 'quiet', mic: 'record' };
const labels: Record<Station, string> = {
  brief: 'E: read the brief', fan: 'E: switch the fan', window: 'E: ask the site crew for a quiet window',
  mic: 'E: record a take', desk: '1: listen back · 2: clean it up in post · 3: deliver to the client',
};

export const studio = new StudioScene({
  ready() {
    state = initialState();
    studio.held = input;
    studio.show(state);
    input.handler = onKey;
    hud.where(stage);
    hud.prompt('← → walk · E use · Esc back to the street');
    hud.say('Square Wave Studios. A client needs a speech recording. Start with the brief on the wall.');
  },
  near(station) {
    near = station;
    hud.prompt(station ? labels[station] : '← → walk · E use · Esc back to the street');
  },
  use(station) {
    if (station === 'desk') return listen();
    run(primary[station]);
    if (station === 'brief') hud.say(`${brief} Now look around the room.`);
  },
});

function onKey(key: string) {
  if (key === 'Escape') { audio.stop(); studio.scene.start('world', { x: stage.x }); }
  else if (key === 'e' || key === 'Enter') studio.interact();
  else if (near === 'desk' && key === '1') listen();
  else if (near === 'desk' && key === '2') run('process');
  else if (near === 'desk' && key === '3') run('deliver');
}

function run(action: Action) {
  const result = act(state, action);
  const recorded = action === 'record' && result.state.take !== state.take;
  state = result.state;
  hud.say(result.message);
  if (recorded) { studio.flashRec(); void audio.play(state.take!); }
  studio.show(state);
  if (state.delivered) hud.card(stage, () => { done.add(stage.id); studio.scene.start('world', { x: stage.x }); });
}

function listen() {
  if (!state.take) return hud.say('Nothing recorded yet. Record a take at the mic first.');
  void audio.play(state.take);
  const problems = issues(state.take);
  hud.say(problems.length ? problems.join(' ') : 'Quiet room, raw take, nothing processed. This meets the brief. Press 3 to deliver.');
}
