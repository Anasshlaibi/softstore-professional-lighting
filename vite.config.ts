import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
        manifest: {
          name: 'GearShop.ma - Éclairage Professionnel',
          short_name: 'GearShop',
          description: 'Équipement d\'éclairage professionnel pour studios photo/vidéo au Maroc',
          theme_color: '#000000',
          icons: [
            {
              src: 'https://cdn-cloudflare.meidianbang.cn/comdata/69625/202401/20240124220814d82f21.webp',
              sizes: '192x192',
              type: 'image/webp'
            },
            {
              src: 'https://cdn-cloudflare.meidianbang.cn/comdata/69625/202401/20240124220814d82f21.webp',
              sizes: '512x512',
              type: 'image/webp'
            }
          ]
        }
      })
    ],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
  };
});
