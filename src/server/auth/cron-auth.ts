/**
 * Simplified auth utility for cron jobs that doesn't depend on Next.js's React cache
 * This allows the auth mechanism to work in Node.js scripts
 */
import NextAuth from 'next-auth'
import { authConfig } from './config'

const { auth: uncachedAuth } = NextAuth(authConfig)

// Export the uncached auth function directly (no React cache wrapper)
export const cronAuth = uncachedAuth

// For cron jobs, we don't need session-based auth
// This is a dummy function that always returns null, so the notification logic can continue
export async function getSystemAuth() {
  return null
}