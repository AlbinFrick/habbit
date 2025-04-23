'use client'

import { capitalizeFirst, cn } from '@/lib/utils'
import { type Habit } from '@/server/api/routers/habit'
import { useCompactMode } from '@/stores/habitStore'
import { motion, useAnimate } from 'motion/react'
import { useEffect } from 'react'
type HabitCardTextProps = {
  habit: Habit
}

export const HabitCardText = (props: HabitCardTextProps) => {
  const compactView = useCompactMode()
  const [scope, animate] = useAnimate()
  useEffect(() => {
    if (compactView) {
      animate(
        '#text-container',
        {
          opacity: 0,
          height: 0,
        },
        { duration: 0.3 }
      )
    } else {
      animate(
        '#text-container',
        {
          opacity: 1,
          height: 'auto',
        },
        { delay: 0.3, duration: 0.3 }
      )
    }
  })
  return (
    <div className="space-y-4" ref={scope}>
      <motion.p
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ ease: [0.2, 0.71, 0.2, 1.01], duration: 0.5 }}
        className={cn(
          'font-serif font-bold',
          compactView ? 'text-3xl' : 'text-4xl'
        )}
      >
        {capitalizeFirst(props.habit.what)}
      </motion.p>
      <div className="space-y-4" id="text-container">
        <motion.p
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            ease: [0.2, 0.71, 0.2, 1.01],
            duration: 0.3,
            delay: 0.1,
          }}
          className="text-xl"
        >
          {capitalizeFirst(props.habit.when)}
        </motion.p>
        <p className="text-subtext0 italic">so I can</p>
        <motion.p
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            ease: [0.2, 0.71, 0.2, 1.01],
            duration: 0.3,
            delay: 0.2,
          }}
          className="text-2xl"
        >
          {capitalizeFirst(props.habit.why)}
        </motion.p>
      </div>
    </div>
  )
}
