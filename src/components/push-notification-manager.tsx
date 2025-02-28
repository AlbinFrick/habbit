'use client'

import { sendNotification, subscribeUser, unsubscribeUser } from '@/app/actions'
import { urlBase64ToUint8Array } from '@/lib/utils'
import { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { api } from '@/trpc/react'

export function PushNotificationManager() {
  const [isSupported, setIsSupported] = useState(false)
  const [subscription, setSubscription] = useState<PushSubscription | null>(
    null
  )
  const [message, setMessage] = useState('')

  // Add a mutation for checking reminders
  const checkReminders = api.habit.checkReminders.useMutation()

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true)
      registerServiceWorker().catch((e) => console.error(e))
    }

    // Set up a periodic check for habit reminders
    // This would be better handled by a server-side scheduled job in production
    const reminderInterval = setInterval(() => {
      if (subscription) {
        checkReminders.mutate()
      }
    }, 60000) // Check every minute

    return () => clearInterval(reminderInterval)
  }, [subscription])

  async function registerServiceWorker() {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
      updateViaCache: 'none',
    })
    const sub = await registration.pushManager.getSubscription()
    setSubscription(sub)
  }

  async function subscribeToPush() {
    const registration = await navigator.serviceWorker.ready
    const sub = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
      ),
    })
    setSubscription(sub)
    const serializedSub = JSON.parse(
      JSON.stringify(sub)
    ) as PushSubscription & { keys: { p256dh: string; auth: string } }
    await subscribeUser(serializedSub)
  }

  async function unsubscribeFromPush() {
    await subscription?.unsubscribe()
    setSubscription(null)
    await unsubscribeUser()
  }

  async function sendTestNotification() {
    if (subscription) {
      await sendNotification(message)
      setMessage('')
    }
  }

  if (!isSupported) {
    return <p>Push notifications are not supported in this browser.</p>
  }

  return (
    <>
      <div>
        <h3>Push Notifications</h3>
        {subscription ? (
          <>
            <p>You are subscribed to push notifications.</p>
            <Button onClick={unsubscribeFromPush}>Unsubscribe</Button>
            <input
              type="text"
              placeholder="Enter notification message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <Button onClick={sendTestNotification}>Send Test</Button>
            <Button onClick={() => checkReminders.mutate()}>
              Check Reminders Now
            </Button>
          </>
        ) : (
          <>
            <p>You are not subscribed to push notifications.</p>
            <Button onClick={subscribeToPush}>Subscribe</Button>
          </>
        )}
      </div>
    </>
  )
}