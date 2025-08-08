import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',

      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        id: 'ohms-44-pwa',
        name: 'OhmS-44 - Where Energy Meets Excellence',
        short_name: 'OhmS-44',
        description: 'Student management system for OhmS-44 class with routine, classmates, attendance, and notices',
        privacy_policy: '/privacy-policy',
        theme_color: '#9D4EDD',
        background_color: '#FFFCF2',
        display: 'standalone',
        display_override: ['window-controls-overlay', 'standalone'],
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/favicon.ico',
            sizes: '64x64 32x32 24x24 16x16',
            type: 'image/x-icon'
          },
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable'
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ],
        launch_handler: {
          client_mode: 'navigate-existing'
        },
        edge_side_panel: {
          preferred_width: 400
        },
        file_handlers: [
          {
            action: '/',
            accept: {
              'text/csv': ['.csv'],
              'application/json': ['.json']
            }
          }
        ],
        handle_links: 'preferred',
        dir: 'ltr',
        categories: ['education', 'productivity', 'utilities'],
        iarc_rating_id: 'e84b072d-71b3-4d3e-86ae-31a8ce4e53b7',
        prefer_related_applications: false,


        protocol_handlers: [
          {
            protocol: 'web+ohms',
            url: '/?protocol=%s'
          }
        ],
        share_target: {
          action: '/share',
          method: 'POST',
          enctype: 'multipart/form-data',
          params: {
            title: 'title',
            text: 'text',
            url: 'url',
            files: [
              {
                name: 'files',
                accept: ['image/*', 'text/plain', '.csv', '.json']
              }
            ]
          }
        },
        widgets: [
          {
            name: 'Quick Routine',
            description: 'View today\'s class schedule',
            tag: 'routine',
            template: 'routine-widget',
            ms_ac_template: 'routine-adaptive-card.json',
            data: '/api/routine/today',
            type: 'application/json',
            screenshots: [
              {
                src: '/widget-routine.png',
                sizes: '256x256',
                label: 'Routine Widget'
              }
            ],
            icons: [
              {
                src: '/icon-192.png',
                sizes: '192x192'
              }
            ],
            auth: false,
            update: 3600
          }
        ],
        screenshots: [
          {
            src: '/screenshot-wide.png',
            sizes: '1280x720',
            type: 'image/png',
            form_factor: 'wide',
            label: 'OhmS Dashboard - Desktop View'
          },
          {
            src: '/screenshot-narrow.png',
            sizes: '390x844',
            type: 'image/png',
            form_factor: 'narrow',
            label: 'OhmS Dashboard - Mobile View'
          }
        ],
        shortcuts: [
          {
            name: 'View Routine',
            short_name: 'Routine',
            description: 'View class schedule and routine',
            url: '/?tab=routine'
          },
          {
            name: 'View Classmates',
            short_name: 'Classmates',
            description: 'View classmates directory',
            url: '/?tab=classmates'
          },
          {
            name: 'Check Attendance',
            short_name: 'Attendance',
            description: 'View attendance records',
            url: '/?tab=attendance'
          },
          {
            name: 'View Notices',
            short_name: 'Notices',
            description: 'View latest notices and announcements',
            url: '/?tab=notice'
          },
          {
            name: 'Privacy Policy',
            short_name: 'Privacy',
            description: 'View privacy policy and data protection information',
            url: '/privacy-policy'
          }
        ]
      },
      workbox: {
        skipWaiting: true,
        clientsClaim: true,
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff2}'],
        runtimeCaching: [
          // Google Fonts
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              }
            }
          },
          // Firebase Realtime Database
          {
            urlPattern: /^https:\/\/.*\.firebaseio\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'firebase-data-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 // 1 day
              },
              networkTimeoutSeconds: 3,
              backgroundSync: {
                name: 'firebase-sync',
                options: {
                  maxRetentionTime: 24 * 60 // 24 hours in minutes
                }
              }
            }
          },
          // Static images
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              }
            }
          }
        ],
        mode: 'generateSW',
        additionalManifestEntries: [],
        navigateFallback: '/offline.html',
        navigateFallbackDenylist: [/^\/_/, /\/[^/?]+\.[^/]+$/],
        swDest: 'sw.js',
        importScripts: ['/firebase-messaging-sw.js']
      }
    })
  ],
  build: {
    target: ['es2018', 'chrome63', 'firefox60', 'safari12', 'edge79'],
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          firebase: ['firebase/app', 'firebase/database', 'firebase/auth'],
          ui: ['lucide-react'],
          utils: []
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        // ONLY remove console statements and debugger - keep everything else safe
        drop_console: true,
        drop_debugger: true,
        // Disable optimizations that might break React
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn', 'console.error'],
        // Keep everything else as-is
        keep_fnames: true,
        keep_classnames: true,
        keep_infinity: true
      },
      format: {
        comments: false
      },
      mangle: false // Disable all mangling to prevent React issues
    }
  },
  resolve: {
    alias: {
      // Ensure React is resolved consistently
      'react': 'react',
      'react-dom': 'react-dom'
    },
    dedupe: ['react', 'react-dom']
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'firebase/app', 'firebase/database', 'framer-motion']
  },
  server: {
    port: 5173,
    host: true
  }
})
