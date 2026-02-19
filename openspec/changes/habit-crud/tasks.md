## 1. Database Schema

- [x] 1.1 Add Habit and HabitCheck models to prisma/schema.prisma (userEmail, name, frequency, category, archivedAt; habitId, date with unique constraint)
- [x] 1.2 Run prisma migrate dev and verify migration

## 2. Server Functions (Backend)

- [x] 2.1 Create src/utils/habits.ts with listHabits, createHabit, updateHabit, archiveHabit (auth-scoped, use useAppSession)
- [x] 2.2 Add checkHabit and uncheckHabit to habits.ts (UTC date, idempotent check, reject archived)
- [x] 2.3 Add getHabitStats to habits.ts (streak, totalCompletions, completionRate)

## 3. Habit CRUD Routes (Frontend)

- [x] 3.1 Add habits route layout and index (list habits, link to create)
- [x] 3.2 Add create habit form (TanStack Form, name, frequency, category) and route
- [x] 3.3 Add edit habit form and route (load habit by id, update)
- [x] 3.4 Add archive habit action (confirm or inline, call archiveHabit)

## 4. Habit Tracking UI

- [x] 4.1 Add check/uncheck button per habit on list (call checkHabit, uncheckHabit; optimistic update)
- [x] 4.2 Add stats display per habit (streak, completion rate from getHabitStats)
- [x] 4.3 Wire habits list to TanStack Query (useSuspenseQuery or useQuery for listHabits)

## 5. Navigation & Verify

- [x] 5.1 Add Habits link to root nav (alongside Posts)
- [x] 5.2 Verify all spec scenarios: list, create, update, archive, check, undo, stats
