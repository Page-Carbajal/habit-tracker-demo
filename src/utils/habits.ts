import { createServerFn } from '@tanstack/react-start'
import { prismaClient } from '~/utils/prisma'
import { useAppSession } from '~/utils/session'
import type { Habit, HabitCheck, HabitFrequency } from '~/prisma-generated/client'

interface HabitInput {
  name: string
  frequency: HabitFrequency
  category?: string | null
}

interface HabitUpdateInput extends HabitInput {
  id: string
}

interface HabitStats {
  streak: number
  totalCompletions: number
  completionRate: number
}

const validFrequencies: HabitFrequency[] = ['daily', 'weekly', 'custom']

function requireUserEmail(sessionData: { userEmail?: string }): string {
  if (!sessionData.userEmail) {
    throw new Error('Unauthorized')
  }

  return sessionData.userEmail
}

function validateHabitInput(input: HabitInput): HabitInput {
  const name = input.name.trim()

  if (!name) {
    throw new Error('Habit name is required')
  }

  if (!validFrequencies.includes(input.frequency)) {
    throw new Error('Invalid habit frequency')
  }

  return {
    ...input,
    name,
    category: input.category?.trim() || null,
  }
}

async function loadOwnedHabit({ id, userEmail }: { id: string; userEmail: string }) {
  const habit = await prismaClient.habit.findUnique({
    where: { id },
  })

  if (!habit || habit.userEmail !== userEmail) {
    throw new Error('Habit not found')
  }

  return habit
}

function getTodayUtcDate(): string {
  return new Date().toISOString().slice(0, 10)
}

function dateStringToUtcMs(date: string): number {
  return new Date(`${date}T00:00:00.000Z`).getTime()
}

function calculateStreak(checks: HabitCheck[]): number {
  if (checks.length === 0) {
    return 0
  }

  const sortedDates = checks
    .map((check) => check.date)
    .sort((a, b) => dateStringToUtcMs(b) - dateStringToUtcMs(a))

  const today = getTodayUtcDate()
  if (sortedDates[0] !== today) {
    return 0
  }

  let streak = 1

  for (let index = 1; index < sortedDates.length; index += 1) {
    const previousMs = dateStringToUtcMs(sortedDates[index - 1])
    const currentMs = dateStringToUtcMs(sortedDates[index])
    const dayDifference = (previousMs - currentMs) / 86_400_000

    if (dayDifference === 1) {
      streak += 1
      continue
    }

    if (dayDifference === 0) {
      continue
    }

    break
  }

  return streak
}

function calculateCompletionRate(habit: Habit, totalCompletions: number): number {
  const createdAt = new Date(habit.createdAt)
  const now = new Date()
  const elapsedMs = Math.max(now.getTime() - createdAt.getTime(), 0)
  const elapsedDays = Math.floor(elapsedMs / 86_400_000) + 1

  if (habit.frequency === 'weekly') {
    const expectedWeeks = Math.max(Math.ceil(elapsedDays / 7), 1)
    return Math.min(totalCompletions / expectedWeeks, 1)
  }

  const expectedDays = Math.max(elapsedDays, 1)
  return Math.min(totalCompletions / expectedDays, 1)
}

export const listHabits = createServerFn({ method: 'GET' }).handler(async () => {
  const session = await useAppSession()
  const userEmail = requireUserEmail(session.data)

  return prismaClient.habit.findMany({
    where: {
      userEmail,
      archivedAt: null,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })
})

export const createHabit = createServerFn({ method: 'POST' })
  .inputValidator((input: HabitInput) => input)
  .handler(async ({ data }) => {
    const session = await useAppSession()
    const userEmail = requireUserEmail(session.data)
    const validatedInput = validateHabitInput(data)

    return prismaClient.habit.create({
      data: {
        userEmail,
        name: validatedInput.name,
        frequency: validatedInput.frequency,
        category: validatedInput.category,
      },
    })
  })

export const updateHabit = createServerFn({ method: 'POST' })
  .inputValidator((input: HabitUpdateInput) => input)
  .handler(async ({ data }) => {
    const session = await useAppSession()
    const userEmail = requireUserEmail(session.data)
    const habit = await loadOwnedHabit({ id: data.id, userEmail })

    if (habit.archivedAt) {
      throw new Error('Archived habits cannot be updated')
    }

    const validatedInput = validateHabitInput(data)

    return prismaClient.habit.update({
      where: { id: data.id },
      data: {
        name: validatedInput.name,
        frequency: validatedInput.frequency,
        category: validatedInput.category,
      },
    })
  })

export const archiveHabit = createServerFn({ method: 'POST' })
  .inputValidator((habitId: string) => habitId)
  .handler(async ({ data }) => {
    const session = await useAppSession()
    const userEmail = requireUserEmail(session.data)
    const habit = await loadOwnedHabit({ id: data, userEmail })

    if (habit.archivedAt) {
      return habit
    }

    return prismaClient.habit.update({
      where: { id: data },
      data: {
        archivedAt: new Date(),
      },
    })
  })

export const checkHabit = createServerFn({ method: 'POST' })
  .inputValidator((habitId: string) => habitId)
  .handler(async ({ data }) => {
    const session = await useAppSession()
    const userEmail = requireUserEmail(session.data)
    const habit = await loadOwnedHabit({ id: data, userEmail })

    if (habit.archivedAt) {
      throw new Error('Archived habits cannot be checked')
    }

    const todayUtc = getTodayUtcDate()

    const existingCheck = await prismaClient.habitCheck.findUnique({
      where: {
        habitId_date: {
          habitId: data,
          date: todayUtc,
        },
      },
    })

    if (existingCheck) {
      return existingCheck
    }

    return prismaClient.habitCheck.create({
      data: {
        habitId: data,
        date: todayUtc,
      },
    })
  })

export const uncheckHabit = createServerFn({ method: 'POST' })
  .inputValidator((habitId: string) => habitId)
  .handler(async ({ data }) => {
    const session = await useAppSession()
    const userEmail = requireUserEmail(session.data)
    await loadOwnedHabit({ id: data, userEmail })

    const todayUtc = getTodayUtcDate()

    await prismaClient.habitCheck.deleteMany({
      where: {
        habitId: data,
        date: todayUtc,
      },
    })

    return { success: true }
  })


export const getHabit = createServerFn({ method: 'GET' })
  .inputValidator((habitId: string) => habitId)
  .handler(async ({ data }) => {
    const session = await useAppSession()
    const userEmail = requireUserEmail(session.data)
    const habit = await loadOwnedHabit({ id: data, userEmail })

    return habit
  })

export const getHabitStats = createServerFn({ method: 'GET' })
  .inputValidator((habitId: string) => habitId)
  .handler(async ({ data }) => {
    const session = await useAppSession()
    const userEmail = requireUserEmail(session.data)
    const habit = await loadOwnedHabit({ id: data, userEmail })

    const checks = await prismaClient.habitCheck.findMany({
      where: {
        habitId: data,
      },
      orderBy: {
        date: 'desc',
      },
    })

    const totalCompletions = checks.length
    const stats: HabitStats = {
      streak: calculateStreak(checks),
      totalCompletions,
      completionRate: calculateCompletionRate(habit, totalCompletions),
    }

    return stats
  })
