import { input } from './input';
import type { Stage } from '../stages';

// Text lives in the page over the canvas, so it stays sharp at any screen size.
const $ = (id: string) => document.getElementById(id)!;

export function where(stage: Stage | undefined) {
  $('where').textContent = stage ? `${stage.place} · ${stage.years}` : '';
}

/** Overrides the top-left line, e.g. for a countdown. */
export function status(text: string) { $('where').textContent = text; }

export function prompt(text: string) { $('prompt').textContent = text; }

export function say(text: string) {
  const el = $('say');
  el.textContent = text;
  el.hidden = !text;
  // Restart the pop animation so every new message catches the eye.
  el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop');
}

export const cardOpen = () => !$('card').hidden;

/** Shows a story card and hands the keyboard to it until Enter or Escape. */
export function card(stage: Stage, onClose: () => void) {
  const prev = input.handler;
  input.left = input.right = false;
  $('card-title').textContent = stage.title;
  $('card-meta').textContent = `${stage.place} · ${stage.years}`;
  $('card-story').textContent = stage.story;
  $('card').hidden = false;
  input.handler = key => {
    if (key !== 'Enter' && key !== 'Escape' && key !== 'e') return;
    $('card').hidden = true;
    input.handler = prev;
    onClose();
  };
}
