## Context

The Habit Tracker uses TanStack Start, Prisma (libSQL/SQLite), and session-based auth. The `User` model uses `email` as the primary key. The `_authed` layout enforces auth via `context.user` from `fetchUser()`. Data is fetched via `createServerFn` (e.g. `posts.ts`), not standalone REST routes. This design adds habit CRUD and tracking while fitting that stack.

## Goals / Non-Goals

**Goals:**
- Implement habit entity (name, frequency, category) with full CRUD
- Persist habit completions per day; support same-session undo
- Compute streak and completion stats for each habit
- Expose operations via Server Functions aligned with REST semantics (for future OpenAPI generation)
- Scope all data to the authenticated user

**Non-Goals:**
- Dashboard, heatmap, or visualization UI (consumes this data; separate change)
- OpenAPI spec generation or Linear sync
- Custom frequency rules (e.g. "every 3 days"); only daily/weekly/custom as labels for now
- Multi-timezone or user timezone preference

## Decisions

### 1. Data Model

**Habit**
- `id` (cuid), `userEmail` (FK to User), `name`, `frequency` (enum: daily | weekly | custom), `category` (optional string), `archivedAt` (nullable DateTime for soft delete), `createdAt`
- `userEmail` links to `User.email` since User has no separate id.

**HabitCheck**
- `id` (cuid), `habitId` (FK), `date` (Date, stored as date string YYYY-MM-DD for SQLite), `createdAt`
- Unique on `(habitId, date)` to prevent double-checking.

**Alternatives considered:** Hard delete vs soft delete (archive). Chosen: soft delete (`archivedAt`) to support "archived" semantics from the PRD and possible restore.

### 2. API Surface (Server Functions)

Mirror REST semantics via `createServerFn`:
- `listHabits()` → GET /habits
- `createHabit(input)` → POST /habits
- `updateHabit(id, input)` → PATCH /habits/:id
- `archiveHabit(id)` → DELETE /habits/:id
- `checkHabit(id)` → POST /habits/:id/check
- `uncheckHabit(id)` → undo (DELETE today's check)
- `getHabitStats(id)` → GET /habits/:id/stats

All handlers resolve `userEmail` from `useAppSession()` and filter by it. Unauthorized or missing user returns error.

### 3. Undo (Same-Session)

**Chosen:** Allow `uncheckHabit(id)` which removes today's `HabitCheck` for that habit. No server-side "session" needed; the client calls uncheck when the user clicks undo. "Same session" is enforced by UX (undo only available after check), not by server state.

**Alternative:** In-memory "recent checks" with expiry. Rejected as unnecessary complexity; DB delete is sufficient.

### 4. Streak Computation

**Chosen:** Compute from `HabitCheck` records ordered by `date` desc. Streak = consecutive days ending today. Use **UTC date** for `date` to avoid timezone ambiguity for v1; user local time can be added later.

**Algorithm:** For each habit, get distinct check dates. Starting from today (or most recent check date), count backward while dates are consecutive. Return `{ streak, totalCompletions, completionRate }` where completion rate = completions / expected days (based on frequency, e.g. daily = days since creation).

### 5. File Structure

- `src/utils/habits.ts` — Server functions for habit operations
- `src/routes/_authed/habits/` — Habit routes (list, create, edit)
- Reuse existing `prismaClient`, `useAppSession`, `_authed` layout

## Risks / Trade-offs

| Risk | Mitigation |
|------|-------------|
| User has no numeric id; email as FK everywhere | Acceptable for this scale; migrations stay simple |
| UTC-only dates may confuse users in other timezones | Document; add timezone preference in a future change |
| Archive is soft delete; queries must filter `archivedAt` | Consistent `where: { archivedAt: null }` in list/update paths |
| Streak for "weekly" habits — definition ambiguous | v1: count weeks with ≥1 completion; refine in follow-up |

## Migration Plan

1. Add `Habit` and `HabitCheck` models to `schema.prisma`
2. Run `prisma migrate dev` to create migration
3. Implement Server Functions and routes
4. Deploy: standard TanStack Start build; no special rollback beyond DB migration revert if needed

## Open Questions

- None for initial implementation. Timezone and weekly-streak semantics can be refined after first release.
