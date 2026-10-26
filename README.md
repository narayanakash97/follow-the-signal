# Follow the Signal

A playable career portfolio for Akash Narayan. Two pages: the portfolio (`index.html`) and a full-screen laptop game (`play.html`). The game is one walkable world from Delhi to Paris with six stops. Square Wave Studios is a playable level; the other stops show their story card for now.

## Open it on your Mac

1. Open the **Terminal** app (press `Cmd + Space`, type `Terminal`, press Enter).
2. Paste this line and press Enter:

   ```
   cd ~/Desktop/"Akash Narayan AI Consultancy"/career-game && npm run dev
   ```

3. You should see a line like `Local: http://127.0.0.1:5173/`. Hold `Cmd` and click that address. The portfolio opens. Click **Play my career** for the game.
4. To stop it, click back into Terminal and press `Ctrl + C`.

If the first time says packages are missing, run `npm ci` once in the same folder, then step 2 again.

## How to play

Press any key to start (it goes full screen). Arrow keys walk, Up or Space jumps, `E` enters a building, `M` turns sound on, `Esc` leaves a level. Inside the studio, `1` `2` `3` are the desk choices.

## Files

| File | What it does |
|---|---|
| `src/stages.ts` | The six career stops and their text. Change wording here |
| `src/play/world.ts` | The walkable world, buildings, gates |
| `src/play/studioLevel.ts` | The Square Wave level's controls and messages |
| `src/state.ts` | Studio rules: what each action does and when a take can be delivered |
| `src/studio.ts` | The pixel room, the walking, the fan, the building site, the desk screen |
| `src/sprite.ts` | Pixel Akash. Each letter in the grid is one coloured pixel |
| `src/main.ts` | The portfolio page |
| `src/audio.ts` | Optional demo sound, made in the browser. Never uses the microphone |

## Checks

`npm test` runs the rule and sprite tests. `npm run build` checks types and builds the site into `dist/`.
