import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// 1. Disable Workbox development logs to prevent data leakage in console
if (typeof window !== 'undefined') {
  (window as unknown as { __WB_DISABLE_DEV_LOGS?: boolean }).__WB_DISABLE_DEV_LOGS = true;

  // 2. Automatically unregister any zombie Service Workers registered for this origin
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const registration of registrations) {
        registration.unregister();
      }
    });
  }

  // 3. Purge obsolete PWA and Supabase API caches from browser Cache Storage
  if ('caches' in window) {
    caches.keys().then((keys) => {
      for (const key of keys) {
        caches.delete(key);
      }
    });
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

