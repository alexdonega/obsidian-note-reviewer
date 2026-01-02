// Optimized Vite Configuration for Production
// Replace vite.config.ts with this for optimized builds

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import compression from 'vite-plugin-compression';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

export default defineConfig({
  plugins: [
    react({
      // Use SWC for faster builds
      jsxRuntime: 'automatic',
      babel: {
        plugins: [
          // Remove console.log in production
          ['babel-plugin-transform-remove-console', { exclude: ['error', 'warn'] }],
        ],
      },
    }),

    // Bundle analyzer
    visualizer({
      filename: './dist/stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
      template: 'treemap', // 'sunburst', 'treemap', 'network'
    }),

    // Gzip & Brotli compression
    compression({
      algorithm: 'gzip',
      ext: '.gz',
      threshold: 1024, // Only compress files > 1KB
      deleteOriginFile: false,
    }),
    compression({
      algorithm: 'brotliCompress',
      ext: '.br',
      threshold: 1024,
      deleteOriginFile: false,
    }),

    // PWA for offline support
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
      manifest: {
        name: 'Obsidian Note Reviewer',
        short_name: 'NoteReviewer',
        description: 'Review and annotate your Obsidian notes',
        theme_color: '#6366f1',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
      workbox: {
        // Cache strategies
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*\.(jpg|jpeg|png|gif|webp)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'image-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
            },
          },
          {
            urlPattern: /\/api\/notes/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 5, // 5 minutes
              },
              networkTimeoutSeconds: 10,
            },
          },
        ],
      },
    }),
  ],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './lib'),
      '@components': path.resolve(__dirname, './components'),
      '@hooks': path.resolve(__dirname, './hooks'),
    },
  },

  build: {
    // Target modern browsers for smaller bundles
    target: 'es2020',

    // Rollup options
    rollupOptions: {
      output: {
        // Manual chunking for better caching
        manualChunks: {
          // React vendor chunk
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],

          // UI library chunk
          'vendor-ui': [
            '@headlessui/react',
            '@heroicons/react',
            'clsx',
            'tailwind-merge',
          ],

          // Supabase chunk
          'vendor-supabase': ['@supabase/supabase-js', '@supabase/auth-helpers-react'],

          // OpenTelemetry chunk (lazy load)
          'vendor-otel': [
            '@opentelemetry/api',
            '@opentelemetry/sdk-trace-web',
            '@opentelemetry/exporter-trace-otlp-http',
          ],

          // Editor chunk (lazy load)
          'vendor-editor': ['slate', 'slate-react'],

          // Utils chunk
          'utils': ['date-fns', 'lodash-es', 'uuid'],
        },

        // Optimize chunk names for better caching
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId
            ? chunkInfo.facadeModuleId.split('/').pop()
            : 'chunk';
          return `assets/js/${chunkInfo.name}-[hash].js`;
        },
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const ext = assetInfo.name?.split('.').pop();
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext || '')) {
            return 'assets/img/[name]-[hash][extname]';
          }
          if (/woff2?|ttf|eot/.test(ext || '')) {
            return 'assets/fonts/[name]-[hash][extname]';
          }
          return 'assets/[ext]/[name]-[hash][extname]';
        },
      },

      // External dependencies (if using CDN)
      // external: ['react', 'react-dom'],
    },

    // Minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log
        drop_debugger: true, // Remove debugger
        pure_funcs: ['console.log', 'console.info'], // Remove specific functions
        passes: 2, // Multiple passes for better compression
      },
      mangle: {
        safari10: true, // Safari 10 bugfix
      },
      format: {
        comments: false, // Remove comments
      },
    },

    // Source maps (disable in production for smaller bundles)
    sourcemap: process.env.NODE_ENV !== 'production',

    // CSS code splitting
    cssCodeSplit: true,

    // Chunk size warnings
    chunkSizeWarningLimit: 1000, // 1000 KB

    // Asset inlining threshold
    assetsInlineLimit: 4096, // 4KB (default)

    // Optimize CSS
    cssMinify: true,

    // Report compressed size
    reportCompressedSize: true,

    // Output directory
    outDir: 'dist',
    emptyOutDir: true,
  },

  // Performance optimizations
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@supabase/supabase-js',
    ],
    exclude: ['@opentelemetry/api'], // Lazy load heavy deps
  },

  // Server options for dev
  server: {
    port: 3000,
    open: false,
    cors: true,
    // Enable HMR
    hmr: {
      overlay: true,
    },
  },

  // Preview server
  preview: {
    port: 4173,
    open: false,
  },

  // Define environment variables
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },

  // Experimental features
  experimental: {
    renderBuiltUrl(filename, { hostType }) {
      // Use CDN for assets in production
      if (process.env.VITE_CDN_URL && hostType === 'js') {
        return `${process.env.VITE_CDN_URL}/${filename}`;
      }
      return { relative: true };
    },
  },
});
