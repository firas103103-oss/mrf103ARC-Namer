import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        chunkSizeWarningLimit: 600,
        rollupOptions: {
          output: {
            manualChunks(id) {
              // تقسيم أكثر دقة للـ vendors
              if (id.includes('node_modules')) {
                // React ecosystem
                if (id.includes('react-dom') || id.includes('scheduler')) {
                  return 'vendor-react';
                }
                if (id.includes('react')) {
                  return 'vendor-react';
                }
                // Document processing (heaviest)
                if (id.includes('docx') || id.includes('mammoth') || id.includes('jszip') || id.includes('pako')) {
                  return 'vendor-docs';
                }
                // AI SDK
                if (id.includes('@google/genai')) {
                  return 'vendor-ai';
                }
                // UI icons
                if (id.includes('lucide')) {
                  return 'vendor-ui';
                }
                // Everything else
                return 'vendor-common';
              }
            }
          }
        }
      }
    };
});
