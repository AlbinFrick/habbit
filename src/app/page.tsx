'use-client'
import { HydrateClient } from '@/trpc/server'
import { SiteHeader } from '@/components/site-header'
import { auth } from '@/server/auth'
import { FloatingNavbar } from '@/components/floating-navbar'
import { HabitGrid } from '@/components/habit-grid'
import { NotLoggedInStartPage } from '@/components/not-logged-in-start-page'

export default async function Home() {
  const session = await auth()

  return (
    <HydrateClient>
      <SiteHeader />
      <main className="bg-base mx-auto flex min-h-[calc(100dvh-48px)] w-full max-w-7xl flex-col items-center">
        <h1>Hello this is new</h1>
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
