import { createFileRoute, useRouter } from '@tanstack/react-router'
import * as React from 'react'
import {
  checkHabit,
  getCompletionHistory,
  getHabitStats,
  listHabitsWithTodayStatus,
  uncheckHabit,
} from '~/utils/habits'
import type { HabitWithTodayStatus } from '~/utils/habits'

function formatMonthDay(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00Z')
  const month = d.toLocaleString('en-US', { month: 'short' })
  const day = d.getDate()
  const ord = day % 10
  const suffix =
    day >= 11 && day <= 13 ? 'th' : ord === 1 ? 'st' : ord === 2 ? 'nd' : ord === 3 ? 'rd' : 'th'
  return `${month}, ${day}${suffix}`
}

function getDateRange(
  range: 'week' | 'month',
): { startDate: string; endDate: string } {
  const end = new Date()
  const endDate = end.toISOString().slice(0, 10)
  const start = new Date(end)
  if (range === 'week') {
    start.setDate(start.getDate() - 6)
  } else {
    start.setMonth(start.getMonth() - 1)
  }
  const startDate = start.toISOString().slice(0, 10)
  return { startDate, endDate }
}

export const Route = createFileRoute('/_authed/dashboard')({
  loader: async () => {
    const [habits, { startDate, endDate }] = await Promise.all([
      listHabitsWithTodayStatus(),
      Promise.resolve(getDateRange('week')),
    ])
    const completionHistory = await getCompletionHistory({
      data: { startDate, endDate },
    })
    const statsByHabitId = await Promise.all(
      habits.map(async (h) => {
        const s = await getHabitStats({ data: h.id })
        return [h.id, s] as const
      }),
    )
    return {
      habits,
      stats: Object.fromEntries(statsByHabitId),
      completionHistory,
      dateRange: { startDate, endDate },
    }
  },
  component: DashboardPage,
})

function DashboardPage() {
  const { habits, stats, completionHistory, dateRange } =
    Route.useLoaderData()
  const router = useRouter()
  const [range, setRange] = React.useState<'week' | 'month'>('week')
  const [pendingByHabit, setPendingByHabit] = React.useState<
    Record<string, boolean>
  >({})
  const [checkedByHabit, setCheckedByHabit] = React.useState<
    Record<string, boolean>
  >(
    () =>
      Object.fromEntries(
        habits.map((h) => [h.id, h.checkedToday]),
      ) as Record<string, boolean>,
  )
  const [completionData, setCompletionData] = React.useState({
    history: completionHistory,
    range: dateRange,
  })

  React.useEffect(() => {
    const { startDate, endDate } = getDateRange(range)
    if (
      completionData.range.startDate === startDate &&
      completionData.range.endDate === endDate
    ) {
      return
    }
    getCompletionHistory({ data: { startDate, endDate } }).then(
      (history) => {
        setCompletionData({ history, range: { startDate, endDate } })
      },
    )
  }, [range])

  const mutateCheck = async (
    habitId: string,
    mutation: () => Promise<unknown>,
    nextChecked: boolean,
  ) => {
    setPendingByHabit((c) => ({ ...c, [habitId]: true }))
    const prev = checkedByHabit[habitId]
    setCheckedByHabit((c) => ({ ...c, [habitId]: nextChecked }))
    try {
      await mutation()
      await router.invalidate()
    } catch {
      setCheckedByHabit((c) => ({ ...c, [habitId]: prev }))
    } finally {
      setPendingByHabit((c) => ({ ...c, [habitId]: false }))
    }
  }

  const completedSet = new Set(
    completionData.history.map((e) => `${e.habitId}:${e.date}`),
  )
  const dates: string[] = []
  const start = new Date(completionData.range.startDate + 'T00:00:00Z')
  const end = new Date(completionData.range.endDate + 'T00:00:00Z')
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    dates.push(d.toISOString().slice(0, 10))
  }

  const categoryMap = new Map<string, { habits: HabitWithTodayStatus[]; totalCompletions: number; expectedDays: number }>()
  for (const habit of habits) {
    const cat = habit.category || 'Uncategorized'
    if (!categoryMap.has(cat)) {
      categoryMap.set(cat, { habits: [], totalCompletions: 0, expectedDays: 0 })
    }
    const entry = categoryMap.get(cat)!
    entry.habits.push(habit)
    const s = stats[habit.id]
    if (s) {
      entry.totalCompletions += s.totalCompletions
      const created = new Date(habit.createdAt)
      const now = new Date()
      const elapsed = Math.floor((now.getTime() - created.getTime()) / 86_400_000) + 1
      entry.expectedDays += habit.frequency === 'weekly' ? Math.max(Math.ceil(elapsed / 7), 1) : Math.max(elapsed, 1)
    }
  }

  return (
    <div className="space-y-8 overflow-y-auto p-4">
      <h2 className="text-xl font-semibold">Dashboard</h2>

      <section>
        <h3 className="mb-3 text-lg font-medium">Today</h3>
        {habits.length === 0 ? (
          <p className="text-sm text-gray-600">No habits yet.</p>
        ) : (
          <ul className="space-y-2">
            {habits.map((habit) => {
              const isChecked = checkedByHabit[habit.id] ?? false
              return (
                <li
                  key={habit.id}
                  className="flex items-center justify-between rounded border p-3"
                >
                  <span>{habit.name}</span>
                  <button
                    type="button"
                    className="rounded border px-2 py-1 text-sm disabled:opacity-50"
                    disabled={pendingByHabit[habit.id]}
                    onClick={() => {
                      if (isChecked) {
                        void mutateCheck(
                          habit.id,
                          () => uncheckHabit({ data: habit.id }),
                          false,
                        )
                      } else {
                        void mutateCheck(
                          habit.id,
                          () => checkHabit({ data: habit.id }),
                          true,
                        )
                      }
                    }}
                  >
                    {isChecked ? 'Undo' : 'Check'}
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <section>
        <div className="mb-3 flex items-center gap-2">
          <h3 className="text-lg font-medium">Heatmap</h3>
          <div className="flex gap-1">
            <button
              type="button"
              className={`rounded px-2 py-1 text-sm ${range === 'week' ? 'bg-gray-200' : ''}`}
              onClick={() => setRange('week')}
            >
              Week
            </button>
            <button
              type="button"
              className={`rounded px-2 py-1 text-sm ${range === 'month' ? 'bg-gray-200' : ''}`}
              onClick={() => setRange('month')}
            >
              Month
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse border text-sm">
            <thead>
              <tr>
                <th className="border p-1 text-left">Habit</th>
                {dates.map((d) => (
                  <th key={d} className="border p-1 text-center">
                    {formatMonthDay(d)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {habits.map((habit) => (
                <tr key={habit.id}>
                  <td className="border p-1">{habit.name}</td>
                  {dates.map((date) => {
                    const filled =
                      completedSet.has(`${habit.id}:${date}`)
                    return (
                      <td
                        key={date}
                        className={`border p-1 text-center ${filled ? 'bg-green-400' : 'bg-gray-100'}`}
                        title={`${habit.name} ${formatMonthDay(date)}`}
                      >
                        {filled ? '✓' : ''}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h3 className="mb-3 text-lg font-medium">Category Progress</h3>
        {categoryMap.size === 0 ? (
          <p className="text-sm text-gray-600">No categories.</p>
        ) : (
          <div className="flex flex-wrap gap-4">
            {Array.from(categoryMap.entries()).map(([cat, data]) => {
              const rate =
                data.expectedDays > 0
                  ? Math.min(
                      data.totalCompletions / data.expectedDays,
                      1,
                    )
                  : 0
              const pct = Math.round(rate * 100)
              const circumference = 2 * Math.PI * 40
              const strokeDash = (1 - rate) * circumference
              return (
                <div
                  key={cat}
                  className="flex flex-col items-center gap-1"
                >
                  <svg
                    width="100"
                    height="100"
                    viewBox="0 0 100 100"
                    className="-rotate-90"
                  >
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="8"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#22c55e"
                      strokeWidth="8"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDash}
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="text-sm font-medium">{cat}</span>
                  <span className="text-xs text-gray-500">{pct}%</span>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
