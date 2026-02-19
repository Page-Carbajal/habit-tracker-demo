# Project Contract

Coding standards and best practices for the Habit Tracker app. All implementation must adhere to this contract.

**Stack:** TanStack (Router, Query, Table, Form) · React · TypeScript · Tailwind CSS · SQLite (Prisma + libSQL)

---

## TypeScript

- Use strict mode. Prefer explicit types for public APIs and function parameters.
- Prefer `interface` over `type` for object shapes; use `type` for unions and mapped types.
- Avoid `any`. Use `unknown` with type guards when the type is uncertain.
- Use `satisfies` for inferred types that must match a constraint (e.g. route params).
- Prefer `const` assertions for literal objects that should not be widened.
- Export types that are part of the public API; keep internal types colocated or in `.types.ts` files.
- Use branded types or branded IDs for domain identifiers to avoid mixing primitives.

```typescript
// ✅ GOOD
interface Habit {
  id: string;
  name: string;
  frequency: "daily" | "weekly" | "custom";
}

const config = { mode: "edit" } as const;

// ❌ BAD
const data: any = await fetch();
```

---

## TanStack Router

- Use file-based routing; keep route files colocated with their segments.
- Provide `validateSearch` for search params to enforce type safety and validation.
- Use `getRouteApi()` or route APIs for type-safe links and search params in child routes.
- Prefer search params for shareable state (filters, pagination, tab selection); avoid redundant localStorage when URL can represent state.
- Use `routeContext` for route-scoped context that children need.
- In loaders, preload data with `queryClient.ensureQueryData()` to avoid waterfalls during SSR/hydration.

```typescript
// ✅ GOOD
export const Route = createFileRoute("/habits/$habitId")({
  validateSearch: (search): { tab?: string } => ({
    tab: search.tab ?? "overview",
  }),
  loader: ({ params, context }) =>
    context.queryClient.ensureQueryData({
      queryKey: ["habit", params.habitId],
    }),
});
```

---

## TanStack Query

- Use `useSuspenseQuery` for critical above-the-fold data and SSR; `useQuery` for client-only or non-blocking.
- Structure `queryKey` as `[entity, id?, filter?]` arrays for predictable cache keys.
- Use `queryClient.setQueryData` / `invalidateQueries` for optimistic updates; keep mutations consistent with query keys.
- Prefer `mutationFn` that returns the updated entity; use `onMutate` / `onSettled` for rollback and invalidation.
- Avoid overlapping query keys that could cause unintended cache invalidation.
- Stale-while-revalidate: use `staleTime` for stable data; avoid unnecessary refetches on every mount.

```typescript
// ✅ GOOD
useSuspenseQuery({
  queryKey: ["habits", { userId }],
  queryFn: () => api.getHabits(userId),
  staleTime: 30_000,
});

useMutation({
  mutationFn: (habit: Habit) => api.updateHabit(habit.id, habit),
  onSuccess: (_, { id }) => {
    queryClient.invalidateQueries({ queryKey: ["habits"] });
    queryClient.invalidateQueries({ queryKey: ["habit", id] });
  },
});
```

---

## TanStack Table

- Use column definitions with typed `accessorKey` or `accessorFn` for type-safe cells.
- Enable `getCoreRowModel()`; add `getSortedRowModel`, `getFilteredRowModel` as needed.
- Prefer controlled state (e.g. from URL/search params) for sorting/filtering/pagination when shareable.
- Use `meta` on the table instance to pass custom callbacks (e.g. `onArchive`) instead of prop drilling.
- Memoize column definitions with `useMemo` when they depend on external values.

```typescript
// ✅ GOOD
const columns = useMemo<ColumnDef<Habit>[]>(
  () => [
    { accessorKey: "name", header: "Habit" },
    {
      accessorKey: "streak",
      header: "Streak",
      cell: ({ getValue }) => String(getValue()),
    },
  ],
  [],
);
```

---

## TanStack Form

- Use schema validation (e.g. Zod) via `validator` for form-level validation.
- Prefer `form.Field` for field-level validation and error display.
- Use `form.Subscribe` for derived values (e.g. disable submit when invalid).
- Keep form state minimal; avoid storing computed values that can be derived on submit.
- Use `form.reset()` after successful submission; handle server errors via `onError` or field-level messages.

```typescript
// ✅ GOOD
const form = useForm({
  defaultValues: { name: "", frequency: "daily" },
  validator: (val) => habitSchema.parse(val),
  onSubmit: async ({ value }) => {
    await createHabit(value);
  },
});
```

---

## Tailwind CSS

- Use Tailwind utility classes; avoid arbitrary values unless necessary. Prefer design tokens (e.g. `rounded-lg`, `space-4`).
- Use `@apply` sparingly, only for repeated component-level patterns (e.g. `.btn`).
- Prefer `tailwind-merge` with `cn()` for conditional class composition to avoid specificity conflicts.
- Use semantic color names from the palette (e.g. `text-muted-foreground`, `bg-primary`) instead of raw colors when themes exist.
- Keep responsive breakpoints consistent: `sm`, `md`, `lg`; use `container` classes for layout when appropriate.
- Avoid inline styles for layout; use utilities (`flex`, `grid`, `gap`).

```typescript
// ✅ GOOD
import { cn } from '@/lib/cn';

<div className={cn(
  'flex items-center gap-2 rounded-lg border p-4',
  isActive && 'border-primary bg-primary/5'
)} />
```

---

## SQLite (Prisma + libSQL)

- Use Prisma for schema and migrations; keep `schema.prisma` the single source of truth.
- Use `@unique` for natural keys (e.g. email); use `@id @default(cuid())` or `@default(uuid())` for surrogate IDs.
- Prefer `create`/`update`/`delete` for single-record ops; use `createMany`/`updateMany` only when batching improves performance.
- Use transactions for multi-step operations that must succeed or fail together.
- Use `select` to limit returned fields; avoid `findMany` without `select` when only a subset is needed.
- Use `include` for required relations; use separate queries or `findUnique` + `include` for optional relations to avoid N+1.
- For libSQL/Turso: ensure connection pooling and env vars (`DATABASE_URL`) are correctly set for server and edge runtimes.

```prisma
// ✅ GOOD
model Habit {
  id        String   @id @default(cuid())
  name      String
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  frequency String   // 'daily' | 'weekly' | 'custom'
  category  String?
  createdAt DateTime @default(now())
}
```

```typescript
// ✅ GOOD
await prisma.$transaction(async (tx) => {
  await tx.habitCheck.create({ data: { habitId, date } });
  await tx.habit.update({
    where: { id: habitId },
    data: { streak: { increment: 1 } },
  });
});
```

---

## General

- Prefer colocation: keep components, hooks, and types close to their usage.
- Use explicit error handling; avoid silent catches. Log and rethrow or return `Result`-style values when appropriate.
- Prefer REST conventions for the API: `GET` for reads, `POST` for create, `PATCH` for partial update, `DELETE` for archive/remove.
- Keep components focused; extract subcomponents or hooks when a file exceeds ~150 lines.
