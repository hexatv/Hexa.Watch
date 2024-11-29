const CACHE_NAME = 'hexa-cache-v2';
const TIMEOUT = 5000; // 5 second timeout

// Resources to pre-cache
const urlsToCache = [
    '/',
    '/index.html',
    '/styles.css',
    '/script.js',
    '/manifest.json'
];

// Helper function to handle timeouts
const timeoutFetch = (request, timeout = TIMEOUT) => {
    return Promise.race([
        fetch(request),
        new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), timeout)
        )
    ]);
};

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', event => {
    // Don't cache API requests
    if (event.request.url.includes('api.themoviedb.org')) {
        event.respondWith(fetch(event.request));
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then(cachedResponse => {
                if (cachedResponse) {
                    // Return cached response and update cache in background
                    event.waitUntil(
                        timeoutFetch(event.request)
                            .then(response => {
                                if (response && response.status === 200) {
                                    caches.open(CACHE_NAME)
                                        .then(cache => cache.put(event.request, response));
                                }
                            })
                            .catch(() => {/* Ignore errors */})
                    );
                    return cachedResponse;
                }

                // No cache, try network
                return timeoutFetch(event.request.clone())
                    .then(response => {
                        if (!response || response.status !== 200) {
                            return response;
                        }

                        // Cache successful responses
                        caches.open(CACHE_NAME)
                            .then(cache => cache.put(event.request, response.clone()));
                        return response;
                    })
                    .catch(error => {
                        console.log('Fetch failed:', error);
                        // Return a custom offline response
                        if (event.request.mode === 'navigate') {
                            return caches.match('/index.html');
                        }
                        return new Response('Offline', {
                            status: 503,
                            statusText: 'Service Unavailable'
                        });
                    });
            })
    );
});
