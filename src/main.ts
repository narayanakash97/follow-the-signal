import * as Phaser from 'phaser';
import './styles.css';
import { act, initialState, issues, type Action, type Station } from './state';
import { DemoAudio } from './audio';
import { StudioScene, stations, W, H } from './studio';
import { chapters, brief } from './career';
import { frames, drawSprite } from './sprite';

const app = document.querySelector<HTMLDivElement>('#app')!;
const studio = chapters.find(c => c.id === 'studio')!;
app.innerHTML = `
  <header class="top">
    <div class="who"><span id="portrait" aria-hidden="true"></span>
      <div><h1>Follow the Signal</h1><p>Akash Narayan</p></div></div>
    <nav class="top-actions">
      <a href="#story">Read my story</a>
      <button type="button" id="sound" aria-pressed="false">Sound: off</button>
    </nav>
  </header>
  <main class="layout">
    <section class="play" aria-labelledby="objective">
      <p class="chapter">Chapter 2 of 5 · The studio</p>
      <h2 id="objective">Deliver a clean, raw speech take that meets the client brief.</h2>
      <div id="stage" tabindex="0" aria-label="Studio room. Left and right arrows walk, E uses what is nearby. All actions are also available as buttons below."></div>
      <p class="hint">Click the room, then use <kbd>←</kbd> <kbd>→</kbd> to walk and <kbd>E</kbd> to use. Or use the buttons.</p>
      <div id="station-panel" class="panel">
        <h3 id="near">Walk up to something in the room.</h3>
        <div id="actions" class="actions"></div>
        <p id="message" role="status" aria-live="polite">Start with the client brief on the wall.</p>
        <div class="walk" role="group" aria-label="Walk to">
          <span>Walk to</span>
          ${stations.map(s => `<button type="button" data-walk="${s.id}">${s.label}</button>`).join('')}
        </div>
        <ul id="checklist" class="checklist" aria-label="Session checklist"></ul>
      </div>
    </section>
    <aside class="side">
      <details id="card" class="card">
        <summary>The real story behind this room</summary>
        <p class="period">${studio.period}</p>
        <p>${studio.card}</p>
        <p class="note">The room is a fictional exercise. It is not a recording of a client project.</p>
      </details>
      <section class="map" aria-labelledby="map-title">
        <h3 id="map-title">The journey</h3>
        <ol>${chapters.map(c => `<li class="${c.playable ? 'here' : ''}"><strong>${c.title}</strong>
          <span>${c.playable ? 'Playable now' : 'Coming soon'}</span></li>`).join('')}</ol>
      </section>
    </aside>
  </main>
  <section id="story" class="story" aria-labelledby="story-title">
    <h2 id="story-title">My story, in writing</h2>
    ${chapters.map(c => `<article><h3>${c.title}</h3><p class="period">${c.period}</p><p>${c.card}</p></article>`).join('')}
  </section>`;

document.querySelector('#portrait')!.append(drawSprite(frames[0], 3));

const $ = <T extends HTMLElement>(sel: string) => document.querySelector<T>(sel)!;
const audio = new DemoAudio();
let state = initialState();
let near: Station | null = null;

const scene = new StudioScene({
  near(station) { near = station; renderPanel(); },
  use(station) { useStation(station); },
  ready() { scene.show(state); },
});
new Phaser.Game({
  type: Phaser.AUTO, parent: 'stage', width: W, height: H, pixelArt: true,
  backgroundColor: '#2b2a33', scene,
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
});

function run(action: Action) {
  const result = act(state, action);
  const recorded = action === 'record' && result.state.take !== state.take;
  state = result.state;
  say(result.message);
  if (recorded) { scene.flashRec(); void audio.play(state.take!); }
  if (state.delivered) ($('#card') as HTMLDetailsElement).open = true;
  scene.show(state);
  renderPanel();
}

function say(text: string) { $('#message').textContent = text; }

function listen() {
  const problems = issues(state.take);
  if (state.take) void audio.play(state.take);
  say(problems.length ? problems.join(' ') : 'Quiet room, raw take, nothing processed. This meets the brief.');
}

// The E key does whatever the first button for that station does.
function useStation(station: Station) {
  const first = buttonsFor(station)[0];
  if (first.disabled) say('Nothing to do here right now.');
  else first.onClick();
}

type Btn = { label: string; onClick: () => void; disabled?: boolean };
function buttonsFor(station: Station): Btn[] {
  if (state.delivered) return [{ label: 'Replay the studio', onClick: replay }];
  switch (station) {
    case 'brief': return [{ label: state.briefRead ? 'Read the brief again' : 'Read the brief', onClick: () => { run('read'); say(`${brief} Now inspect the room.`); } }];
    case 'fan': return [{ label: state.fan ? 'Switch off the fan' : 'Switch the fan back on', onClick: () => run('fan') }];
    case 'window': return [{ label: 'Ask the site crew for a quiet window', onClick: () => run('quiet'), disabled: !state.construction }];
    case 'mic': return [{ label: 'Record a take', onClick: () => run('record') }];
    case 'desk': return [
      { label: 'Listen back', onClick: listen, disabled: !state.take },
      { label: 'Clean it up in post', onClick: () => run('process'), disabled: !state.take },
      { label: 'Deliver to the client', onClick: () => run('deliver') },
    ];
  }
}

function renderPanel() {
  const label = stations.find(s => s.id === near)?.label;
  $('#near').textContent = state.delivered ? 'Session delivered.' : label ? `Nearby: ${label}` : 'Walk up to something in the room.';
  const actions = $('#actions');
  actions.replaceChildren(...(near || state.delivered ? buttonsFor(near ?? 'desk') : []).map(b => {
    const el = document.createElement('button');
    el.type = 'button'; el.textContent = b.label; el.disabled = !!b.disabled;
    el.addEventListener('click', b.onClick);
    return el;
  }));
  const checks: [string, boolean][] = [
    ['Read the brief', state.briefRead],
    ['Fan off', !state.fan],
    ['Quiet window arranged', !state.construction],
    ['Fresh raw take that meets the brief', !!state.take && issues(state.take).length === 0],
    ['Delivered', state.delivered],
  ];
  $('#checklist').innerHTML = checks.map(([t, ok]) => `<li class="${ok ? 'done' : ''}">${ok ? '✓' : '○'} ${t}</li>`).join('');
}

function replay() {
  state = initialState();
  audio.stop();
  ($('#card') as HTMLDetailsElement).open = false;
  scene.reset();
  scene.show(state);
  say('Fresh session. Start with the client brief on the wall.');
  renderPanel();
  $('#stage').focus();
}

document.querySelectorAll<HTMLButtonElement>('[data-walk]').forEach(b =>
  b.addEventListener('click', () => scene.walkTo(b.dataset.walk as Station)));

$('#sound').addEventListener('click', async e => {
  const btn = e.currentTarget as HTMLButtonElement;
  await audio.setEnabled(!audio.enabled);
  btn.setAttribute('aria-pressed', String(audio.enabled));
  btn.textContent = audio.enabled ? 'Sound: on' : 'Sound: off';
});

// Keys only drive the game while the room has focus, so they never clash with page buttons.
const stage = $('#stage');
const keyDir: Record<string, 'left' | 'right'> = { ArrowLeft: 'left', a: 'left', ArrowRight: 'right', d: 'right' };
stage.addEventListener('pointerdown', () => stage.focus());
stage.addEventListener('keydown', e => {
  if (keyDir[e.key]) { scene.held[keyDir[e.key]] = true; e.preventDefault(); }
  else if ((e.key === 'e' || e.key === ' ' || e.key === 'Enter') && !e.repeat) { scene.interact(); e.preventDefault(); }
});
stage.addEventListener('keyup', e => { if (keyDir[e.key]) scene.held[keyDir[e.key]] = false; });
stage.addEventListener('blur', () => { scene.held.left = scene.held.right = false; });

renderPanel();
