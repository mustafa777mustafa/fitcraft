// FitCraft PWA Service Worker
const CACHE_NAME = 'fitcraft-app-v2';
const CORE_ASSETS = [
    './',
    './index.html',
    './plans.json',
    './wger-videos.json',
    './manifest.json',
    './icons/icon-192.png',
    './icons/icon-512.png',
    './icons/icon-vector.svg'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[FitCraft SW] Caching core assets...');
            return cache.addAll(CORE_ASSETS).catch((err) => {
                console.warn('[FitCraft SW] Non-fatal caching issue during install:', err);
            });
        }).then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME) {
                        console.log('[FitCraft SW] Clearing obsolete cache:', key);
                        return caches.delete(key);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    const req = event.request;
    const url = new URL(req.url);

    // Bypass non-GET and chrome-extension schemes
    if (req.method !== 'GET' || !url.protocol.startsWith('http')) {
        return;
    }

    // Special handling for HTML navigation: Network First with Cache Fallback
    if (req.mode === 'navigate' || req.headers.get('accept')?.includes('text/html')) {
        event.respondWith(
            fetch(req)
                .then((networkRes) => {
                    if (networkRes.ok) {
                        const copy = networkRes.clone();
                        caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
                    }
                    return networkRes;
                })
                .catch(() => {
                    return caches.match('./index.html') || caches.match(req);
                })
        );
        return;
    }

    // Cache-First strategy for core static assets, fonts, icons, CDNs
    event.respondWith(
        caches.match(req).then((cachedRes) => {
            if (cachedRes) {
                // Fetch in background to update cache (Stale-While-Revalidate)
                fetch(req).then((networkRes) => {
                    if (networkRes && networkRes.ok) {
                        caches.open(CACHE_NAME).then((cache) => cache.put(req, networkRes));
                    }
                }).catch(() => {});
                return cachedRes;
            }

            return fetch(req).then((networkRes) => {
                // Cache valid responses for images, stylesheets, scripts, JSON data
                if (networkRes && networkRes.ok) {
                    const shouldCache = 
                        url.pathname.endsWith('.json') ||
                        url.pathname.endsWith('.png') ||
                        url.pathname.endsWith('.svg') ||
                        url.pathname.endsWith('.gif') ||
                        url.pathname.endsWith('.css') ||
                        url.pathname.endsWith('.js') ||
                        url.hostname.includes('jsdelivr.net') ||
                        url.hostname.includes('cdnjs.cloudflare.com') ||
                        url.hostname.includes('fonts.googleapis.com') ||
                        url.hostname.includes('fonts.gstatic.com');

                    if (shouldCache) {
                        const copy = networkRes.clone();
                        caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
                    }
                }
                return networkRes;
            }).catch((fetchErr) => {
                // If offline and requesting an image, return SVG placeholder
                if (req.headers.get('accept')?.includes('image')) {
                    return new Response(
                        `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200">
                            <rect width="300" height="200" fill="#18181b"/>
                            <text x="50%" y="45%" text-anchor="middle" fill="#10b981" font-size="16" font-family="sans-serif">FitCraft (Offline)</text>
                            <text x="50%" y="65%" text-anchor="middle" fill="#71717a" font-size="12" font-family="sans-serif">الصورة غير مخزنة مؤقتاً بعد</text>
                        </svg>`,
                        { headers: { 'Content-Type': 'image/svg+xml' } }
                    );
                }
                throw fetchErr;
            });
        })
    );
});
