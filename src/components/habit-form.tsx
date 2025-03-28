'use client'

import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { TZDate } from '@date-fns/tz'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form'
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'

import { CustomInput } from './habit-input'
import { api } from '@/trpc/react'
import posthog from 'posthog-js'
import { type Habit } from '@/server/api/routers/habit'
import { cn } from '@/lib/utils'

const formSchema = z.object({
  what: z.string().min(1, 'This field is required'),
  when: z.string().min(1, 'This field is required'),
  why: z.string().min(1, 'This field is required'),
  reminderTime: z.string().optional(),
  reminderEnabled: z.boolean().default(false),
})

interface HabitFormProps {
  habit?: Habit & { isCompleted: boolean }
  onSuccess?: () => void
  onRevert?: () => void
}

export function HabitForm(props: HabitFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const utils = api.useUtils()

  const handleSuccess = async (action?: string) => {
    await utils.habit.invalidate()
    setIsSubmitting(false)

    const formValues = form.getValues()

    switch (action) {
      case 'create':
        toast({
          title: 'Habit created',
          description: `You will ${formValues.what} ${formValues.when} so that you can ${formValues.why}.`,
        })
        posthog.capture('new-habit-created', { values: formValues })
        break
      case 'update':
        toast({
          title: 'Habit updated',
          description: `Updated to: You will ${formValues.what} ${formValues.when} so that you can ${formValues.why}.`,
        })
        posthog.capture('habit-updated', { values: formValues })
        break
      case 'delete':
        toast({
          title: 'Habit deleted',
          description: 'Your habit has been deleted.',
        })
        break
      case 'revert':
        toast({
          title: 'Completion reverted',
          description: 'Your habit completion has been reverted for today.',
        })
        break
    }

    props.onSuccess?.()
  }

  // Cast the input to enforce type compatibility
  const createHabit = api.habit.create.useMutation({
    onSuccess: () => handleSuccess('create'),
  })

  const updateHabit = api.habit.update.useMutation({
    onSuccess: () => handleSuccess('update'),
  })

  const deleteHabit = api.habit.delete.useMutation({
    onSuccess: () => handleSuccess('delete'),
  })

  const revertCompletion = api.habit.revertCompletion.useMutation({
    onSuccess: () => handleSuccess('revert'),
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      what: props.habit?.what ?? '',
      when: props.habit?.when ?? '',
      why: props.habit?.why ?? '',
      reminderTime: props.habit?.reminderTime ?? '',
      reminderEnabled: props.habit?.reminderEnabled ?? false,
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    // For update mutation
    if (props.habit) {
      updateHabit.mutate({
        id: props.habit.id,
        what: values.what,
        when: values.when,
        why: values.why,
        reminderTime: values.reminderTime,
        reminderEnabled: Boolean(values.reminderEnabled),
      })
    } else {
      // For create mutation
      createHabit.mutate({
        what: values.what,
        when: values.when,
        why: values.why,
        reminderTime: values.reminderTime,
        reminderEnabled: Boolean(values.reminderEnabled),
      })
    }
  }

  return (
    <Card
      className={cn(
        'mx-auto w-full max-w-md',
        props.habit
          ? 'border-none bg-transparent shadow-none outline-hidden'
          : 'bg-base'
      )}
    >
      <CardHeader></CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <div className="flex w-full items-center space-x-2">
              <p className="whitespace-nowrap">I will</p>

              <FormField
                control={form.control}
                name="what"
                render={({ field }) => (
                  <FormItem className="grow">
                    <FormControl>
                      <CustomInput
                        {...field}
                        className={cn(
                          'w-full',
                          props.habit && 'bg-transparent'
                        )}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex w-full items-center space-x-2">
              <FormField
                control={form.control}
                name="when"
                render={({ field }) => (
                  <FormItem className="grow">
                    <FormControl>
                      <CustomInput
                        {...field}
                        className={cn(
                          'w-full',
                          props.habit && 'bg-transparent'
                        )}
                        placeholder=""
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <p className="whitespace-nowrap">so that</p>
            </div>
            <div className="flex w-full items-center space-x-2">
              <p className="whitespace-nowrap">I can</p>

              <FormField
                control={form.control}
                name="why"
                render={({ field }) => (
                  <FormItem className="grow">
                    <FormControl>
                      <CustomInput
                        {...field}
                        className={cn(
                          'w-full',
                          props.habit && 'bg-transparent'
                        )}
                        placeholder=""
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Separator className="my-2" />
            <div className="flex flex-col space-y-2 pb-2">
              <h3 className="text-sm font-medium">Reminder Settings</h3>
              <div className="flex items-center justify-between">
                <FormField
                  control={form.control}
                  name="reminderEnabled"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300 text-blue-600"
                          checked={field.value}
                          onChange={field.onChange}
                          id="reminderEnabled"
                        />
                      </FormControl>
                      <label
                        htmlFor="reminderEnabled"
                        className="text-sm font-medium"
                      >
                        Enable daily reminder
                      </label>
                    </FormItem>
                  )}
                />
              </div>
              {form.watch('reminderEnabled') && (
                <FormField
                  control={form.control}
                  name="reminderTime"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center space-x-2">
                        <label
                          htmlFor="reminderTime"
                          className="text-sm font-medium"
                        >
                          Remind me at:
                        </label>
                        <FormControl>
                          <input
                            type="time"
                            id="reminderTime"
                            className="rounded-md border border-gray-300 px-2 py-1"
                            value={field.value}
                            onChange={field.onChange}
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>
            <Separator />
            <CardFooter className="flex flex-col gap-4 px-0">
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>{props.habit ? 'Updating' : 'Creating'} Habit...</>
                ) : props.habit ? (
                  'Update Habit'
                ) : (
                  'Create Habit'
                )}
              </Button>

              {props.habit?.isCompleted && (
                <Button
                  type="button"
                  variant="secondary"
                  className="w-full"
                  onClick={() => {
                    if (props.habit) {
                      revertCompletion.mutate({ habitId: props.habit.id })
                      posthog.capture('habit-completion-reverted', {
                        habitId: props.habit.id,
                      })
                      props.onRevert?.()
                    }
                  }}
                >
                  Revert Today&apos;s Completion
                </Button>
              )}
              {props.habit && (
                <Button
                  type="button"
                  variant="destructive"
                  className="w-full"
                  onClick={() => {
                    if (props.habit) {
                      deleteHabit.mutate({ id: props.habit.id })
                      posthog.capture('habit-deleted', {
                        habitId: props.habit.id,
                      })
                    }
                  }}
                >
                  Delete Habit
                </Button>
              )}
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
