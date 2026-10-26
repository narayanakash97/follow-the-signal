import { defineConfig } from 'vite';

// Two pages: the portfolio (index.html) and the full-screen game (play.html).
export default defineConfig({
  build: { rolldownOptions: { input: { main: 'index.html', play: 'play.html' } } },
});
