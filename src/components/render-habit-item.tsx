'use client'
import React from 'react'
import { motion } from 'motion/react'
import { HabitCard } from './habit-card'
import { type Habit } from '@/server/api/routers/habit'

export type SortedHabitItem = {
  habit: Habit
  isCompleted: boolean
  completions: number
  originalIndex: number
}

interface HabitItemProps {
  sortedHabitItem: SortedHabitItem
  handleCompleteAction: (habitId: number) => void
  faultyHabit: number
  setFaultyHabitAction: (id: number) => void
}

export const RenderHabitItem: React.FC<HabitItemProps> = ({
  sortedHabitItem,
  handleCompleteAction: handleComplete,
  faultyHabit,
  setFaultyHabitAction: setFaultyHabit,
}) => {
  if (!sortedHabitItem.habit) {
    return (
      <p
        key={`error-${sortedHabitItem.originalIndex}`}
        className="text-destructive"
      >
        Something went wrong when fetching this habit
      </p>
    )
  }

  return (
    <motion.div
      layout
      key={sortedHabitItem.habit.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        layout: { duration: 0.3 },
        opacity: { duration: 0.5 },
        y: {
          duration: 0.5,
          delay: Math.min(sortedHabitItem.originalIndex * 0.1, 0.5),
        },
      }}
      exit={{ opacity: 0, y: -20 }}
    >
      <HabitCard
        habit={sortedHabitItem.habit}
        isCompleted={sortedHabitItem.isCompleted}
        completions={sortedHabitItem.completions}
        onComplete={handleComplete}
        reset={() => {
          if (faultyHabit === sortedHabitItem.habit.id) {
            setFaultyHabit(-1)
            return true
          }
          return false
        }}
      />
    </motion.div>
  )
}
