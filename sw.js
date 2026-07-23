self.addEventListener("install", event => {
  console.log("Service Worker instalado");
  event.waitUntil(
    caches.open("v1").then(cache => {
      return cache.addAll([
        "/Calculadora_remesas-/index.html"
      ]);
    })
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});