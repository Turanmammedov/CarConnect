// CarConnect - Custom Service Worker
// Tətbiq bağlı olarkən push bildirişlərini idarə edir

import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching'
import { registerRoute } from 'workbox-routing'
import { NetworkFirst, StaleWhileRevalidate } from 'workbox-strategies'

// Workbox precache
precacheAndRoute(self.__WB_MANIFEST)
cleanupOutdatedCaches()

// ── Push bildirişi handler ──────────────────────────────────────────────────
// Tətbiq bağlı olarkən Supabase Realtime işləmir.
// Supabase Edge Function `send-push` bu SW-ə push göndərir.
self.addEventListener('push', (event) => {
  if (!event.data) return

  let payload
  try {
    payload = event.data.json()
  } catch {
    payload = { title: '🔔 Yeni bildiriş', body: event.data.text() }
  }

  const title = payload.title || '🔔 CarConnect'
  const options = {
    body:    payload.body  || 'Yeni bildiriş var',
    icon:    payload.icon  || '/icon-192.png',
    badge:   '/icon-192.png',
    tag:     payload.tag   || 'carconnect-notif',
    renotify: true,
    data: payload.data || {},
    actions: payload.actions || [],
    vibrate: [200, 100, 200],
  }

  event.waitUntil(
    self.registration.showNotification(title, options)
  )
})

// ── Bildirişə klik handler ──────────────────────────────────────────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const url = event.notification.data?.url || '/'

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Artıq açıq pəncərə varsa, onu focus et
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.focus()
          if (url !== '/') client.navigate(url)
          return
        }
      }
      // Yoxdursa yeni pəncərə aç
      if (clients.openWindow) return clients.openWindow(url)
    })
  )
})

// ── Tətbiq açıq ikən Supabase Realtime özü bildiriş göndərir ──────────────
// (AppContext-dəki notif-realtime channel bunu idarə edir)
