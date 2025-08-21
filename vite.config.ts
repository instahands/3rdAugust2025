// vite.config.js (UPDATED)

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import process from 'process';
import { VitePWA } from 'vite-plugin-pwa'; // Import the PWA plugin

export default defineConfig({
  plugins: [
    react(),
    // Add the PWA plugin configuration
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'InstaHands',
        short_name: 'InstaHands',
        description: 'On-demand home services at your fingertips.',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        scope: '/app',
        start_url: '/app',
        icons: [
          {
            src: 'icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    }),
  ],
  optimizeDeps: {
    exclude: ['lucide-react'], // Your existing setting is preserved
  },
  // This 'define' block makes the app version available
  define: {
    'import.meta.env.VITE_APP_VERSION': JSON.stringify(process.env.npm_package_version),
  },
});