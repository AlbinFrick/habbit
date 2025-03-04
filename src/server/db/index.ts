import { createClient, type Client } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'

import { env } from '@/env'
import * as schema from './schema'

/**
 * Cache the database connection in development. This avoids creating a new connection on every HMR
 * update.
 */
const globalForDb = globalThis as unknown as {
  client: Client | undefined
}

const url = env.TURSO_DATABASE_URL
if (url === undefined) {
  throw new Error('TURSO_URL is not defined', url)
}

const clientOptions =
  env.NODE_ENV === 'production'
    ? { url: env.TURSO_DATABASE_URL, authToken: env.TURSO_DATABASE_AUTH_TOKEN }
    : { url: env.DATABASE_URL }

export const client = globalForDb.client ?? createClient(clientOptions)
if (env.NODE_ENV !== 'production') globalForDb.client = client

export const db = drizzle(client, { schema })
