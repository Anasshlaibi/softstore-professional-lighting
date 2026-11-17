import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 5173,
      host: '0.0.0.0',
      watch: {
        ignored: ['**/dist/**', '**/node_modules/**', '**/.git/**']
      }
    },
    envPrefix: ['VITE_'],
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      cssCodeSplit: true,
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
        },
      },
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('@supabase')) {
                return 'supabase-vendor';
              }
              if (id.includes('swiper')) {
                return 'swiper-vendor';
              }
              if (id.includes('@google/genai')) {
                return 'ai-vendor';
              }
              if (id.includes('lucide-react')) {
                return 'icons-vendor';
              }
              return 'vendor';
            }
          }
        }
      }
    }
  };
});
