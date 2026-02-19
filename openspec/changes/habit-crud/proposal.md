## Why

The Habit Tracker app needs core habit management to let users define, maintain, and track habits. Without CRUD and completion flows, the dashboard and visualizations have no data to operate on. This establishes the foundation for the PRD's Habit Management feature.

## What Changes

- Add habit entity with name, frequency (daily / weekly / custom), and category.
- Implement full CRUD: create, list, update, archive habits.
- Add completion check for today with same-session undo.
- Add streak tracking and completion rate data (API + model support).
- REST endpoints: `GET/POST /habits`, `PATCH/DELETE /habits/:id`, `POST /habits/:id/check`, `GET /habits/:id/stats`.

## Capabilities

### New Capabilities

- `habit-crud`: Create, read, update, and archive habits. Habit model (name, frequency, category). List habits for the current user. REST: `GET/POST /habits`, `PATCH/DELETE /habits/:id`.
- `habit-tracking`: Mark habit complete for today; undo within same session. Streak computation and completion stats. REST: `POST /habits/:id/check`, `GET /habits/:id/stats`.

### Modified Capabilities

- *(none)*

## Impact

- **Database**: New Prisma models (Habit, HabitCheck or equivalent) and migrations.
- **API**: New habit routes and handlers; extend existing API router.
- **Frontend**: Habit list, create/edit forms (TanStack Form), completion UI. Dashboard and heatmap will consume this data but are out of scope for this change.
- **Auth**: Habits scoped to authenticated user (JWT); reuse `GET /users/me` pattern.
