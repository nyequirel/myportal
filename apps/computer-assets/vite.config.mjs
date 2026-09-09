import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const root = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  root,
  base: './',
  publicDir: fileURLToPath(new URL('./public', import.meta.url)),
  build: {
    outDir: fileURLToPath(new URL('../../docs/demos/computer-assets', import.meta.url)),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        index: fileURLToPath(new URL('./index.html', import.meta.url)),
        inventory: fileURLToPath(new URL('./inventory.html', import.meta.url)),
        reports: fileURLToPath(new URL('./reports.html', import.meta.url)),
        activity: fileURLToPath(new URL('./activity.html', import.meta.url)),
      },
    },
  },
});
