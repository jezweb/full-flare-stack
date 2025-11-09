# Architecture Quick Reference

Fast lookup guide for component placement, patterns, and common tasks.

---

## 🎯 Where Does This Go?

### Component Placement Decision Tree

```
❓ What am I building?

└─ 🎨 UI Building Block (Button, Input, Card)
   → /components/ui/
   
└─ 🔄 Reusable UI Pattern (no business logic, used 3+ times)
   → /components/composed/[category]/
   
└─ 🏢 Feature with Business Logic (CRUD, auth, data)
   → /modules/[feature]/
   
└─ 🔧 One-off Component
   → /components/shared/ or inline
```

---

## 📂 Directory Structure

```
src/
├── app/                      # Next.js routes
├── components/
│   ├── ui/                   # shadcn primitives
│   ├── composed/             # YOUR reusable patterns
│   │   ├── data-display/
│   │   ├── layouts/
│   │   ├── forms/
│   │   ├── feedback/
│   │   └── media/
│   └── shared/               # One-offs
├── modules/                  # Features with business logic
│   └── [feature]/
│       ├── actions/
│       ├── components/
│       ├── hooks/
│       ├── models/
│       └── schemas/
├── db/                       # Database
├── lib/                      # Shared utilities
└── services/                 # Business services
```

---

## 🚦 Component Rules

| Layer | Location | Business Logic? | Database? | Reused? |
|-------|----------|----------------|-----------|---------|
| **Primitives** | `/components/ui/` | ❌ | ❌ | ✅ Everywhere |
| **Patterns** | `/components/composed/` | ❌ | ❌ | ✅ 3+ features |
| **Features** | `/modules/[feature]/` | ✅ | ✅ | ❌ Feature-specific |
| **Shared** | `/components/shared/` | ❌ | ❌ | ❌ 1-2 uses |

---

## 🛠️ Common Tasks

### Create a New Feature Module

```bash
# 1. Create directory structure
mkdir -p src/modules/[feature]/{actions,components,hooks,models,schemas}

# 2. Add database schema in src/db/schema.ts
# 3. Generate migration
pnpm run db:generate:named "add_[feature]_table"

# 4. Apply migration
pnpm run db:migrate:local

# 5. Create files:
# - models/[entity].ts (TypeScript types)
# - schemas/[entity].schema.ts (Zod validation)
# - actions/create-[entity].ts (Server Action)
# - components/[Entity]List.tsx (UI)
```

### Create a Reusable Pattern

```bash
# 1. Identify the pattern (used 3+ times?)
# 2. Choose category:
#    - data-display (tables, cards, lists)
#    - layouts (headers, sidebars)
#    - forms (multi-step, fields)
#    - feedback (empty, loading, errors)
#    - media (uploads, galleries)

# 3. Create component
touch src/components/composed/[category]/[Pattern].tsx

# 4. Make it generic (props-based, no business logic)
# 5. Document usage
# 6. Use in features
```

### Add Database Table

```typescript
// In src/db/schema.ts
export const myTable = sqliteTable('my_table', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  name: text('name').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
});

export type MyEntity = typeof myTable.$inferSelect;
export type NewMyEntity = typeof myTable.$inferInsert;
```

```bash
# Generate and apply
pnpm run db:generate:named "add_my_table"
pnpm run db:migrate:local
```

### Create Server Action

```typescript
'use server';

import { db } from '@/db';
import { auth } from '@/lib/auth';
import { mySchema } from '../schemas/my.schema';
import { revalidatePath } from 'next/cache';

export async function myAction(input: MyInput) {
  try {
    // 1. Auth
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: 'Unauthorized' };
    }

    // 2. Validate
    const validated = mySchema.parse(input);

    // 3. Database operation
    const result = await db.insert(myTable).values(validated).returning();

    // 4. Revalidate
    revalidatePath('/path');

    // 5. Return
    return { success: true, data: result };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed' 
    };
  }
}
```

---

## 🎨 Pattern Priority List

Build in this order as you need them:

1. **DataTable** - sortable, filterable tables
2. **PageHeader** - title + actions + breadcrumbs  
3. **EmptyState** - no data messaging
4. **LoadingState** - skeleton loaders
5. **FormField** - label + input + error
6. **FileUpload** - drag-drop with R2
7. **CardView** - grid display
8. **ListView** - mobile-friendly lists
9. **ViewSwitcher** - toggle between views
10. **ConfirmDialog** - delete confirmations

---

## 🔍 Decision Flowcharts

### "Should I Extract This to a Pattern?"

```
Does it have business logic?
├─ YES → Keep in module
└─ NO → Continue
    ↓
    Used in 3+ features?
    ├─ YES → Extract to /components/composed/
    ├─ USED TWICE → Wait for 3rd use
    └─ USED ONCE → Keep in module or /components/shared/
```

### "Is This Client or Server Component?"

```
Does it need:
- useState/useEffect/event handlers
- Browser APIs
- Interactive form controls
├─ YES → 'use client'
└─ NO → Server Component (default)
```

### "Where Should This Type Live?"

```
Database schema type?
├─ YES → Export from /db/schema.ts
└─ NO → Continue
    ↓
    Feature-specific?
    ├─ YES → /modules/[feature]/models/
    └─ NO → Continue
        ↓
        Pattern-related?
        └─ YES → In the pattern file or /lib/types.ts
```

---

## 📝 Code Snippets

### Server Action Response Type

```typescript
type ActionResponse<T = unknown> = 
  | { success: true; data: T; error?: never }
  | { success: false; data?: never; error: string };
```

### Zod Schema Pattern

```typescript
import { z } from 'zod';

export const mySchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  age: z.number().min(0).optional(),
});

export type MyInput = z.infer<typeof mySchema>;
```

### React Hook Form Integration

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const form = useForm<MyInput>({
  resolver: zodResolver(mySchema),
  defaultValues: { name: '', email: '' },
});
```

### Server Component with Suspense

```typescript
export async function MyList() {
  const result = await getItems();
  
  if (!result.success) {
    return <ErrorState error={result.error} />;
  }
  
  return <DataTable data={result.data} />;
}

// Wrap with Suspense
export function MyListWithSuspense() {
  return (
    <Suspense fallback={<LoadingState />}>
      <MyList />
    </Suspense>
  );
}
```

### Optimistic Updates

```typescript
'use client';

import { useOptimistic } from 'react';

export function MyComponent({ items }) {
  const [optimistic, addOptimistic] = useOptimistic(
    items,
    (state, newItem) => [...state, newItem]
  );

  const handleAdd = async (data) => {
    addOptimistic(data); // Instant UI update
    await createItem(data); // Actual mutation
  };

  return <List items={optimistic} onAdd={handleAdd} />;
}
```

---

## 🚨 Common Mistakes

### ❌ Pattern with Business Logic

```typescript
// ❌ BAD - pattern directly accessing database
export function UserTable() {
  const users = await db.select().from(users); // ❌ NO!
  return <DataTable data={users} />;
}
```

```typescript
// ✅ GOOD - pattern receives data via props
export function DataTable({ data, columns }) {
  return <table>...</table>;
}

// Feature component handles data
export async function UserTable() {
  const result = await getUsers(); // ✅ Server Action
  return <DataTable data={result.data} />;
}
```

### ❌ Module Importing from Another Module

```typescript
// ❌ BAD - circular dependencies
import { getUserById } from '@/modules/users/actions';

export async function getOrder(id: string) {
  const order = await db.select()...;
  const user = await getUserById(order.userId); // ❌ Cross-module
  return { order, user };
}
```

```typescript
// ✅ GOOD - use database joins or services
export async function getOrder(id: string) {
  const result = await db
    .select()
    .from(orders)
    .leftJoin(users, eq(orders.userId, users.id)) // ✅ Join at DB level
    .where(eq(orders.id, id));
  
  return result;
}
```

### ❌ Forgetting to Revalidate

```typescript
// ❌ BAD - no revalidation after mutation
export async function createItem(data) {
  await db.insert(items).values(data);
  return { success: true }; // ❌ Page won't update!
}
```

```typescript
// ✅ GOOD - revalidate affected paths
import { revalidatePath } from 'next/cache';

export async function createItem(data) {
  await db.insert(items).values(data);
  revalidatePath('/items'); // ✅ Refresh the page
  return { success: true };
}
```

---

## 📚 Key Files Reference

| Purpose | File Location |
|---------|--------------|
| Database schemas | `/db/schema.ts` |
| Database connection | `/db/index.ts` |
| Auth configuration | `/lib/auth.ts` |
| Global styles | `/app/globals.css` |
| Cloudflare config | `wrangler.jsonc` |
| Environment vars (local) | `.dev.vars` |
| Dependencies | `package.json` |

---

## 🔧 Useful Commands

```bash
# Development
pnpm run dev                    # Next.js with HMR
pnpm run wrangler:dev          # Wrangler (D1 access)
pnpm run dev:cf                # Combined (no HMR)

# Database
pnpm run db:generate           # Generate migration
pnpm run db:generate:named "name"  # Named migration
pnpm run db:migrate:local      # Apply to local
pnpm run db:migrate:prod       # Apply to production
pnpm run db:studio:local       # Open Drizzle Studio
pnpm run db:inspect:local      # Inspect schema

# Deployment
pnpm run build:cf              # Build for Cloudflare
pnpm run deploy                # Deploy to production
pnpm run cf-typegen            # Generate CF types

# Cloudflare
pnpm run cf:secret             # Add secret
wrangler r2 bucket create name # Create R2 bucket
wrangler d1 create name        # Create D1 database
```

---

## 🎓 Learning Resources

**Official Docs:**
- [Next.js App Router](https://nextjs.org/docs/app)
- [Cloudflare Workers](https://developers.cloudflare.com/workers/)
- [Drizzle ORM](https://orm.drizzle.team/)
- [shadcn/ui](https://ui.shadcn.com/)
- [React Hook Form](https://react-hook-form.com/)
- [Zod](https://zod.dev/)

**Component Inspiration:**
- [shadcn/ui Pro Blocks](https://ui.shadcn.com/blocks)
- [Tremor](https://tremor.so/)
- [Magic UI](https://magicui.design/)
- [Radix UI](https://www.radix-ui.com/)

---

## 💡 Pro Tips

1. **Build patterns as you need them** - Don't build speculatively
2. **Start in modules, extract after 3rd use** - Prove the pattern first
3. **Server Components by default** - Add 'use client' only when needed
4. **Consistent response shapes** - `{ success, data, error }`
5. **Validate everything** - Use Zod for all inputs
6. **Revalidate after mutations** - Keep UI in sync
7. **Loading/error/empty states** - Always handle these three
8. **TypeScript everywhere** - No `any` types
9. **Document as you go** - Future you will thank you
10. **Test in development** - Don't wait for production

---

## 🆘 When Stuck

**Ask yourself:**
1. Does this have business logic? → Feature module
2. Is this used 3+ times? → Pattern
3. Is shadcn/ui enough? → Use it
4. Is this truly one-off? → Shared or inline

**Still unsure?**
- Check: [Component Decision Framework](./component-decision-framework.md)
- Review: [Architecture Overview](./architecture-overview.md)
- Reference: [Module Development Guide](./module-development-guide.md)
- Look at: Existing modules for examples

---

## 📋 Checklist: New Feature

- [ ] Database schema created
- [ ] Migration generated and applied
- [ ] Types/models defined
- [ ] Zod schemas created
- [ ] Server Actions implemented (CRUD)
- [ ] Components created
- [ ] Page route added
- [ ] Loading states added
- [ ] Empty states added
- [ ] Error handling complete
- [ ] Tested in development
- [ ] Patterns extracted (if reusable)

---

## 🎯 Remember

**Three Layers:**
1. **UI Primitives** - Building blocks (shadcn)
2. **Composed Patterns** - Reusable patterns (your library)
3. **Feature Modules** - Business logic (your app)

**Golden Rule:**
> If you've written it 3 times, extract it to a pattern.

**Architecture Goal:**
> Clear boundaries, maximum reusability, minimum duplication.
