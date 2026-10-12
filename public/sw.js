// Service worker: permite abrir la app sin conexión.
// Usa "red primero" para que los cambios de precios lleguen de inmediato,
// y la copia guardada solo cuando no hay internet.
const CACHE = 'mozzafiato-v9';
const ASSETS = [
  './',
  'index.html',
  'styles.css',
  'app.js',
  'config.js',
  'pricing.js',
  'holidays.js',
  'message.js',
  'schedule.js',
  'gallery.js',
  'pwa.js',
  'reservar.html',
  'reservar.js',
  'booking.js',
  'manifest.webmanifest',
  'brand/logo.png',
  'icons/favicon.png',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/apple-touch-icon.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  // La hoja de reservas (Google) y otros sitios van directo, sin caché.
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;

  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copy));
        }
        return response;
      })
      .catch(() => caches.match(request, { ignoreSearch: true }))
  );
});
