## 1. Server Functions (Backend)

- [ ] 1.1 Add getCompletionHistory(startDate, endDate) to habits.ts (auth-scoped, returns habitId+date pairs from HabitCheck, max 90 days)
- [ ] 1.2 Add listHabitsWithTodayStatus() to habits.ts (or extend listHabits) returning habits with checkedToday: boolean per habit

## 2. Dashboard Route & Layout

- [ ] 2.1 Create dashboard route at src/routes/_authed/dashboard/index.tsx (or dashboard.route.tsx), path /dashboard
- [ ] 2.2 Add Dashboard link to root nav (alongside Home, Posts, Habits)
- [ ] 2.3 Create scrollable dashboard layout with three sections: Today, Heatmap, Category Rings

## 3. Today Section

- [ ] 3.1 Implement Today section component: fetch listHabitsWithTodayStatus via TanStack Query, render habit list with checked/unchecked indicator
- [ ] 3.2 Add check/uncheck buttons per habit calling checkHabit/uncheckHabit, invalidate queries on success for real-time sync
- [ ] 3.3 Exclude archived habits from Today list

## 4. Heatmap Section

- [ ] 4.1 Add getCompletionHistory Server Function integration; create useCompletionHistory hook or query for date range
- [ ] 4.2 Implement heatmap grid with TanStack Table (rows=habits, columns=dates), custom cell render for completed vs empty
- [ ] 4.3 Add week/month range selector (default week); refetch when range changes
- [ ] 4.4 Style heatmap cells: filled vs empty visually distinct; horizontal scroll on mobile

## 5. Category Rings Section

- [ ] 5.1 Group habits by category (Uncategorized for null); fetch getHabitStats per habit (or batch)
- [ ] 5.2 Compute aggregate completion rate per category (completions / expected days)
- [ ] 5.3 Create ProgressRing component (SVG circle or CSS conic-gradient) with category label
- [ ] 5.4 Render one ring per category; handle empty state (no habits or 0%)

## 6. Verify

- [ ] 6.1 Verify all spec scenarios: today at glance, check/uncheck, heatmap week/month, category rings
- [ ] 6.2 Confirm habit-crud is implemented first (prerequisite)
