const CACHE_NAME = 'wash-v1'

self.addEventListener('install', (event) => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name)),
      ),
    ),
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Network-first for API/server calls and navigation
  if (url.pathname.startsWith('/_server') || request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match(request)),
    )
    return
  }

  // Cache-first for static assets
  if (url.pathname.startsWith('/assets/') || /\.(js|css|png|ico|woff2?)$/.test(url.pathname)) {
    event.respondWith(
      caches.match(request).then((cached) =>
        cached || fetch(request).then((response) => {
          const clone = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
          return response
        }),
      ),
    )
    return
  }

  event.respondWith(fetch(request))
})
