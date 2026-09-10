import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles/tailwind.css';
import './styles/system.css';
// Unified app-shell primitive (mm-*). Defines --mm-* tokens and the grid
// layout for topbar + rail/nav-row/tabbar + main. Imported after system.css
// so the specificity lock (0,2,0) outranks legacy rules without !important.
// See design/shell-tokens.md for the contract.
import './styles/shell.css';

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

// Storage keys retired together with the feature that owned them (the Targeted
// Synonym Tracker component was removed). Purged once per browser so returning
// students don't carry dead state. Bump the version marker when adding keys.
const RETIRED_STORAGE_PURGE_KEY = 'met-mastery:retired-storage-purge-v1';
const RETIRED_STORAGE_KEYS = ['vv_synonym_tracker_status'];

function purgeRetiredStorageKeys() {
  try {
    if (window.localStorage.getItem(RETIRED_STORAGE_PURGE_KEY)) return;
    RETIRED_STORAGE_KEYS.forEach((key) => window.localStorage.removeItem(key));
    window.localStorage.setItem(RETIRED_STORAGE_PURGE_KEY, 'complete');
  } catch (error) {
    console.warn('[storage] Could not purge retired storage keys.', error);
  }
}

purgeRetiredStorageKeys();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);

