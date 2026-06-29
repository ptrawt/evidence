import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching'
import { clientsClaim } from 'workbox-core'
import { registerRoute } from 'workbox-routing'
import { CacheFirst } from 'workbox-strategies'
import { ExpirationPlugin } from 'workbox-expiration'

declare let self: ServiceWorkerGlobalScope

self.skipWaiting()
clientsClaim()
cleanupOutdatedCaches()
precacheAndRoute(self.__WB_MANIFEST)

registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'images',
    plugins: [new ExpirationPlugin({ maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 30 })],
  }),
)

self.addEventListener('push', (event) => {
  const data = (event as PushEvent).data?.json() as { title?: string; body?: string; url?: string } ?? {}
  const title = data.title ?? 'Evidence 💪'
  const body = data.body ?? 'เช็ค daily habits ของวันนี้ยัง?'
  const url = data.url ?? '/'
  ;(event as PushEvent).waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: '/icon.svg',
      badge: '/icon.svg',
      data: { url },
    })
  )
})

self.addEventListener('notificationclick', (event) => {
  const ne = event as NotificationEvent
  ne.notification.close()
  const url: string = ne.notification.data?.url ?? '/'
  ne.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      const existing = list.find(c => c.url.includes(url))
      if (existing) return existing.focus()
      return self.clients.openWindow(url)
    })
  )
})
