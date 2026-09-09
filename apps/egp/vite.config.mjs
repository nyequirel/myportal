import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const root = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  root,
  base: './',
  publicDir: fileURLToPath(new URL('./public', import.meta.url)),
  build: {
    outDir: fileURLToPath(new URL('../../docs/demos/egp', import.meta.url)),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        index: fileURLToPath(new URL('./index.html', import.meta.url)),
        announce: fileURLToPath(new URL('./announce.html', import.meta.url)),
        sync: fileURLToPath(new URL('./sync.html', import.meta.url)),
        emailReport: fileURLToPath(new URL('./email-report.html', import.meta.url)),
      },
    },
  },
});
