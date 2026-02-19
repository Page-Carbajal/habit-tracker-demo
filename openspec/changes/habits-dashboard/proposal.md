## Why

The PRD's Dashboard feature gives users a unified view of habit progress. Without it, users only see a flat habit list. The dashboard surfaces today's habits at a glance, historical completion patterns (heatmap), and category-level progress—enabling faster decision-making and motivation.

## What Changes

- Add a dedicated dashboard route showing today's habits with real-time sync via TanStack Query.
- Add weekly/monthly heatmap visualizing completion history (TanStack Table as data grid).
- Add progress rings per habit category (completion rate per category).
- Consume existing habit and completion data from habit-crud; no new API endpoints required.

## Capabilities

### New Capabilities

- `dashboard-today`: Today's habits at a glance. List habits due today with completion status, check/uncheck inline. TanStack Query for real-time sync. Auth-scoped.
- `dashboard-heatmap`: Weekly/monthly heatmap showing completion history. TanStack Table for grid layout. Date range selector (week/month). Cells indicate completed vs missed per habit/date.
- `dashboard-category-rings`: Progress rings per habit category. Aggregate completion rate by category. Visual ring/circle component per category.

### Modified Capabilities

- *(none)*

## Impact

- **Frontend**: New dashboard route(s) under `_authed`; TanStack Query for today's data; TanStack Table for heatmap; new UI components (rings, heatmap cells).
- **Data**: Reads from existing `listHabits`, `getHabitStats`, and completion data—no backend changes.
- **Navigation**: Add Dashboard link to root nav; may become default/home for authenticated users.
