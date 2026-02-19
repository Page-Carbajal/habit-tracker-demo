## Context

The dashboard consumes data from habit-crud (Habit, HabitCheck models; `listHabits`, `getHabitStats`, `checkHabit`, `uncheckHabit`). It lives under `_authed` and reuses TanStack Query, Router, and Table. The heatmap requires completion-by-date data; `getHabitStats` returns aggregates only, so we need a read-only Server Function to fetch completion history for a date range.

## Goals / Non-Goals

**Goals:**
- Single dashboard page with today's habits, heatmap, and category rings
- Real-time sync via TanStack Query; optimistic updates for check/uncheck
- Heatmap with week/month toggle; TanStack Table for grid
- Progress rings per category using aggregate completion rate

**Non-Goals:**
- Habit CRUD from dashboard (link to habits routes)
- Custom date ranges for heatmap (fixed week/month)
- Export or print views
- Mobile-specific layouts (responsive only)

## Decisions

### 1. Dashboard Layout

**Chosen:** Single scrollable page with three sections (top to bottom): Today's Habits, Heatmap, Category Progress Rings. No tabs or sub-routes.

**Alternative:** Tabs for each section. Rejected—single view better matches "at a glance" PRD intent.

### 2. Today's Habits Data

**Chosen:** Use `listHabits()` for habits; for "checked today" status, either (a) include in list response via a computed field, or (b) call `getHabitStats` per habit to derive. Prefer (a): extend `listHabits` or add `listHabitsWithTodayStatus()` that returns habits plus `checkedToday: boolean` per habit (query HabitCheck for today's date).

**Alternative:** Multiple `getHabitStats` calls. Rejected—N+1; one query is better.

### 3. Heatmap Data Source

**Chosen:** Add `getCompletionHistory(startDate, endDate)` to `habits.ts`. Returns `{ habitId, date }[]` (or a matrix) for all user habits in the range. Client builds grid from this. Uses existing HabitCheck table; auth-scoped via user's habits.

**Alternative:** Fetch `getHabitStats` per habit and try to infer dates. Rejected—stats don't expose raw dates.

### 4. Heatmap Grid (TanStack Table)

**Chosen:** TanStack Table with columns = dates (left-to-right, newest or oldest per UX choice), rows = habits. Cell component: filled if completed, empty if not. Use `meta` for custom render. Rows from `listHabits`, columns from date range; cell value from `getCompletionHistory` lookup.

**Alternative:** Plain grid (div/canvas). Rejected—Table gives sorting, future column toggles.

### 5. Category Rings

**Chosen:** Group habits by `category` (default "Uncategorized" if null). For each category, aggregate: sum completions across habits, sum expected-days (from habit creation + frequency). Completion rate = completions / expected. Render as SVG circle (or CSS conic-gradient) with stroke-dasharray for progress. Use `listHabits` + `getHabitStats` per habit (or batch if we add `getCategoryStats`); v1 acceptable to call stats per habit.

**Alternative:** New `getCategoryStats()` Server Function. Defer; per-habit stats sufficient for few habits.

### 6. Route Structure

**Chosen:** `src/routes/_authed/dashboard/index.tsx` (or `dashboard.route.tsx`). Route path `/dashboard`. Add Dashboard link to root nav.

## Risks / Trade-offs

| Risk | Mitigation |
|------|-------------|
| getCompletionHistory returns large payload for long ranges | Limit to 90 days max; paginate or lazy-load if needed later |
| Category rings: getHabitStats per habit = N calls | Accept for v1; add getCategoryStats or batch if N > ~20 |
| Heatmap columns overflow on mobile | Horizontal scroll; consider week-only default on small screens |
| Dashboard depends on habit-crud being implemented | Document dependency; implement after habit-crud |

## Migration Plan

1. Implement habit-crud first (prerequisite).
2. Add `getCompletionHistory` and optionally `listHabitsWithTodayStatus` to `habits.ts`.
3. Create dashboard route and components.
4. Add Dashboard to root nav.

No DB migrations; no rollback beyond reverting frontend.

## Open Questions

- Week vs month as default heatmap range? Suggest week for initial load, month on toggle.
