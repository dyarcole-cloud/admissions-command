// Admissions Command — service worker
// Cache strategy:
//   - App shell (HTML for /app and friends): network-first, fall back to cache
//   - Static assets (/_next/static, fonts, icons): cache-first
//   - /api/payors: stale-while-revalidate so the cockpit lookup
//     works offline once the user has hit it at least once
//   - All other /api/* requests: network-only, never cached

const VERSION = "ac-v3";
const APP_SHELL_CACHE = `${VERSION}-shell`;
const STATIC_CACHE = `${VERSION}-static`;
const API_CACHE = `${VERSION}-api`;

const SHELL_URLS = [
  "/",
  "/app",
  "/app/preadmit",
  "/app/payors",
  "/app/analytics",
  "/app/settings",
  "/app/login",
  "/demo",
  "/roi",
  "/vs",
  "/manifest.webmanifest",
  "/icon.svg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(APP_SHELL_CACHE).then((cache) =>
      Promise.allSettled(
        SHELL_URLS.map((url) =>
          fetch(url, { cache: "no-store" })
            .then((res) => (res.ok ? cache.put(url, res.clone()) : null))
            .catch(() => null)
        )
      )
    )
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => !k.startsWith(VERSION))
            .map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // Static Next assets — cache-first
  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.endsWith(".woff2") ||
    url.pathname.endsWith(".woff") ||
    url.pathname.endsWith(".svg") ||
    url.pathname === "/icon.svg" ||
    url.pathname === "/apple-icon" ||
    url.pathname === "/manifest.webmanifest"
  ) {
    event.respondWith(cacheFirst(req, STATIC_CACHE));
    return;
  }

  // Brain video — large, prefer not to cache for offline (would balloon storage)
  if (url.pathname === "/ntn-brain.mp4") return;

  // /api/payors — stale-while-revalidate
  if (url.pathname === "/api/payors") {
    event.respondWith(staleWhileRevalidate(req, API_CACHE));
    return;
  }

  // Other /api/* — network only
  if (url.pathname.startsWith("/api/")) return;

  // Page navigation requests — network-first, fall back to cache
  if (req.mode === "navigate" || req.destination === "document") {
    event.respondWith(networkFirst(req, APP_SHELL_CACHE));
    return;
  }
});

async function cacheFirst(req, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(req);
  if (cached) return cached;
  try {
    const fresh = await fetch(req);
    if (fresh.ok) cache.put(req, fresh.clone());
    return fresh;
  } catch (err) {
    if (cached) return cached;
    throw err;
  }
}

async function networkFirst(req, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const fresh = await fetch(req);
    if (fresh.ok) cache.put(req, fresh.clone());
    return fresh;
  } catch {
    const cached = await cache.match(req);
    if (cached) return cached;
    // Last resort — landing page (always shell-cached)
    const fallback = await cache.match("/app");
    if (fallback) return fallback;
    return new Response("Offline", { status: 503 });
  }
}

async function staleWhileRevalidate(req, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(req);
  const networkPromise = fetch(req)
    .then((res) => {
      if (res.ok) cache.put(req, res.clone());
      return res;
    })
    .catch(() => null);
  return cached ?? (await networkPromise) ?? new Response("Offline", { status: 503 });
}
