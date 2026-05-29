/* 
========================================================================
   « أثَــر | Athar » — PWA Service Worker (Offline Cache Engine)
========================================================================
*/

const CACHE_NAME = 'athar-cache-v1';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './style.css',
    './app.js',
    './quran.js',
    './tasbih.js',
    './qibla.js',
    './tracker.js',
    './calendar.js'
];

// 1. INSTALL SERVICE WORKER (Cache Core Assets)
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[Service Worker] Caching core application shell assets');
                return cache.addAll(ASSETS_TO_CACHE);
            })
            .then(() => self.skipWaiting())
    );
});

// 2. ACTIVATE SERVICE WORKER (Clean Old Caches)
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        console.log('[Service Worker] Deleting old cached items:', cache);
                        return caches.delete(cache);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// 3. FETCH INTERCEPTION (Cache-First, Fallback to Network Strategy)
self.addEventListener('fetch', (event) => {
    // Skip external APIs like audio recitations so we don't cache 100MB audio files!
    if (event.request.url.includes('download.quranicaudio.com') || event.request.url.includes('everyayah.com')) {
        return; // Let standard fetch handle the audio stream bypass
    }
    
    event.respondWith(
        caches.match(event.request)
            .then((cachedResponse) => {
                if (cachedResponse) {
                    return cachedResponse; // Load instantly from cache
                }
                
                // If not in cache, fetch from network and cache
                return fetch(event.request)
                    .then((networkResponse) => {
                        // Check if valid response
                        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                            return networkResponse;
                        }
                        
                        const responseToCache = networkResponse.clone();
                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                // Cache fetched file (except external audio or large audios)
                                if (!event.request.url.includes('mp3')) {
                                    cache.put(event.request, responseToCache);
                                }
                            });
                        
                        return networkResponse;
                    })
                    .catch(() => {
                        // Network error fallback (e.g. offline with no cached data)
                        if (event.request.headers.get('accept').includes('text/html')) {
                            return caches.match('./index.html');
                        }
                    });
            })
    );
});
