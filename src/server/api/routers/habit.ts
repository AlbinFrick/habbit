import { z } from 'zod'

import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc'
import { habitCompletions, habits } from '@/server/db/schema'
import { and, eq, type InferSelectModel } from 'drizzle-orm'

export const habitRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        what: z.string().min(1),
        why: z.string().min(1),
        when: z.string().min(1),
        reminderEnabled: z.boolean().default(false),
        reminderTime: z.date().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(habits).values({
        createdById: ctx.session.user.id,
        what: input.what,
        why: input.why,
        when: input.when,
        reminderEnabled: input.reminderEnabled,
        reminderTime: input.reminderTime,
      })
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        what: z.string().min(1),
        why: z.string().min(1),
        when: z.string().min(1),
        reminderEnabled: z.boolean().default(false),
        reminderTime: z.date().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {

      await ctx.db
        .update(habits)
        .set({
          what: input.what,
          why: input.why,
          when: input.when,
          reminderEnabled: input.reminderEnabled,
          reminderTime: input.reminderTime,
        })
        .where(eq(habits.id, input.id))
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      // First delete all completions for this habit
      await ctx.db
        .delete(habitCompletions)
        .where(eq(habitCompletions.habitId, input.id))
      // Then delete the habit itself
      await ctx.db.delete(habits).where(eq(habits.id, input.id))
    }),

  getHabitsWithStatus: protectedProcedure.query(async ({ ctx }) => {
    const fetchedHabits = await ctx.db.query.habits.findMany({
      where: eq(habits.createdById, ctx.session.user.id),
    })

    if (!fetchedHabits) return null

    const today = new Date().toISOString().split('T')[0]?.toString() ?? ''
    const completions = await ctx.db.query.habitCompletions.findMany()

    return fetchedHabits.map((habit) => ({
      habit,
      isCompleted: completions.some(
        (completion) =>
          completion.habitId === habit.id && completion.completedDate === today
      ),
      completions: completions.filter(
        (completion) => completion.habitId === habit.id
      ).length,
    }))
  }),

  complete: protectedProcedure
    .input(z.object({ habitId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .insert(habitCompletions)
        .values({
          habitId: input.habitId,
          completedDate:
            new Date().toISOString().split('T')[0]?.toString() ?? '',
        })
        .onConflictDoNothing()
    }),

  revertCompletion: protectedProcedure
    .input(z.object({ habitId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const today = new Date().toISOString().split('T')[0]?.toString() ?? ''
      await ctx.db
        .delete(habitCompletions)
        .where(
          and(
            eq(habitCompletions.habitId, input.habitId),
            eq(habitCompletions.completedDate, today)
          )
        )
    }),

  isComplete: protectedProcedure
    .input(z.object({ habitId: z.number() }))
    .query(async ({ ctx, input }) => {
      const completedHabit = await ctx.db.query.habitCompletions.findFirst({
        where: eq(habitCompletions.habitId, input.habitId),
      })
      return completedHabit ? true : false
    }),

  getCompletionsCount: protectedProcedure
    .input(z.object({ habitId: z.number() }))
    .query(async ({ ctx, input }) => {
      const completions = await ctx.db.query.habitCompletions.findMany({
        where: eq(habitCompletions.habitId, input.habitId),
      })
      return completions.length
    }),

  getBatchCompletionStatus: protectedProcedure
    .input(z.object({ habitIds: z.array(z.number()) }))
    .query(async ({ ctx, input }) => {
      const today = new Date().toISOString().split('T')[0]?.toString() ?? ''

      const completions = await ctx.db.query.habitCompletions.findMany({
        where: eq(habitCompletions.completedDate, today),
      })

      // Create a map of habitId -> completion status
      return input.habitIds.map((id) =>
        completions.some((completion) => completion.habitId === id)
      )
    }),

  getBatchCompletionCounts: protectedProcedure
    .input(z.object({ habitIds: z.array(z.number()) }))
    .query(async ({ ctx, input }) => {
      const completions = await ctx.db.query.habitCompletions.findMany()

      // Create a map of habitId -> completion count
      return input.habitIds.map(
        (id) =>
          completions.filter((completion) => completion.habitId === id).length
      )
    }),

  checkReminders: protectedProcedure.mutation(async () => {
    const { checkAndSendHabitReminders } = await import('@/app/actions')
    const res = await checkAndSendHabitReminders(true) // Force check all reminders
    
    // Count how many reminders were actually sent
    const sentCount = res.success
      ? res.results.filter((result) => result.sent).length
      : 0
    
    // Count completed habits (these won't get reminders)
    const completedCount = res.results.filter((result) => 'completed' in result && result.completed).length
    
    return {
      success: res.success,
      sentCount,
      completedCount,
      totalHabits: res.results?.length || 0,
    }
  }),
})

export type Habit = InferSelectModel<typeof habits>
