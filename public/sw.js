// Minimal Service Worker for PWA installation support
const CACHE_NAME = 'optima-skill-cache-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Minimal fetch handler to satisfy PWA requirements
  event.respondWith(fetch(event.request));
});
