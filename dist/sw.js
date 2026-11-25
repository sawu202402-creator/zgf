const CACHE_NAME = 'xuancheng-pwa-v15';
const PRECACHE_URLS = ['./', './index.html', './manifest.webmanifest'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then(async (cache) => {
        await Promise.all(
          PRECACHE_URLS.map((url) =>
            fetch(url, { cache: 'reload' })
              .then((res) => (res && res.ok ? cache.put(url, res) : undefined))
              .catch(() => {})
          )
        );
        const manifestRes = await fetch('./precache-manifest.json', { cache: 'reload' }).catch(() => null);
        if (manifestRes && manifestRes.ok) {
          const extraUrls = await manifestRes.json().catch(() => []);
          if (Array.isArray(extraUrls)) {
            await Promise.allSettled(
              extraUrls.map((url) =>
                fetch(url, { cache: 'reload' })
                  .then((res) => (res && res.ok ? cache.put(url, res) : undefined))
                  .catch(() => {})
              )
            );
          }
        }
      })
      .catch(() => {})
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  const isDocumentOrManifest =
    req.mode === 'navigate' ||
    url.pathname.endsWith('/') ||
    url.pathname.endsWith('.html') ||
    url.pathname.endsWith('manifest.webmanifest');

  if (isDocumentOrManifest) {
    event.respondWith(
      fetch(req, { cache: 'no-store' })
        .then((res) => {
          if (res && res.ok && res.type === 'basic') {
            const clone = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, clone)).catch(() => {});
          }
          return res;
        })
        .catch(() => caches.match(req))
    );
    return;
  }

  const isStaticMediaAsset =
    url.pathname.includes('/assets/') &&
    /\.(webp|png|jpg|jpeg|mp3|ogg|wav)$/i.test(url.pathname);

  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      if (isStaticMediaAsset) {
        return caches.match(req, { ignoreSearch: true }).then((fuzzyCached) => {
          if (fuzzyCached) return fuzzyCached;
          return fetch(req).then((res) => {
            if (res && res.ok && res.type === 'basic') {
              const clone = res.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(req, clone)).catch(() => {});
            }
            return res;
          });
        });
      }
      return fetch(req).then((res) => {
        if (res && res.ok && res.type === 'basic') {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, clone)).catch(() => {});
        }
        return res;
      });
    })
  );
});
