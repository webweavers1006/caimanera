/* global self, caches, fetch, Response, URL */

/**
 * Caimanera service worker — hand-written, no build step.
 *
 * Privacy model: HTML is NEVER cached. Every navigation goes to the network and
 * only falls back to the static `/offline` page. That prevents one account's
 * personalized render (`/`, `/cuenta`, `/mis-partidos`, `/admin`) from being
 * replayed to another user on a shared device.
 *
 * Only immutable build assets and public images are cached.
 *
 * To ship changes, bump `VERSION`; `activate` deletes every cache from older
 * versions.
 */
const VERSION = "caimanera-v1"
const STATIC_CACHE = `${VERSION}-static`
const ASSET_CACHE = `${VERSION}-assets`
const OFFLINE_URL = "/offline"
const MAX_ASSET_ENTRIES = 80

const PRECACHE_URLS = [
  OFFLINE_URL,
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/img/apple-touch-icon.png",
  "/img/caimanera_logo.svg",
]

/**
 * Hashed build files referenced by the offline document (CSS, JS, fonts).
 * They are precached too, so a fresh install can render `/offline` styled even
 * if the user goes offline before visiting any other page.
 */
const OFFLINE_ASSET_PATTERN = /\/_next\/static\/[^"'\\\s>]+/g

const FALLBACK_HTML = `<!doctype html>
<html lang="es"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>Sin conexión · Caimanera</title>
<style>
  :root { color-scheme: dark; }
  body { margin:0; min-height:100dvh; display:grid; place-items:center; background:#0d0e19;
         color:#f2f4f8; font-family:ui-sans-serif,system-ui,-apple-system,sans-serif; }
  main { max-width:22rem; padding:2rem 1.5rem; text-align:center; }
  h1 { margin:0 0 .5rem; font-size:1.35rem; }
  p { margin:0 0 1.5rem; color:#9aa2b1; line-height:1.5; font-size:.95rem; }
  a { display:inline-block; padding:.7rem 1.2rem; border-radius:1rem; background:#65dfaf;
      color:#0d0e19; font-weight:600; text-decoration:none; }
</style></head>
<body><main>
  <h1>Sin conexión</h1>
  <p>No pudimos cargar Caimanera. Revisa tu conexión e inténtalo de nuevo.</p>
  <a href="/">Reintentar</a>
</main></body></html>`

// ── Cache helpers ───────────────────────────────────────────────────────────

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName)
  const cached = await cache.match(request)
  if (cached) return cached

  const response = await fetch(request)
  if (response.ok && response.type === "basic") {
    await cache.put(request, response.clone())
  }
  return response
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName)
  const cached = await cache.match(request)

  const network = fetch(request)
    .then(async (response) => {
      if (response.ok && response.type === "basic") {
        await cache.put(request, response.clone())
        await trimCache(cacheName, MAX_ASSET_ENTRIES)
      }
      return response
    })
    .catch(() => null)

  if (cached) return cached

  const response = await network
  if (response) return response

  return new Response("", { status: 504, statusText: "Offline" })
}

async function trimCache(cacheName, maxEntries) {
  const cache = await caches.open(cacheName)
  const keys = await cache.keys()
  if (keys.length <= maxEntries) return

  await Promise.all(keys.slice(0, keys.length - maxEntries).map((key) => cache.delete(key)))
}

async function putIfOk(cache, url) {
  try {
    const response = await fetch(url, { cache: "reload" })
    if (response.ok) await cache.put(url, response)
  } catch {
    // A missing optional asset must not abort the installation.
  }
}

async function precacheOffline(cache) {
  try {
    const response = await fetch(OFFLINE_URL, { cache: "reload" })
    if (!response.ok) return

    const html = await response.clone().text()
    await cache.put(OFFLINE_URL, response)

    const assets = new Set()
    for (const match of html.matchAll(OFFLINE_ASSET_PATTERN)) {
      assets.add(match[0])
    }

    await Promise.all([...assets].map((url) => putIfOk(cache, url)))
  } catch {
    // Without the offline document the inline fallback still covers the gap.
  }
}

/**
 * Navigations are network-only by design. If the network fails we serve the
 * static offline page; no authenticated HTML is stored anywhere.
 *
 * A 502/503/504 means the reverse proxy could not reach the Next.js process:
 * from the user's point of view that is the same as being offline, so we show
 * the branded fallback instead of a raw gateway error.
 */
const UNAVAILABLE_STATUSES = new Set([502, 503, 504])

async function offlineResponse() {
  const cache = await caches.open(STATIC_CACHE)
  const offline = await cache.match(OFFLINE_URL)
  if (offline) return offline

  return new Response(FALLBACK_HTML, {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  })
}

async function navigateWithOfflineFallback(request) {
  let response

  try {
    response = await fetch(request)
  } catch {
    return offlineResponse()
  }

  if (UNAVAILABLE_STATUSES.has(response.status)) {
    return offlineResponse()
  }

  return response
}

function isAssetRequest(pathname) {
  return (
    pathname.startsWith("/icons/") ||
    pathname.startsWith("/img/") ||
    /\.(?:png|jpe?g|webp|avif|gif|svg|ico|woff2?)$/.test(pathname)
  )
}

// ── Lifecycle ───────────────────────────────────────────────────────────────

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(STATIC_CACHE)

      await precacheOffline(cache)
      await Promise.all(
        PRECACHE_URLS.filter((url) => url !== OFFLINE_URL).map((url) =>
          putIfOk(cache, url)
        )
      )

      await self.skipWaiting()
    })()
  )
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys()
      await Promise.all(
        keys.filter((key) => !key.startsWith(VERSION)).map((key) => caches.delete(key))
      )
      // The static cache holds precache + hashed build files and is reset when
      // VERSION changes; only the image cache is trimmed at runtime.
      await self.clients.claim()
    })()
  )
})

// Lightweight handshake: lets the page confirm which worker build is active.
self.addEventListener("message", (event) => {
  if (event.data?.type === "PING") {
    const reply = { type: "PONG", version: VERSION }
    if (event.ports?.[0]) {
      event.ports[0].postMessage(reply)
    } else {
      event.source?.postMessage(reply)
    }
  }
})

// ── Fetch routing ───────────────────────────────────────────────────────────

self.addEventListener("fetch", (event) => {
  const { request } = event

  // Only GETs, only our origin, never API routes or RSC payloads.
  if (request.method !== "GET") return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return
  if (url.pathname.startsWith("/api/")) return
  if (url.searchParams.has("_rsc")) return
  if (request.headers.get("RSC") === "1") return
  if (request.headers.get("Next-Router-Prefetch") === "1") return

  // Immutable build assets: content-hashed by Next.js.
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(cacheFirst(request, STATIC_CACHE))
    return
  }

  // Public images and icons.
  if (isAssetRequest(url.pathname)) {
    event.respondWith(staleWhileRevalidate(request, ASSET_CACHE))
    return
  }

  // Documents: network only + offline fallback. Never cached.
  if (request.mode === "navigate") {
    event.respondWith(navigateWithOfflineFallback(request))
  }
})
