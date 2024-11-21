const CACHE_NAME = 'hexa-cache-v1';
const urlsToCache = [
  './',
  './index.html',
  './styles.css',
  './script.js',
  './manifest.json',
  'https://unpkg.com/react@17/umd/react.production.min.js',
  'https://unpkg.com/react-dom@17/umd/react-dom.production.min.js',
  'https://unpkg.com/babel-standalone@6/babel.min.js',
  'https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js',
  'https://unpkg.com/react-router-dom@5.2.0/umd/react-router-dom.min.js',
  'https://cdn.tailwindcss.com'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache).catch(error => {
          console.error('Cache addAll failed:', error);
          // Continue even if some resources fail to cache
          return Promise.resolve();
        });
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request)
          .catch(error => {
            console.error('Fetch failed:', error);
            // Return a fallback response or handle the error
            return new Response('Network error', { status: 408 });
          });
      })
  );
});
