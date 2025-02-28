'use server'

import webpush, { type PushSubscription } from 'web-push'

// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
webpush.setVapidDetails(
  'mailto:albinfrick@proton.me',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)

let subscription: PushSubscription | null = null

export async function subscribeUser(sub: PushSubscription) {
  subscription = sub
  // In a production environment, you would want to store the subscription in a database
  // For example: await db.subscriptions.create({ data: sub })
  return { success: true }
}

export async function unsubscribeUser() {
  subscription = null
  // In a production environment, you would want to remove the subscription from the database
  // For example: await db.subscriptions.delete({ where: { ... } })
  return { success: true }
}

export async function sendNotification(
  message: string,
  title = 'Habit Reminder'
) {
  if (!subscription) {
    throw new Error('No subscription available')
  }

  try {
    await webpush.sendNotification(
      subscription,
      JSON.stringify({
        title,
        body: message,
        icon: '/rabbit.svg',
      })
    )
    return { success: true }
  } catch (error) {
    console.error('Error sending push notification:', error)
    return { success: false, error: 'Failed to send notification' }
  }
}

export async function sendHabitReminder(habitId: number, habitName: string) {
  // This would typically be called by a scheduled job
  // Check if the habit is already completed for today
  const { db } = await import('@/server/db')
  const { habitCompletions } = await import('@/server/db/schema')
  const { eq, and } = await import('drizzle-orm')

  const today = new Date().toISOString().split('T')[0] ?? ''

  // Check if habit is already completed
  const completed = await db.query.habitCompletions.findFirst({
    where: and(
      eq(habitCompletions.habitId, habitId),
      eq(habitCompletions.completedDate, today)
    ),
  })

  // Only send notification if the habit is not completed
  if (!completed && subscription) {
    return sendNotification(
      `Don't forget to ${habitName} today!`,
      'Habit Reminder'
    )
  }

  return { success: true, message: 'No notification needed' }
}

export async function checkAndSendHabitReminders() {
  // This would be triggered by a cron job or similar scheduler
  const { db } = await import('@/server/db')
  const { habits, habitCompletions } = await import('@/server/db/schema')
  const { eq, and, not, isNull } = await import('drizzle-orm')

  // Get current time in HH:MM format
  const now = new Date()
  // const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
  const today = now.toISOString().split('T')[0] ?? ''

  // Find all habits with enabled reminders and matching time
  const habitsToRemind = await db.query.habits.findMany({
    where: and(
      eq(habits.reminderEnabled, true),
      not(isNull(habits.reminderTime))
    ),
  })

  console.log('Habits to remind', habitsToRemind)

  // For each habit, check if it's completed today and send notification if not
  const results = []

  for (const habit of habitsToRemind) {
    // Check if habit is already completed today
    const completed = await db.query.habitCompletions.findFirst({
      where: and(
        eq(habitCompletions.habitId, habit.id),
        eq(habitCompletions.completedDate, today)
      ),
    })

    // Only send notification if not completed
    if (!completed && subscription) {
      const result = await sendNotification(
        `Don't forget to ${habit.what} ${habit.when}!`,
        'Habit Reminder'
      )
      results.push({ habitId: habit.id, sent: true, ...result })
    } else {
      results.push({ habitId: habit.id, sent: false, completed: !!completed })
    }
  }

  return { success: true, results }
}
