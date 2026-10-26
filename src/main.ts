import './styles.css';
import { stages } from './stages';
import { frames, drawSprite } from './sprite';

// The portfolio: plain, readable, works on a phone. The game lives on play.html.
document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <header class="top">
    <div class="who"><span id="portrait" aria-hidden="true"></span>
      <div><h1>Akash Narayan</h1><p>Law, sound, and AI evaluation</p></div></div>
    <a class="play" href="play.html">Play my career →</a>
  </header>
  <main class="story">
    ${stages.map(s => `<article><h2>${s.title}</h2><p class="period">${s.place} · ${s.years}</p><p>${s.story}</p></article>`).join('')}
  </main>`;

document.querySelector('#portrait')!.append(drawSprite(frames[0], 3));
