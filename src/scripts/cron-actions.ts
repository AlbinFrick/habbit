/**
 * Modified versions of the actions that work in a Node.js cron environment
 * These functions avoid using Next.js server components/React features
 */
import webpush, { type PushSubscription } from 'web-push'
import * as schema from '../server/db/schema'

// Set up webpush with the same VAPID details
webpush.setVapidDetails(
  'mailto:albinfrick@proton.me',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)

// Define types to match the database schema
type PushSubscriptionType = {
  id: number
  userId: string
  endpoint: string
  p256dh: string
  auth: string
  createdAt: Date
  updatedAt: Date
}

type HabitType = {
  id: number
  what: string
  why: string
  when: string
  reminderTime: string | null
  reminderEnabled: boolean
  createdById: string
  createdAt: Date
  updatedAt: Date | null
}

/**
 * Send push notification for cron jobs 
 * This version doesn't require auth from a user session
 */
export async function sendNotificationForCron(
  message: string,
  title = 'Habit Reminder',
  userId: string  // userId is required for cron version
) {
  // Direct imports instead of dynamic imports for better Node.js compatibility
  const { db } = require('../server/db')
  const { pushSubscriptions } = require('../server/db/schema')
  const { eq } = require('drizzle-orm')
  
  if (!userId) {
    return { success: false, error: 'No user ID provided' }
  }

  try {
    // Get all subscriptions for this user
    const subs = await db.query.pushSubscriptions.findMany({
      where: eq(pushSubscriptions.userId, userId),
    }) as PushSubscriptionType[]

    if (!subs.length) {
      return { success: false, error: 'No subscriptions found' }
    }

    const results = await Promise.allSettled(
      subs.map(async (sub: PushSubscriptionType) => {
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

/**
 * Check for habits that need reminders and send notifications
 * This is the cron-specific version that doesn't use Next.js React features
 */
export async function checkAndSendHabitRemindersForCron(forceCheck = true) {
  // Direct imports instead of dynamic imports for better Node.js compatibility
  const { db } = require('../server/db')
  const { habits, habitCompletions, pushSubscriptions } = require('../server/db/schema')
  const { eq, and, not, isNull } = require('drizzle-orm')

  // Get current time in HH:MM format
  const now = new Date()
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
  const today = now.toISOString().split('T')[0] ?? ''

  console.log(`Running habit reminder check at ${currentTime} for date ${today}`)

  // Find all habits with enabled reminders
  // When forceCheck is true (manual check), we check all habits regardless of time
  // When running automatically, we would check time matches
  const habitsToRemind = await db.query.habits.findMany({
    where: and(
      eq(habits.reminderEnabled, true),
      not(isNull(habits.reminderTime)),
      // If implementing time-specific checks:
      forceCheck ? undefined : eq(habits.reminderTime, currentTime)
    ),
  }) as HabitType[]

  console.log(`Found ${habitsToRemind.length} habits that need reminders`)

  // Group habits by user for more efficient notification sending
  const habitsByUser = habitsToRemind.reduce<Record<string, HabitType[]>>(
    (acc: Record<string, HabitType[]>, habit: HabitType) => {
      const userId = habit.createdById
      if (!acc[userId]) {
        acc[userId] = []
      }
      acc[userId].push(habit)
      return acc
    }, 
    {}
  )

  const results: Array<{
    habitId: number
    habitName: string
    sent: boolean
    completed?: boolean
    reason?: string
    [key: string]: any
  }> = []

  // Process each user's habits
  for (const [userId, userHabits] of Object.entries(habitsByUser)) {
    console.log(`Processing ${userHabits.length} habits for user ${userId}`)
    
    // Check if user has any push subscriptions
    const userSubs = await db.query.pushSubscriptions.findMany({
      where: eq(pushSubscriptions.userId, userId),
    }) as PushSubscriptionType[]

    if (!userSubs.length) {
      // Skip if user has no push subscriptions
      console.log(`User ${userId} has no push subscriptions`)
      results.push(
        ...userHabits.map((habit: HabitType) => ({
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
      console.log(`Processing habit: ${habit.what} (${habit.id})`)
      
      // Check if habit is already completed today
      const completed = await db.query.habitCompletions.findFirst({
        where: and(
          eq(habitCompletions.habitId, habit.id),
          eq(habitCompletions.completedDate, today)
        ),
      })

      if (completed) {
        // Skip already completed habits
        console.log(`Habit ${habit.id} already completed today`)
        results.push({
          habitId: habit.id,
          habitName: habit.what,
          sent: false,
          completed: true,
        })
        continue
      }

      // Send notification for this habit
      console.log(`Sending notification for habit ${habit.id}`)
      const result = await sendNotificationForCron(
        `Don't forget to ${habit.what} ${habit.when}!`,
        'Habit Reminder',
        userId
      )

      // Modify the result object to ensure type safety
      const safeResult = {
        habitId: habit.id,
        habitName: habit.what,
        sent: Boolean(result.success), // Force boolean conversion
        success: Boolean(result.success),
        total: result.total,
        results: result.results,
      }
      
      results.push(safeResult)
    }
  }

  return { success: true, results, today, currentTime }
}