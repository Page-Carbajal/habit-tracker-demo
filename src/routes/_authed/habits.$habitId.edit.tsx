import { createFileRoute, useNavigate } from '@tanstack/react-router'
import * as React from 'react'
import type { HabitFrequency } from '~/prisma-generated/client'
import { getHabit, updateHabit } from '~/utils/habits'

export const Route = createFileRoute('/_authed/habits/$habitId/edit')({
  loader: ({ params }) => getHabit({ data: params.habitId }),
  component: EditHabitPage,
})

function EditHabitPage() {
  const habit = Route.useLoaderData()
  const navigate = useNavigate()
  const [name, setName] = React.useState(habit.name)
  const [frequency, setFrequency] = React.useState<HabitFrequency>(habit.frequency)
  const [category, setCategory] = React.useState(habit.category ?? '')
  const [error, setError] = React.useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  return (
    <form
      className="max-w-md space-y-3"
      onSubmit={async (event) => {
        event.preventDefault()
        setError(null)
        setIsSubmitting(true)

        try {
          await updateHabit({
            data: {
              id: habit.id,
              name,
              frequency,
              category,
            },
          })

          await navigate({ to: '/habits' })
        } catch (submitError) {
          setError(submitError instanceof Error ? submitError.message : 'Unable to update habit')
        } finally {
          setIsSubmitting(false)
        }
      }}
    >
      <h3 className="text-lg font-semibold">Edit habit</h3>
      <label className="block text-sm">
        Name
        <input
          className="mt-1 w-full rounded border px-2 py-1"
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </label>
      <label className="block text-sm">
        Frequency
        <select
          className="mt-1 w-full rounded border px-2 py-1"
          value={frequency}
          onChange={(event) => setFrequency(event.target.value as HabitFrequency)}
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="custom">Custom</option>
        </select>
      </label>
      <label className="block text-sm">
        Category (optional)
        <input
          className="mt-1 w-full rounded border px-2 py-1"
          value={category}
          onChange={(event) => setCategory(event.target.value)}
        />
      </label>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <button
        type="submit"
        className="rounded bg-blue-600 px-3 py-1 text-white disabled:opacity-50"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Saving...' : 'Update'}
      </button>
    </form>
  )
}
