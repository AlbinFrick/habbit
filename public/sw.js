/// <reference lib="webworker" />

self.addEventListener('push', function (event) {
  if (event.data) {
    const data = event.data.json()
    const options = {
      body: data.body,
      icon: data.icon ?? '/rabbit.svg',
      badge: '/rabbit.svg',
      data: {
        dateOfArrival: Date.now(),
        primaryKey: '2',
      },
    }
    event.waitUntil(self.registration.showNotification(data.title, options))
  }
})

self.addEventListener('notificationclick', function (event) {
  console.log('Notification click received.')
  event.notification.close()
  event.waitUntil(
    self.clients.openWindow(
      process.env.NODE_ENV === 'production'
        ? 'https://habbit.albinfrick.com'
        : 'https://localhost:3000'
    )
  )
})
