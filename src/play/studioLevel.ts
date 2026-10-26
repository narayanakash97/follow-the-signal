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

const primary: Record<Exclude<Station, 'desk'>, Action> = { brief: 'read', fan: 'fan', window: 'quiet', mic: 'record', power: 'ground' };
const labels: Record<Station, string> = {
  brief: 'Client brief · E', fan: 'Fan · E switch', window: 'Window onto the building site · E talk to the crew',
  mic: 'Mic booth · E record', power: 'Power strip · E re-plug the desk and preamp onto it',
  desk: 'Mixing desk · 1 listen back · 2 clean up in post · 3 deliver',
};

export const studio = new StudioScene({
  ready() {
    state = initialState();
    studio.held = input;
    studio.show(state);
    input.handler = onKey;
    hud.where(stage);
    hud.prompt(WALK);
    hud.say('Square Wave Studios. A client needs a clean speech recording. Read the brief, then listen for everything that could ruin it.');
  },
  near(station) {
    near = station;
    hud.prompt(station ? labels[station] : WALK);
  },
  door(at) { hud.prompt(at ? 'E: leave by the door' : WALK); },
  leave,
  use(station) {
    if (station === 'desk') return listen();
    run(primary[station]);
    if (station === 'brief') hud.say(`${brief} Now look around the room.`);
  },
});

const WALK = '← → walk · E use · the door on the right leads back to the street';

function leave() { audio.stop(); studio.scene.start('world', { x: stage.x }); }

function onKey(key: string) {
  if (key === 'Escape') leave();
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
