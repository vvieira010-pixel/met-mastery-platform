/*
 * Transitional worker for clients that still have the retired Workbox worker.
 * It replaces the cache worker without serving or deleting any user content.
 * The next normal refresh then fetches dynamic imports from the deployment.
 */
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});
