import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv, type Plugin } from 'vite'

// Middleware to eliminate stale PWA 404s and instruct browser to clean up zombie Service Workers
const stalePwaCleanupPlugin = (): Plugin => ({
  name: 'stale-pwa-cleanup',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      const url = req.url || '';
      // 1. Intercept stale @vite-plugin-pwa entry point requests (fixes 404 ERR_ABORTED)
      if (url.includes('@vite-plugin-pwa')) {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/javascript');
        res.end('/* stale pwa disabled */');
        return;
      }
      // 2. Intercept sw.js and workbox requests to instruct browser to unregister immediately
      if (url.endsWith('/sw.js') || url.includes('workbox-')) {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/javascript');
        res.end(`
          self.addEventListener('install', () => self.skipWaiting());
          self.addEventListener('activate', () => {
            self.registration.unregister();
            self.clients.matchAll({ type: 'window' }).then((clients) => {
              clients.forEach((client) => client.navigate(client.url));
            });
          });
        `);
        return;
      }
      next();
    });
  }
});

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const supabaseTarget = (env.VITE_SUPABASE_URL || 'https://vdymolgtrovtekodhnik.supabase.co').trim();

  return {
    server: {
      proxy: {
        // Reverse proxy to mask direct cloud API URLs and eliminate CORS preflight requests
        '/api/cloud': {
          target: supabaseTarget,
          changeOrigin: true,
          secure: true,
          rewrite: (path) => path.replace(/^\/api\/cloud/, '')
        }
      }
    },
    plugins: [react(), stalePwaCleanupPlugin()]
  };
});

