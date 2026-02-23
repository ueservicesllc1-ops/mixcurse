const CACHE_NAME = 'multitrack-player-v1';
const ASSETS = [
    'judith/web-app.html',
    'cache-system.js',
    'offline-manager.js',
    'offline-integration.js',
    'additional-functions.js',
    'FIREBASE_CONFIG.js',
    'assets/logo.png',
    'assets/favicon.ico'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS);
        })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});
