'use-client'
import { HydrateClient } from '@/trpc/server'
import { SiteHeader } from '@/components/site-header'
import { auth } from '@/server/auth'
import { FloatingNavbar } from '@/components/floating-navbar'
import { HabitGrid } from '@/components/habit-grid'
import { NotLoggedInStartPage } from '@/components/not-logged-in-start-page'
import { SignInButton } from '@/components/sign-in-button'
import { Icons } from '@/components/icons'
import { HabitCard } from '@/components/habit-card'
import { type Habit } from '@/server/api/routers/habit'
import { PushNotificationManager } from '@/components/push-notification-manager'
import { InstallPrompt } from '@/components/install-prompt'

export default async function Home() {
  const session = await auth()

  return (
    <HydrateClient>
      <SiteHeader />
      <div>
        <PushNotificationManager />
        <InstallPrompt />
      </div>
      <main className="bg-base mx-auto flex min-h-[calc(100dvh-48px)] w-full max-w-7xl flex-col items-center">
        {session ? (
          <>
            <HabitGrid />
            <FloatingNavbar />
          </>
        ) : (
          <NotLoggedInStartPage />
        )}
      </main>
    </HydrateClient>
  )
}
