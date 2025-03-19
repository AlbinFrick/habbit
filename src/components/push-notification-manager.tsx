'use client'

import { sendNotification, subscribeUser, unsubscribeUser } from '@/app/actions'
import { urlBase64ToUint8Array } from '@/lib/utils'
import { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { api } from '@/trpc/react'
import { useToast } from '@/hooks/use-toast'

export function PushNotificationManager() {
  const [isSupported, setIsSupported] = useState(false)
  const [subscription, setSubscription] = useState<PushSubscription | null>(
    null
  )
  const [message, setMessage] = useState('')
  const { toast } = useToast()

  // Add a mutation for checking reminders
  const checkReminders = api.habit.checkReminders.useMutation({
    onSuccess: (data) => {
      if (data?.sentCount > 0) {
        toast({
          title: 'Reminders sent',
          description: `${data.sentCount} reminder${data.sentCount !== 1 ? 's' : ''} sent successfully.`,
        })
      } else if (data?.completedCount === data?.totalHabits) {
        toast({
          title: 'All habits completed',
          description: 'All habits with reminders are already completed today. Great job!',
          variant: 'default',
        })
      } else {
        toast({
          title: 'No reminders sent',
          description: data?.totalHabits > 0 
            ? 'You have habits with reminders enabled, but you may need to set up push subscriptions.' 
            : 'No habits with reminders found.',
          variant: 'default',
        })
      }
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to check reminders.',
        variant: 'destructive',
      })
    },
  })

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
  }, [checkReminders, subscription])

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
    if (subscription) {
      // Unsubscribe from push manager
      await subscription.unsubscribe()
      // Also remove from database
      await unsubscribeUser(subscription.endpoint)
      setSubscription(null)
    }
  }

  async function sendTestNotification() {
    if (subscription) {
      await sendNotification(message)
      setMessage('')
    }
  }

  function handleCheckRemindersNow() {
    checkReminders.mutate()
    toast({
      title: 'Checking reminders',
      description: 'Checking all enabled habit reminders...',
    })
  }

  if (!isSupported) {
    return <p>Push notifications are not supported in this browser.</p>
  }

  return (
    <>
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Push Notifications</h3>
        {subscription ? (
          <div className="space-y-4">
            <p>You are subscribed to push notifications.</p>
            <div className="space-x-2">
              <Button onClick={unsubscribeFromPush} variant="outline">
                Unsubscribe
              </Button>
              <Button
                onClick={handleCheckRemindersNow}
                disabled={checkReminders.isPending}
              >
                {checkReminders.isPending
                  ? 'Checking...'
                  : 'Check Reminders Now'}
              </Button>
            </div>

            <div className="flex space-x-2">
              <input
                className="rounded-md border px-3 py-2 text-sm"
                type="text"
                placeholder="Enter notification message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <Button onClick={sendTestNotification} variant="secondary">
                Send Test
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <p>You are not subscribed to push notifications.</p>
            <Button onClick={subscribeToPush}>Subscribe</Button>
          </div>
        )}
      </div>
    </>
  )
}

