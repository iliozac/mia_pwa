const CACHE_NAME = 'audioguida-v1';
const ASSETS = [
    '/',
    '/styles.css',
    '/app.js',
    // Aggiungi qui altri file statici
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(ASSETS))
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then(response => response || fetch(event.request))
    );
});
