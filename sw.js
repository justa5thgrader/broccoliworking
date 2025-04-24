/* Ultraviolet Service Worker */
importScripts('/uv/uv.bundle.js');
importScripts('/uv/uv.config.js');
importScripts('/uv/uv.sw.js');

const sw = new UVServiceWorker();

self.addEventListener('fetch', (event) => {
    event.respondWith(
        sw.fetch(event)
            .catch((err) => {
                // Handle errors
                console.error('UV service worker error:', err);
                return new Response('Service worker error: ' + err.toString(), {
                    status: 500,
                    headers: { 'Content-Type': 'text/plain' }
                });
            })
    );
});

// Cache the UV scripts for offline use
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open('ultraviolet-cache').then((cache) => {
            return cache.addAll([
                '/uv/uv.bundle.js',
                '/uv/uv.config.js',
                '/uv/uv.handler.js',
                '/uv/uv.sw.js',
                // Add other assets needed for the proxy
            ]);
        })
    );
    
    // Skip waiting to become active immediately
    self.skipWaiting();
});

// Clean up old caches when a new service worker activates
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== 'ultraviolet-cache') {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    
    // Claim clients so the service worker is used right away
    event.waitUntil(clients.claim());
}); 