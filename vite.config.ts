import { defineConfig } from 'vite';

// Two pages: the portfolio (index.html) and the full-screen game (play.html).
export default defineConfig({
  // Served from narayanakash97.github.io/follow-the-signal/ on GitHub Pages.
  base: '/follow-the-signal/',
  build: { rolldownOptions: { input: { main: 'index.html', play: 'play.html' } } },
});
