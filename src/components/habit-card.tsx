'use client'
import { type AnimationSequence, motion, useAnimate } from 'motion/react'
import { useCallback, useEffect, useState } from 'react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip'
import { cn } from '@/lib/utils'
import { type Habit } from '@/server/api/routers/habit'
import { Icons } from './icons'
import { HabitForm } from './habit-form'
import { useCompactMode } from '@/stores/habitStore'
import { HabitCardText } from './habit-card-text'

interface HabitCardProps {
  habit: Habit
  isCompleted: boolean
  completions?: number
  onComplete: (habitId: number) => void
  reset: () => boolean
}

export const HabitCard = (props: HabitCardProps) => {
  const [scope, animate] = useAnimate()
  const [holdTimeout, setHoldTimeout] = useState<NodeJS.Timeout | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [localComplete, setLocalComplete] = useState(props.isCompleted)
  const compactView = useCompactMode()

  const completedAnimation = () => {
    animate(
      '#backdrop',
      {
        background:
          'linear-gradient(45deg, var(--color-lime-500) 0%, var(--color-green-500) 50%, var(--color-emerald-500) 100%)',
        opacity: 1,
        height: '300%',
        left: '50%',
      },
      { duration: 1 }
    )

    animate(
      '#check-button',
      { background: 'rgba(239, 241, 245, 0)' },
      { duration: 0.4 }
    )

    const buttonSequence = [
      ['#check-button', { scale: 0.5 }, { duration: 0.9 }],
      ['#check-button', { scale: 2.5 }, { duration: 0.3 }],
      ['#check-button', { scale: 1.5 }, { duration: 0.2 }],
      ['#count', { rotate: 10, scale: 1.1 }, { duration: 0.1 }],
      ['#count', { rotate: -10, scale: 1.2 }, { duration: 0.2 }],
      ['#count', { rotate: 0, scale: 1 }, { duration: 0.3 }],
    ] as AnimationSequence

    animate(buttonSequence)
  }

  const notCompletedAnimation = useCallback(() => {
    if (props.isCompleted) return
    animate(
      '#backdrop',
      {
        height: '0',
        opacity: 0,
        left: compactView ? '80%' : '50%',
      },
      { duration: 0.8 }
    )
    animate(
      '#check-button',
      { scale: 1, background: 'rgba(239, 241, 245,1)' },
      { duration: 0.8 }
    )
    animate('#count', { rotate: 0, scale: 1 }, { duration: 0.3 })
  }, [animate, compactView, props.isCompleted])

  useEffect(() => {
    if (props.reset()) notCompletedAnimation()
  }, [props.reset, notCompletedAnimation, props])

  const handleHoldStart = () => {
    completedAnimation()
    setHoldTimeout(
      setTimeout(() => {
        props.onComplete(props.habit.id)
        setLocalComplete(true)
      }, 800)
    )
  }

  const handleHoldEnd = async () => {
    if (holdTimeout) {
      clearTimeout(holdTimeout)
      setHoldTimeout(null)
    }

    if (!localComplete) {
      notCompletedAnimation()
    }
  }

  return (
    <motion.div
      ref={scope}
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'relative w-full overflow-clip rounded-3xl bg-white shadow-lg',
        compactView ? 'h-[180px]' : 'h-[75vh] md:h-[44rem]'
      )}
    >
      <div
        id="count"
        className={cn(
          props.isCompleted ? 'from-sapphire to-green' : 'from-sky to-blue',
          'bg-peach absolute top-2 right-2 z-50 flex items-center gap-1 rounded-xl bg-linear-to-r px-3 py-1.5'
        )}
      >
        <Icons.Zap className="size-6" />
        <p className="text-xl">{props.completions}</p>
      </div>

      <span
        id="backdrop"
        className={cn(
          'absolute bottom-[25%] left-1/2 aspect-square h-0 -translate-x-1/2 translate-y-1/2 rounded-full',
          compactView && 'bottom-[50%] left-[80%]',
          props.isCompleted &&
            'left-1/2 h-[300%] rounded-none bg-linear-to-tr from-lime-500 via-green-500 to-emerald-500 opacity-100'
        )}
      ></span>

      <div
        id="content"
        className={cn(
          'justify absolute inset-0 flex flex-col items-center gap-11 px-6 pb-16 shadow-lg md:px-16',
          compactView && 'pb-0'
        )}
      >
        {!compactView && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className="mt-2"
                  onClick={() => {
                    setIsEditing(!isEditing)
                  }}
                >
                  <Icons.Ellipsis className="text-text" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Redigera vana</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        <div
          className={cn(
            'flex h-full min-w-1/2 flex-col items-center justify-between',
            compactView && 'w-full flex-row items-center justify-between'
          )}
        >
          <div id="habit-text-container" className="text-text w-full space-y-4">
            {isEditing && !compactView ? (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <HabitForm
                  habit={{ isCompleted: props.isCompleted, ...props.habit }}
                  onSuccess={() => setIsEditing(false)}
                  onRevert={() => {
                    setLocalComplete(false)
                    notCompletedAnimation()
                  }}
                />
              </motion.div>
            ) : (
              <HabitCardText habit={props.habit} />
            )}
          </div>

          <motion.button
            onContextMenu={(e) => e.preventDefault()}
            disabled={props.isCompleted}
            onTapStart={() => !props.isCompleted && handleHoldStart()}
            onTap={handleHoldEnd}
            onTapCancel={handleHoldEnd}
            id="check-button"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5 }}
            className={cn(
              'text-text bg-base rounded-full p-12 select-none',
              compactView && 'p-8',
              props.isCompleted && 'bg-transparent'
            )}
          >
            <Icons.Check className={cn('size-24', compactView && 'size-12')} />
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}
