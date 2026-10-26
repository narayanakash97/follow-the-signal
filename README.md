# Follow the Signal

A playable career portfolio for Akash Narayan. Chapter 2, the recording studio, is playable. The other four chapters are listed as coming soon.

## Open it on your Mac

1. Open the **Terminal** app (press `Cmd + Space`, type `Terminal`, press Enter).
2. Paste this line and press Enter:

   ```
   cd ~/Desktop/"Akash Narayan AI Consultancy"/career-game && npm run dev
   ```

3. You should see a line like `Local: http://127.0.0.1:5173/`. Hold `Cmd` and click that address. The game opens in your browser.
4. To stop it, click back into Terminal and press `Ctrl + C`.

If the first time says packages are missing, run `npm ci` once in the same folder, then step 2 again.

## How to play

Click the room, then use the left and right arrow keys to walk and `E` to use what is nearby. Every action is also a button under the room, so it works on a phone.

## Files

| File | What it does |
|---|---|
| `src/state.ts` | The rules: what each action does and when a take can be delivered |
| `src/studio.ts` | The pixel room, the walking, the fan, the building site, the desk screen |
| `src/sprite.ts` | Pixel Akash. Each letter in the grid is one coloured pixel |
| `src/career.ts` | The career text on the cards. Change wording here |
| `src/main.ts` | The page around the game: buttons, messages, checklist |
| `src/audio.ts` | Optional demo sound, made in the browser. Never uses the microphone |

## Checks

`npm test` runs the rule and sprite tests. `npm run build` checks types and builds the site into `dist/`.
