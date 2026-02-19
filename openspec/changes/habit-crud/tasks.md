## 1. Database Schema

- [ ] 1.1 Add Habit and HabitCheck models to prisma/schema.prisma (userEmail, name, frequency, category, archivedAt; habitId, date with unique constraint)
- [ ] 1.2 Run prisma migrate dev and verify migration

## 2. Server Functions (Backend)

- [ ] 2.1 Create src/utils/habits.ts with listHabits, createHabit, updateHabit, archiveHabit (auth-scoped, use useAppSession)
- [ ] 2.2 Add checkHabit and uncheckHabit to habits.ts (UTC date, idempotent check, reject archived)
- [ ] 2.3 Add getHabitStats to habits.ts (streak, totalCompletions, completionRate)

## 3. Habit CRUD Routes (Frontend)

- [ ] 3.1 Add habits route layout and index (list habits, link to create)
- [ ] 3.2 Add create habit form (TanStack Form, name, frequency, category) and route
- [ ] 3.3 Add edit habit form and route (load habit by id, update)
- [ ] 3.4 Add archive habit action (confirm or inline, call archiveHabit)

## 4. Habit Tracking UI

- [ ] 4.1 Add check/uncheck button per habit on list (call checkHabit, uncheckHabit; optimistic update)
- [ ] 4.2 Add stats display per habit (streak, completion rate from getHabitStats)
- [ ] 4.3 Wire habits list to TanStack Query (useSuspenseQuery or useQuery for listHabits)

## 5. Navigation & Verify

- [ ] 5.1 Add Habits link to root nav (alongside Posts)
- [ ] 5.2 Verify all spec scenarios: list, create, update, archive, check, undo, stats
