// One keyboard listener for the whole game. The page is full screen, so it always has focus.
export const input = {
  left: false, right: false, jump: false,
  /** Set by whichever scene or card is active. Receives E, Enter, Escape, 1-3 and similar. */
  handler: (_key: string) => {},
};

const dirs: Record<string, 'left' | 'right'> = { ArrowLeft: 'left', a: 'left', ArrowRight: 'right', d: 'right' };
const jumps = new Set(['ArrowUp', 'w', ' ']);

window.addEventListener('keydown', e => {
  const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
  if (dirs[key]) input[dirs[key]] = true;
  else if (jumps.has(key)) input.jump = true;
  else if (!e.repeat) input.handler(key);
  if (dirs[key] || jumps.has(key)) e.preventDefault();
});
window.addEventListener('keyup', e => {
  const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
  if (dirs[key]) input[dirs[key]] = false;
});
window.addEventListener('blur', () => { input.left = input.right = false; });
