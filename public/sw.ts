/// <reference lib="webworker" />

declare const self: ServiceWorkerGlobalScope

interface PushData {
  title: string
  body: string
  icon?: string
}

self.addEventListener('push', function (event: PushEvent) {
  if (event.data) {
    const data = event.data.json() as PushData
    const options: NotificationOptions = {
      body: data.body,
      icon: data.icon ?? '/icon.png',
      badge: '/badge.png',
      data: {
        dateOfArrival: Date.now(),
        primaryKey: '2',
      },
    }
    event.waitUntil(self.registration.showNotification(data.title, options))
  }
})

self.addEventListener('notificationclick', function (event: NotificationEvent) {
  console.log('Notification click received.')
  event.notification.close()
  // Use self.clients instead of global clients
  event.waitUntil(self.clients.openWindow('https://localhost:3000'))
})
