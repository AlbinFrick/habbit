'use client'
import React from 'react'
import { Button } from './ui/button'
import { Icons } from './icons'
import { useCompactMode, useHabitActions } from '@/stores/habitStore'

export const CompactButton = () => {
  const { toggleCompactMode } = useHabitActions()
  const compactMode = useCompactMode()
  return (
    <Button
      variant={compactMode ? 'default' : 'outline'}
      effect={'shineHover'}
      size={'icon'}
      onClick={() => {
        toggleCompactMode()
      }}
    >
      <Icons.Layers />
    </Button>
  )
}
