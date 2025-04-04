import { relations, sql } from 'drizzle-orm'
import {
  index,
  int,
  primaryKey,
  sqliteTableCreator,
  text,
  unique,
} from 'drizzle-orm/sqlite-core'
import { type AdapterAccount } from 'next-auth/adapters'

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = sqliteTableCreator((name) => `habbit_${name}`)

export const posts = createTable(
  'post',
  {
    id: int('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
    name: text('name', { length: 256 }),
    createdById: text('created_by', { length: 255 })
      .notNull()
      .references(() => users.id),
    createdAt: int('created_at', { mode: 'timestamp' })
      .default(sql`(unixepoch())`)
      .notNull(),
    updatedAt: int('updatedAt', { mode: 'timestamp' }).$onUpdate(
      () => new Date()
    ),
  },
  (example) => ({
    createdByIdIdx: index('created_by_idx').on(example.createdById),
    nameIndex: index('name_idx').on(example.name),
  })
)

export const users = createTable('user', {
  id: text('id', { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text('name', { length: 255 }),
  email: text('email', { length: 255 }).notNull(),
  emailVerified: int('email_verified', {
    mode: 'timestamp',
  }).default(sql`(unixepoch())`),
  image: text('image', { length: 255 }),
})

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  pushSubscriptions: many(pushSubscriptions)
}))

export const accounts = createTable(
  'account',
  {
    userId: text('user_id', { length: 255 })
      .notNull()
      .references(() => users.id),
    type: text('type', { length: 255 })
      .$type<AdapterAccount['type']>()
      .notNull(),
    provider: text('provider', { length: 255 }).notNull(),
    providerAccountId: text('provider_account_id', {
      length: 255,
    }).notNull(),
    refresh_token: text('refresh_token'),
    access_token: text('access_token'),
    expires_at: int('expires_at'),
    token_type: text('token_type', { length: 255 }),
    scope: text('scope', { length: 255 }),
    id_token: text('id_token'),
    session_state: text('session_state', { length: 255 }),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
    userIdIdx: index('account_user_id_idx').on(account.userId),
  })
)

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}))

export const sessions = createTable(
  'session',
  {
    sessionToken: text('session_token', { length: 255 }).notNull().primaryKey(),
    userId: text('userId', { length: 255 })
      .notNull()
      .references(() => users.id),
    expires: int('expires', { mode: 'timestamp' }).notNull(),
  },
  (session) => ({
    userIdIdx: index('session_userId_idx').on(session.userId),
  })
)

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}))

export const verificationTokens = createTable(
  'verification_token',
  {
    identifier: text('identifier', { length: 255 }).notNull(),
    token: text('token', { length: 255 }).notNull(),
    expires: int('expires', { mode: 'timestamp' }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  })
)

export const habits = createTable('habit', {
  id: int('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  what: text('what', { length: 255 }).notNull(),
  why: text('why', { length: 255 }).notNull(),
  when: text('when', { length: 255 }).notNull(),
  reminderTime: int('reminder_time', { mode: 'timestamp' }),
  reminderEnabled: int('reminder_enabled', { mode: 'boolean' }).default(false),

  createdById: text('created_by', { length: 255 })
    .notNull()
    .references(() => users.id),
  createdAt: int('created_at', { mode: 'timestamp' })
    .default(sql`(unixepoch())`)
    .notNull(),
  updatedAt: int('updatedAt', { mode: 'timestamp' }).$onUpdate(
    () => new Date()
  ),
})

export const habitCompletions = createTable(
  'habit_completions',
  {
    id: int('id').primaryKey({ autoIncrement: true }),
    habitId: int('habit_id').references(() => habits.id, {
      onDelete: 'cascade',
    }),
    completedDate: text('completed_date').notNull(),
  },
  (table) => ({
    uniqueHabitDate: unique().on(table.habitId, table.completedDate),
  })
)

export const habitsRelations = relations(habits, ({ many }) => ({
  completions: many(habitCompletions),
}))

export const habitCompletionsRelations = relations(
  habitCompletions,
  ({ one }) => ({
    habit: one(habits, {
      fields: [habitCompletions.habitId],
      references: [habits.id],
    }),
  })
)

// Push subscription table to store push notification subscriptions
export const pushSubscriptions = createTable(
  'push_subscription',
  {
    id: int('id').primaryKey({ autoIncrement: true }),
    userId: text('user_id', { length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    endpoint: text('endpoint').notNull(),
    p256dh: text('p256dh').notNull(), // Public key
    auth: text('auth').notNull(), // Auth secret
    createdAt: int('created_at', { mode: 'timestamp' })
      .default(sql`(unixepoch())`)
      .notNull(),
    updatedAt: int('updated_at', { mode: 'timestamp' })
      .$onUpdate(() => new Date())
      .default(sql`(unixepoch())`),
  },
  (table) => ({
    userIdIdx: index('push_sub_user_id_idx').on(table.userId),
    uniqueEndpoint: unique().on(table.endpoint),
  })
)

export const pushSubscriptionsRelations = relations(
  pushSubscriptions,
  ({ one }) => ({
    user: one(users, {
      fields: [pushSubscriptions.userId],
      references: [users.id],
    }),
  })
)

