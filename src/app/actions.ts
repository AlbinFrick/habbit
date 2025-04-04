'use server'

import webpush, { type PushSubscription } from 'web-push'
import { UTCDate } from "@date-fns/utc";


// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
webpush.setVapidDetails(
  'mailto:albinfrick@proton.me',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)

export async function subscribeUser(
  sub: PushSubscription & { keys: { p256dh: string; auth: string } }
) {
  const { db } = await import('@/server/db')
  const { pushSubscriptions } = await import('@/server/db/schema')
  const { eq } = await import('drizzle-orm')
  const { auth } = await import('@/server/auth')

  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: 'User not authenticated' }
  }

  try {
    // First check if a subscription with this endpoint already exists
    const existingSub = await db.query.pushSubscriptions.findFirst({
      where: eq(pushSubscriptions.endpoint, sub.endpoint),
    })

    if (existingSub) {
      // Update the existing subscription
      await db
        .update(pushSubscriptions)
        .set({
          p256dh: sub.keys.p256dh,
          auth: sub.keys.auth,
          updatedAt: new Date(),
        })
        .where(eq(pushSubscriptions.endpoint, sub.endpoint))
    } else {
      // Create a new subscription
      await db.insert(pushSubscriptions).values({
        userId: session.user.id,
        endpoint: sub.endpoint,
        p256dh: sub.keys.p256dh,
        auth: sub.keys.auth,
      })
    }

    return { success: true }
  } catch (error) {
    console.error('Error storing push subscription:', error)
    return { success: false, error: 'Failed to store subscription' }
  }
}

export async function unsubscribeUser(endpoint?: string) {
  const { db } = await import('@/server/db')
  const { pushSubscriptions } = await import('@/server/db/schema')
  const { eq } = await import('drizzle-orm')
  const { auth } = await import('@/server/auth')

  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: 'User not authenticated' }
  }

  try {
    if (endpoint) {
      // Delete specific subscription by endpoint
      await db
        .delete(pushSubscriptions)
        .where(eq(pushSubscriptions.endpoint, endpoint))
    } else {
      // Delete all subscriptions for this user
      await db
        .delete(pushSubscriptions)
        .where(eq(pushSubscriptions.userId, session.user.id))
    }

    return { success: true }
  } catch (error) {
    console.error('Error removing push subscription:', error)
    return { success: false, error: 'Failed to remove subscription' }
  }
}

export async function sendNotification(
  message: string,
  userId: string,
  title?: string
) {
  const { db } = await import('@/server/db')
  const { pushSubscriptions } = await import('@/server/db/schema')
  const { eq } = await import('drizzle-orm')

  try {
    // Get all subscriptions for this user
    const subs = await db.query.pushSubscriptions.findMany({
      where: eq(pushSubscriptions.userId, userId),
    })

    if (!subs.length) {
      return { success: false, error: 'No subscriptions found' }
    }

    const results = await Promise.allSettled(
      subs.map(async (sub) => {
        try {
          const pushSubscription = {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth,
            },
          }

          await webpush.sendNotification(
            pushSubscription as PushSubscription,
            JSON.stringify({
              title,
              body: message,
              icon: '/rabbit.svg',
            })
          )
          return { success: true, endpoint: sub.endpoint }
        } catch (error) {
          console.error(
            'Error sending notification to subscription:',
            sub.endpoint,
            error
          )
          if (error instanceof Error && error.name === 'WebPushError') {
            await db
              .delete(pushSubscriptions)
              .where(eq(pushSubscriptions.endpoint, sub.endpoint))
          }
          return { success: false, endpoint: sub.endpoint, error }
        }
      })
    )

    const successCount = results.filter(
      (r) => r.status === 'fulfilled' && r.value.success
    ).length

    return {
      success: successCount > 0,
      sent: successCount,
      total: subs.length,
      results,
    }
  } catch (error) {
    console.error('Error sending push notifications:', error)
    return { success: false, error: 'Failed to send notifications' }
  }
}

export async function checkAndSendHabitReminders(forceCheck = true) {
  // This would be triggered by a cron job or similar scheduler
  const { db } = await import('@/server/db')
  const { habits, habitCompletions, pushSubscriptions } = await import(
    '@/server/db/schema'
  )
  const { eq, and, not, isNull } = await import('drizzle-orm')


  // Find all habits with enabled reminders
  // When forceCheck is true (manual check), we check all habits regardless of time
  // When running automatically, we would check time matches
  const habitsToRemind = await db.query.habits.findMany({
    where: and(
      eq(habits.reminderEnabled, true),
      not(isNull(habits.reminderTime))
    ),
  })

  // Get current time in UTC
  const localTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone
  const now = new UTCDate()
  const today = now.toISOString().split('T')[0] ?? ''
  let clientUTCHour;

  const serverUTCHour = now.getHours()
  const serverUTCMinute = now.getMinutes()

  const filteredHabits = forceCheck 
    ? habitsToRemind 
    : habitsToRemind.filter(habit => {
        if (!habit.reminderTime) return false;
        const reminderTime = new UTCDate(habit.reminderTime)
        clientUTCHour = reminderTime.getHours()
        return (
          reminderTime.getHours() === serverUTCHour &&
          reminderTime.getMinutes() === serverUTCMinute
        )
      })

  // Group habits by user for more efficient notification sending
  const habitsByUser = filteredHabits.reduce<
    Record<string, typeof filteredHabits>
  >((acc, habit) => {
    const userId = habit.createdById
    if (!acc[userId]) {
      acc[userId] = []
    }
    acc[userId].push(habit)
    return acc
  }, {})

  const results = []

  // Process each user's habits
  for (const [userId, userHabits] of Object.entries(habitsByUser)) {
    // Check if user has any push subscriptions
    const userSubs = await db.query.pushSubscriptions.findMany({
      where: eq(pushSubscriptions.userId, userId),
    })

    if (!userSubs.length) {
      // Skip if user has no push subscriptions
      results.push(
        ...userHabits.map((habit) => ({
          habitId: habit.id,
          habitName: habit.what,
          sent: false,
          reason: 'No push subscriptions found for user',
        }))
      )
      continue
    }

    // Process each habit for this user
    for (const habit of userHabits) {
      // Check if habit is already completed today
      const completed = await db.query.habitCompletions.findFirst({
        where: and(
          eq(habitCompletions.habitId, habit.id),
          eq(habitCompletions.completedDate, today)
        ),
      })

      if (completed) {
        // Skip already completed habits
        results.push({
          habitId: habit.id,
          habitName: habit.what,
          sent: false,
          completed: true,
        })
        continue
      }

      console.log(`Sending reminder for habit ${habit.id}: ${habit.what}`)
      // Send notification for this habit
      const result = await sendNotification(
        `Don't forget to ${habit.what} ${habit.when}!`,
        userId,
        'Habit Reminder'
      )

      results.push({
        habitId: habit.id,
        habitName: habit.what,
        sent: result.success,
        ...result,
      })
    }
  }

  return { 
    success: true, 
    results, 
    today, 
    currentTime: now?.toISOString()?.split('T')[1]?.split('.')[0],
    clientUTCHour,
    serverUTCHour,
    serverUTCMinute,
    localTimezone,
  }
}
