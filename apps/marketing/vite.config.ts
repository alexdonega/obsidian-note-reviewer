import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  server: {
    port: 3002,
    host: '0.0.0.0',
  },
  plugins: [react(), tailwindcss()],
  resolve: {
    dedupe: ['react', 'react-dom'],
    alias: {
      '@': path.resolve(__dirname, '.'),
      '@obsidian-note-reviewer/ui': path.resolve(__dirname, '../../packages/ui'),
      '@obsidian-note-reviewer/editor/styles': path.resolve(__dirname, '../../packages/editor/index.css'),
      '@obsidian-note-reviewer/editor': path.resolve(__dirname, '../../packages/editor/App.tsx'),
    }
  },
  build: {
    target: 'esnext',
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        ptbr: path.resolve(__dirname, 'index.pt-br.html'),
      },
    },
  },
});
