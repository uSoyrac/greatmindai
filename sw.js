/* Great Mind AI — Service Worker (PWA: telefona kurulabilir + offline) */
const CACHE = 'gmai-v1';
const ASSETS = [
  './',
  'index.html',
  'manifest.json',
  'logo.webp',
  'ataturk.webp',
  'einstein.webp',
  'icon-192.png',
  'icon-512.png'
];

// Kurulum: uygulama kabuğunu önbelleğe al
self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(ASSETS).catch(() => {}))
  );
});

// Etkinleştirme: eski sürüm önbelleklerini temizle
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  const url = new URL(req.url);

  // Sadece GET önbelleğe alınır
  if (req.method !== 'GET') return;

  // Dış servisler (Gemini API, Google Apps Script/Sheets) ASLA önbelleğe alınmaz
  if (url.origin !== self.location.origin) return;

  // HTML / navigasyon: önce ağ (hep güncel kod), çevrimdışıysa önbellek
  if (req.mode === 'navigate' || (req.headers.get('accept') || '').includes('text/html')) {
    e.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put('index.html', copy)).catch(() => {});
          return res;
        })
        .catch(() => caches.match('index.html').then((r) => r || caches.match('./')))
    );
    return;
  }

  // Statik dosyalar (resim, ikon, manifest): önce önbellek, sonra ağ
  e.respondWith(
    caches.match(req).then((cached) =>
      cached ||
      fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
        return res;
      }).catch(() => cached)
    )
  );
});
