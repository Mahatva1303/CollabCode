
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: [
      {
        find: /^monaco-editor\/esm\/vs\/editor\/editor\.api\.js$/,
        replacement: resolve(
          process.cwd(),
          'node_modules/monaco-editor/esm/vs/editor/editor.api.js'
        ),
      },
    ],
  },

  optimizeDeps: {
    exclude: ['y-monaco'],
  },

  server: {
    host: 'localhost',
    port: 5173,
  },
});
