// Pixel Akash, drawn from the user's avatar references: black afro, short beard,
// olive tee, tan cargo shorts, white high-tops. Each character is one pixel.
export const palette: Record<string, string> = {
  H: '#1b1a21', h: '#3a3744', // hair, highlight
  S: '#a5664a', s: '#87503a', // skin, shadow
  E: '#1a1210', B: '#262022', // eyes, beard
  T: '#46523a', t: '#323c2a', // olive tee, shade
  P: '#b38c5c', p: '#94714a', // tan shorts, pocket
  K: '#f1ede4', k: '#b7b2a6', // sneaker, sole
};

const top = [
  '....HHHHHHHH....',
  '..HHHhHHHHhHHH..',
  '.HHhHHHHHHHHhHH.',
  'HHHHHHhHHHHHHHHH',
  'HHhHHHHHHHHhHHHH',
  'HHHHHSSSSSSHHhHH',
  'HHHHSSSSSSSSHHHH',
  'HhHHSESSSSESHHHH',
  '.HHHSSSSSSSSHHH.',
  '..HHSSSssSSSHH..',
  '....BSSSSSSB....',
  '....BBSssSBB....',
  '.....BBBBBB.....',
  '......SSSS......',
  '...TTTTTTTTTT...',
  '..TTTTTTTTTTTT..',
  '..TTtTTTTTTtTT..',
  '..STTTTTTTTTTS..',
  '..STTTTTTTTTTS..',
  '..SttttttttttS..',
  '....PPPPPPPP....',
  '....PPPpPPPPp...',
];

const stand = [
  '....PPP..PPPp...',
  '....SS....SS....',
  '....SS....SS....',
  '...KKK....KKK...',
  '...kkkk...kkkk..',
];

const step = [
  '....PPP..PPP....',
  '...SS......SS...',
  '...SS......SS...',
  '..KKK......KKK..',
  '..kkkk.....kkkk.',
];

export const frames = [[...top, ...stand], [...top, ...step]];
export const SPRITE_W = 16;
export const SPRITE_H = frames[0].length;

export function drawSprite(frame: string[], scale = 1): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = SPRITE_W * scale;
  canvas.height = SPRITE_H * scale;
  const ctx = canvas.getContext('2d')!;
  frame.forEach((row, y) => [...row].forEach((c, x) => {
    if (c === '.') return;
    ctx.fillStyle = palette[c];
    ctx.fillRect(x * scale, y * scale, scale, scale);
  }));
  return canvas;
}
