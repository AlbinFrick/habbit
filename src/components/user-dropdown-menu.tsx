'use client'

import { useState } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { siteConfig } from '@/config/site.config'
import { type Session } from 'next-auth'
import { signOut } from 'next-auth/react'
import { InstallPrompt } from './install-prompt'
import { PushNotificationManager } from './push-notification-manager'

type UserProfileSheetProps = {
  session: Session
}

export function UserProfileSheet({ session }: UserProfileSheetProps) {
  const [open, setOpen] = useState(false)

  const { name, image, email } = session.user

  // Fix this
  if (!name || !image || !email) {
    return <div>error</div>
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Avatar className="aspect-square h-7 w-7">
          <AvatarImage src={image} alt={name} />
          <AvatarFallback>{name.charAt(0)}</AvatarFallback>
        </Avatar>
      </SheetTrigger>
      <SheetContent side="right" className="w-full">
        <SheetHeader>
          <SheetTitle>{siteConfig.name}</SheetTitle>
        </SheetHeader>
        <div className="mt-6 flex items-center space-x-4">
          <Avatar className="h-10 w-10">
            <AvatarImage src={image} alt={name} />
            <AvatarFallback>{name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium">@{name}</h3>
            <p className="text-sm text-gray-500">{email}</p>
          </div>
        </div>
        <div>
          <PushNotificationManager />
          <InstallPrompt />
        </div>
        <div className="space-y-4"></div>
        <div className="absolute right-6 bottom-6 left-6">
          <Button
            variant="destructive"
            className="w-full"
            onClick={() => signOut()}
          >
            Sign Out
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
