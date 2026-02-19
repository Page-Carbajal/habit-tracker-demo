import { Link, createFileRoute, useRouter } from '@tanstack/react-router'
import * as React from 'react'
import {
  archiveHabit,
  checkHabit,
  getHabitStats,
  listHabits,
  uncheckHabit,
} from '~/utils/habits'

interface HabitStats {
  streak: number
  totalCompletions: number
  completionRate: number
}

export const Route = createFileRoute('/_authed/habits/')({
  loader: async () => {
    const habits = await listHabits()
    const statsByHabitId = await Promise.all(
      habits.map(async (habit) => {
        const stats = await getHabitStats({ data: habit.id })
        return [habit.id, stats] as const
      }),
    )

    return {
      habits,
      stats: Object.fromEntries(statsByHabitId),
    }
  },
  component: HabitsIndex,
})

function HabitsIndex() {
  const { habits, stats } = Route.useLoaderData()
  const router = useRouter()
  const [pendingByHabit, setPendingByHabit] = React.useState<
    Record<string, boolean>
  >({})
  const [checkedByHabit, setCheckedByHabit] = React.useState<Record<string, boolean>>(
    () =>
      Object.fromEntries(
        habits.map((habit) => [habit.id, (stats[habit.id]?.streak ?? 0) > 0]),
      ),
  )

  const mutateHabit = async (
    habitId: string,
    mutation: () => Promise<unknown>,
    nextChecked: boolean,
  ) => {
    setPendingByHabit((current) => ({ ...current, [habitId]: true }))
    const previousChecked = checkedByHabit[habitId]
    setCheckedByHabit((current) => ({ ...current, [habitId]: nextChecked }))

    try {
      await mutation()
      await router.invalidate()
    } catch {
      setCheckedByHabit((current) => ({ ...current, [habitId]: previousChecked }))
    } finally {
      setPendingByHabit((current) => ({ ...current, [habitId]: false }))
    }
  }

  if (habits.length === 0) {
    return <p className="text-sm text-gray-600">No habits yet. Create one to get started.</p>
  }

  return (
    <ul className="space-y-3">
      {habits.map((habit) => {
        const habitStats: HabitStats = stats[habit.id]
        const isChecked = checkedByHabit[habit.id] ?? false

        return (
          <li key={habit.id} className="rounded border p-3">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-semibold">{habit.name}</h3>
                <p className="text-sm text-gray-600">
                  {habit.frequency}
                  {habit.category ? ` · ${habit.category}` : ''}
                </p>
                <p className="mt-2 text-xs text-gray-500">
                  Streak: {habitStats?.streak ?? 0} · Total checks:{' '}
                  {habitStats?.totalCompletions ?? 0} · Completion rate:{' '}
                  {Math.round((habitStats?.completionRate ?? 0) * 100)}%
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  className="rounded border px-2 py-1 text-sm"
                  disabled={pendingByHabit[habit.id]}
                  onClick={() => {
                    if (isChecked) {
                      void mutateHabit(
                        habit.id,
                        () => uncheckHabit({ data: habit.id }),
                        false,
                      )
                      return
                    }

                    void mutateHabit(
                      habit.id,
                      () => checkHabit({ data: habit.id }),
                      true,
                    )
                  }}
                >
                  {isChecked ? 'Undo today' : 'Check today'}
                </button>
                <Link
                  to="/habits/$habitId/edit"
                  params={{ habitId: habit.id }}
                  className="rounded border px-2 py-1 text-sm"
                >
                  Edit
                </Link>
                <button
                  type="button"
                  className="rounded border border-red-300 px-2 py-1 text-sm text-red-600"
                  onClick={async () => {
                    if (!window.confirm('Archive this habit?')) {
                      return
                    }
                    await archiveHabit({ data: habit.id })
                    await router.invalidate()
                  }}
                >
                  Archive
                </button>
              </div>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
