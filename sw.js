const CACHE_NAME = 'calculadora-v3'; // cambia versión al actualizar
const ASSETS = [
  './',
  './index.html',
  './icono-192.png',
  './icono-512.png'
];

// Instalación: precachear el app shell
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activación: limpiar cachés antiguas
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch: network first para index.html, cache first para otros recursos
self.addEventListener('fetch', event => {
  if (event.request.mode === 'navigate') {
    // Network first: intenta traer la versión nueva del servidor
    event.respondWith(
      fetch(event.request).then(response => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put('./index.html', clone));
        return response;
      }).catch(() => caches.match('./index.html'))
    );
    return;
  }

  // Cache first para otros recursos
  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request).catch(() => {
        if (event.request.destination === 'image') {
          return caches.match('./icono-192.png'); // fallback seguro
        }
        return new Response('Recurso no disponible offline', { status: 503 });
      });
    })
  );
});