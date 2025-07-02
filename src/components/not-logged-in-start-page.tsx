'use client'
import { type Habit } from '@/server/api/routers/habit'
import { HabitCard } from './habit-card'
import { Icons } from './icons'
import posthog from 'posthog-js'

export function NotLoggedInStartPage() {
  const demoHabit: Habit = {
    what: 'Walk the dog',
    why: 'To exercise',
    when: 'Every day',
    createdById: '1',
    createdAt: new Date(),
    updatedAt: new Date(),
    id: 0,
    reminderTime: null,
    reminderEnabled: false,
  }

  return (
    <div className="flex min-h-[calc(100dvh-48px)] w-full flex-col items-center justify-between px-6 md:flex-row">
      <div className="flex flex-col items-center gap-10 py-11 md:items-start md:gap-18">
        <div className="flex flex-col items-center gap-3 md:items-start md:gap-0">
          <h1 className="text-text flex gap-4 font-serif text-7xl font-bold md:text-8xl">
            Habbit <Icons.Rabbit className="text-peach size-18 -rotate-12" />
hello hello
          </h1>
          <p className="text-subtext0 text-xl md:text-2xl">
            Take <span className="text-mauve">control</span> over your life
          </p>
        </div>
      </div>

      <div className="md:bg-subtext0 w-full max-w-md rounded-4xl bg-transparent p-0 md:p-3">
        <div className="bg-base flex h-[680px] w-full flex-col gap-6 rounded-3xl p-2 md:p-11">
          <div>
            <h2 className="text-text text-2xl font-bold">Demo</h2>
            <p className="text-subtext0">
              Try out how habits work with Habbits
            </p>
          </div>
          <HabitCard
            habit={demoHabit}
            onComplete={() => posthog.capture('demo-habit-completed')}
            isCompleted={false}
            reset={() => false}
          />
        </div>
      </div>
    </div>
  )
}
