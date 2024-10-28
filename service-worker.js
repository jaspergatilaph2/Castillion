self.addEventListener("install", e => {
  e.waitUntil(
    caches.open("static").then(cache => {
      return cache.addAll([
        "./",
        "./src/style.css",
        "./images/icon64.png"
      ]);
    }).then(() => self.skipWaiting()) // Activate the service worker immediately
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // You can delete old caches here if needed
          if (cacheName !== "static") {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener("fetch", e => {
  e.respondWith(
    caches.match(e.request).then(response => {
      if (response) {
        // Return cached response
        return response;
      }
      // Fetch from network and cache the response
      return fetch(e.request).then(networkResponse => {
        return caches.open("static").then(cache => {
          cache.put(e.request, networkResponse.clone());
          return networkResponse;
        });
      });
    }).catch(() => {
      // Optionally return a fallback response
      console.log('Fetch failed; returning offline page instead.');
      return caches.match('./fallback.html'); // Ensure you have this page cached
    })
  );
});
