/* Sehrli Baraban — Service Worker (offline rejim) */
const CACHE = 'sehrli-baraban-v2.2.0';
const ASSETS = [
    './',
    './index.html',
    './manifest.json',
    './css/base.css',
    './css/games.css',
    './js/config.js',
    './js/utils.js',
    './js/storage.js',
    './js/sound.js',
    './js/confetti.js',
    './js/mathgen.js',
    './js/stats.js',
    './js/wheel.js',
    './js/games/core.js',
    './js/games/arithmetic.js',
    './js/games/logic.js',
    './js/games/world.js',
    './js/games/xotira.js',
    './js/games/krestik.js',
    './js/games/timss.js',
    './js/lobby.js',
    './js/ui.js',
    './js/app.js',
    './js/protect.js',
    './icons/icon.svg',
    './icons/icon-maskable.svg',
];

self.addEventListener('install', event => {
    event.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
            .then(() => self.clients.claim())
    );
});

// Tarmoq bo'lsa — yangisini olib keshni yangilaymiz, bo'lmasa keshdan beramiz
self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET') return;
    const url = new URL(event.request.url);
    if (url.origin !== location.origin) {
        // Shriftlar va boshqa tashqi resurslar: kesh, keyin tarmoq
        event.respondWith(caches.match(event.request).then(hit => hit || fetch(event.request).then(res => {
            const copy = res.clone();
            caches.open(CACHE).then(c => c.put(event.request, copy)).catch(() => {});
            return res;
        }).catch(() => hit)));
        return;
    }
    event.respondWith(
        fetch(event.request).then(res => {
            const copy = res.clone();
            caches.open(CACHE).then(c => c.put(event.request, copy)).catch(() => {});
            return res;
        }).catch(() => caches.match(event.request).then(hit => hit || caches.match('./index.html')))
    );
});
