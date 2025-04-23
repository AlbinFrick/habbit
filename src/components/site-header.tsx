import Link from 'next/link'
import { siteConfig } from '@/config/site.config'
import { auth } from '@/server/auth'
import { SignInButton } from './sign-in-button'
import { UserProfileSheet } from './user-dropdown-menu'

export async function SiteHeader() {
  const session = await auth()
  return (
    <header role="banner" className="bg-base w-screen">
      <div className="flex items-center justify-between p-2">
        <Link href="/">
          <h1 id="site-title" className="text-2xl font-black">
            {siteConfig.name}
          </h1>
        </Link>
        <div>
          {session ? <UserProfileSheet session={session} /> : <SignInButton />}
        </div>
      </div>
    </header>
  )
}
