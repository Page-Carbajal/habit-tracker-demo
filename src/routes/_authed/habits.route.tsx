import { Link, Outlet, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authed/habits')({
  component: HabitsLayout,
})

function HabitsLayout() {
  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Habits</h2>
        <Link
          to="/habits/create"
          className="rounded bg-blue-600 px-3 py-1 text-white hover:bg-blue-500"
        >
          Create Habit
        </Link>
      </div>
      <Outlet />
    </div>
  )
}
