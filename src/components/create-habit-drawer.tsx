'use client'

import { useState } from 'react'
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import { Button } from './ui/button'
import { Icons } from './icons'
import { HabitForm } from './habit-form'

export function CreateHabitDrawer() {
  const [open, setOpen] = useState(false)

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button size={'default'}>
          <Icons.SquarePlus />
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Create a new Habit</DrawerTitle>
        </DrawerHeader>
        <DrawerFooter>
          <HabitForm onSuccess={() => setOpen(false)} />
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
