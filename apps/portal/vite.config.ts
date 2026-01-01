import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { viteCSPPortal } from '@obsidian-note-reviewer/security/vite-plugin-csp';
import pkg from '../../package.json';

export default defineConfig({
  server: {
    port: 3001,
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: 'http://localhost:3002',
        changeOrigin: true,
      },
    },
  },
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  plugins: [react(), tailwindcss(), viteCSPPortal()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
      '@obsidian-note-reviewer/ui': path.resolve(__dirname, '../../packages/ui'),
      '@obsidian-note-reviewer/editor/styles': path.resolve(__dirname, '../../packages/editor/index.css'),
      '@obsidian-note-reviewer/editor': path.resolve(__dirname, '../../packages/editor/App.tsx'),
    }
  },
  build: {
    target: 'esnext',
  },
});
