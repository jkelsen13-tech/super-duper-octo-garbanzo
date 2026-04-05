// Service Worker — Threshold Tolerance Tracker
// Handles push notifications and offline caching

const CACHE_NAME = 'threshold-v1'
const PRECACHE = ['/', '/index.html']

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE))
  )
  self.skipWaiting()
})

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  )
  self.clients.claim()
})

// Network-first fetch strategy
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return
  event.respondWith(
    fetch(event.request)
      .then(res => {
        const clone = res.clone()
        caches.open(CACHE_NAME).then(c => c.put(event.request, clone))
        return res
      })
      .catch(() => caches.match(event.request))
  )
})

// Push notification handler
self.addEventListener('push', event => {
  const data = event.data?.json() ?? {}
  const title = data.title ?? 'Threshold'
  const options = {
    body:    data.body  ?? 'Time to log a session.',
    icon:    data.icon  ?? '/icon-192.png',
    badge:   '/icon-192.png',
    tag:     data.tag   ?? 'threshold-notif',
    data:    { url: data.url ?? '/' },
    actions: data.actions ?? [{ action: 'log', title: 'Log Now' }],
  }
  event.waitUntil(self.registration.showNotification(title, options))
})

// Notification click — open the app
self.addEventListener('notificationclick', event => {
  event.notification.close()
  const url = event.notification.data?.url ?? '/'
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      const existing = list.find(c => c.url.includes(self.location.origin))
      if (existing) return existing.focus()
      return clients.openWindow(url)
    })
  )
})
