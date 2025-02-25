'use client'
import React, { useState } from 'react'
import { api } from '@/trpc/react'
import posthog from 'posthog-js'
import { useToast } from '@/hooks/use-toast'
import { LayoutGroup, motion } from 'motion/react'
import { Icons } from './icons'
import { RenderHabitItem, type SortedHabitItem } from './render-habit-item'

export const HabitGrid = () => {
  const [faultyHabit, setFaultyHabit] = useState(-1)
  const { toast } = useToast()

  const {
    data: habitsData,
    isError,
    isLoading,
  } = api.habit.getHabitsWithStatus.useQuery()

  const utils = api.useUtils()
  const completeHabit = api.habit.complete.useMutation({
    onSuccess: async () => {
      await utils.habit.getHabitsWithStatus.invalidate()
    },
    onError(_, variables) {
      setFaultyHabit(variables.habitId)

      toast({
        variant: 'destructive',
        title: 'Something went wrong',
        description: `Try reloading the app and try again`,
      })
    },
  })

  const sortedHabits = React.useMemo(() => {
    if (!habitsData) return []

    return habitsData
      .map((data, i) => ({
        ...data,
        originalIndex: i,
      }))
      .sort((a, b) => {
        // Sort by completion status (uncompleted first)
        if (a.isCompleted && !b.isCompleted) return 1
        if (!a.isCompleted && b.isCompleted) return -1
        // If completion status is the same, maintain original order
        return a.originalIndex - b.originalIndex
      })
  }, [habitsData])

  const handleComplete = (habitId: number) => {
    posthog.capture('habit-completed', { id: habitId })
    completeHabit.mutate({ habitId })
  }

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex h-[50vh] w-full items-center justify-center"
      >
        <Icons.Loader className="size-10 animate-[spin_1.5s_linear_infinite]" />
      </motion.div>
    )
  }

  if (isError) {
    return <p>Something went wrong when fetching your habits</p>
  }

  if (!habitsData || habitsData.length === 0) {
    return <p>You have no habits, add one in the menu below</p>
  }

  return (
    <div className="grid w-full grid-cols-1 gap-8 py-11">
      <LayoutGroup>
        <motion.div
          layout
          className="sm:responsive-grid-[23rem] grid w-full place-items-center gap-6 px-4 md:px-11"
        >
          {sortedHabits.map((sortedHabitItem: SortedHabitItem) => (
            <RenderHabitItem
              key={sortedHabitItem.habit?.id ?? sortedHabitItem.originalIndex}
              sortedHabitItem={sortedHabitItem}
              handleCompleteAction={handleComplete}
              faultyHabit={faultyHabit}
              setFaultyHabitAction={setFaultyHabit}
            />
          ))}
        </motion.div>
      </LayoutGroup>
    </div>
  )
}
