import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles/tailwind.css';
import './styles/system.css';

const LEGACY_PWA_RESET_KEY = 'met-mastery:legacy-pwa-reset';

async function clearLegacyPwaCache() {
  if (!('serviceWorker' in navigator) || !('caches' in window)) return;
  if (window.sessionStorage.getItem(LEGACY_PWA_RESET_KEY)) return;

  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    if (registrations.length === 0) return;

    window.sessionStorage.setItem(LEGACY_PWA_RESET_KEY, 'in-progress');
    await Promise.all(registrations.map((registration) => registration.unregister()));
    const cacheNames = await window.caches.keys();
    await Promise.all(cacheNames.map((cacheName) => window.caches.delete(cacheName)));
    window.sessionStorage.setItem(LEGACY_PWA_RESET_KEY, 'complete');
    window.location.reload();
  } catch (error) {
    console.warn('[pwa] Could not clear an outdated application cache.', error);
  }
}

window.addEventListener('load', () => {
  void clearLegacyPwaCache();
}, { once: true });


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);

