const CACHE_NAME = 'calculadora-v1';
const ASSETS = [
  '/Calculadora_remesas-/',
  '/Calculadora_remesas-/index.html',
  '/Calculadora_remesas-/css/estilos.css',
  '/Calculadora_remesas-/js/app.js',
  '/Calculadora_remesas-/img/icono.png'
  // ... todos los archivos necesarios para que la app funcione offline
];

// Instalación: precachear todo el app shell
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting()) // Activar inmediatamente
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

// Fetch: estrategia cache first con fallback para navegaciones y recursos offline
self.addEventListener('fetch', event => {
  // Para navegaciones (SPA) siempre devolvemos index.html
  if (event.request.mode === 'navigate') {
    event.respondWith(
      caches.match('/Calculadora_remesas-/index.html')
        .then(response => response || fetch(event.request))
    );
    return;
  }

  // Para el resto: cache first, luego red, y si falla, un fallback simple
  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request).catch(() => {
        // Si es una imagen, podrías devolver una imagen de fallback
        if (event.request.destination === 'image') {
          return caches.match('/Calculadora_remesas-/img/offline-placeholder.png');
        }
        // Para otros recursos podrías devolver una respuesta genérica
        return new Response('Recurso no disponible offline', { status: 503 });
      });
    })
  );
});