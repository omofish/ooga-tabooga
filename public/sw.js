// Offline cache for Ooga Tabooga.
//
// The whole game runs client-side (state lives in localStorage, fonts are
// self-hosted, there are no runtime API calls), so once the app shell and its
// assets are cached the game works fully offline. Strategy: stale-while-
// revalidate for same-origin GETs, with the cached "/" shell as the offline
// fallback for navigations. Bump CACHE to invalidate everything on deploy.
const CACHE = "ooga-tabooga-v1";

self.addEventListener("install", (event) => {
  // Pre-cache the app shell; ignore failure so a bad precache can't block install.
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.add(self.registration.scope).catch(() => {}))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const cached = await cache.match(request);

      const network = fetch(request)
        .then((response) => {
          // Only cache complete, same-origin, OK responses.
          if (response && response.status === 200 && response.type === "basic") {
            cache.put(request, response.clone());
          }
          return response;
        })
        .catch(() => null);

      // Serve cache first; refresh it in the background.
      if (cached) {
        event.waitUntil(network);
        return cached;
      }

      const response = await network;
      if (response) return response;

      // Offline and never cached: fall back to the app shell for page loads.
      if (request.mode === "navigate") {
        const shell = await cache.match(self.registration.scope);
        if (shell) return shell;
      }
      return Response.error();
    }),
  );
});
