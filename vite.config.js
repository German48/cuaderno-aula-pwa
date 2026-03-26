import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon-192.png', 'icon-512.png'],
      manifest: {
        name: 'Cuaderno de Aula',
        short_name: 'Cuaderno',
        description: 'Cuaderno de aula PWA para seguimiento docente',
        theme_color: '#4F46E5',
        background_color: '#F8FAFC',
        display: 'standalone',
        start_url: '/cuaderno-aula-pwa/',
        scope: '/cuaderno-aula-pwa/',
        icons: [
          {
            src: 'icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  base: '/cuaderno-aula-pwa/'
});
