# Architecture Comparison: Next.js vs. Vite + Hono

**Purpose:** Document the technical differences between current Next.js setup and proposed Vite + Hono architecture

**Date:** 2025-11-15

---

## Executive Summary

| Aspect | Current (Next.js + OpenNext) | Proposed (Vite + Hono) |
|--------|------------------------------|------------------------|
| **Complexity** | High (SSR, RSC, App Router) | Low (SPA + API) |
| **Dev Setup** | Two terminals required | One terminal |
| **HMR Speed** | 3-5 seconds | < 1 second |
| **Build Time** | ~45 seconds | ~20 seconds |
| **Bundle Size** | ~10MB worker | ~2MB worker |
| **Deployment** | Workaround needed | Standard wrangler |
| **Learning Curve** | Steep (Next.js 15 patterns) | Moderate (React + Hono) |
| **Claude Code Help** | Moderate (RSC confusion) | Easy (clear separation) |
| **Framework Lock-in** | High (Next.js specific) | Low (standard patterns) |

**Recommendation:** Vite + Hono for new business app starters

---

## Development Workflow Comparison

### Current Setup: Next.js + OpenNext

**Starting Development:**
```bash
# Terminal 1: Start Wrangler (for D1 access)
pnpm run wrangler:dev
# Runs on http://localhost:8787
# Provides D1, R2 bindings
# No HMR

# Terminal 2: Start Next.js (for HMR)
pnpm run dev
# Runs on http://localhost:3000
# Provides fast refresh
# Must proxy to Wrangler for DB access
```

**Configuration Files:**
```
wrangler.jsonc        # Cloudflare config
.dev.vars             # Local secrets
next.config.js        # Next.js config
tsconfig.json         # TypeScript
package.json          # Scripts & deps
```

**Making Changes:**
1. Edit code
2. Wait 3-5 seconds for HMR
3. Check browser
4. If using DB/R2, ensure Wrangler is running
5. If Wrangler crashes, restart both terminals

**Pain Points:**
- 😓 Need to remember to run two commands
- 😓 Easy to forget which terminal is which
- 😓 Wrangler errors crash the DB connection
- 😓 Unclear which port to use (3000 or 8787?)
- 😓 Next.js doesn't know about Cloudflare bindings without complex setup

---

### Proposed Setup: Vite + Hono

**Starting Development:**
```bash
# One command:
pnpm dev
# Runs on http://localhost:5173
# Provides:
#   - Vite dev server (HMR)
#   - Hono worker (via Vite plugin)
#   - D1, R2 bindings (via getPlatformProxy)
#   - Frontend + Backend together
```

**Configuration Files:**
```
vite.config.ts        # Everything in one file!
.dev.vars             # Local secrets
tsconfig.json         # TypeScript
package.json          # Scripts & deps
```

**Making Changes:**
1. Edit code
2. Wait < 1 second for HMR
3. Check browser
4. Everything just works

**Pain Points:**
- None (for basic development)
- Learning getPlatformProxy API (minor)

---

## Code Structure Comparison

### Current: Next.js App Router + Server Actions

**A simple Todo CRUD feature:**

```typescript
// app/dashboard/todos/page.tsx (Server Component)
import { TodoList } from '@/modules/todos/components/todo-list'
import { getTodos } from '@/modules/todos/actions'

export default async function TodosPage() {
  const todos = await getTodos() // Server-side data fetch
  return <TodoList initialTodos={todos} />
}

// modules/todos/components/todo-list.tsx (Client Component)
'use client' // Required!
import { useState } from 'react'
import { createTodo, deleteTodo } from '@/modules/todos/actions'

export function TodoList({ initialTodos }) {
  const [todos, setTodos] = useState(initialTodos)

  const handleCreate = async (data) => {
    const result = await createTodo(data) // Server Action
    if (result.success) {
      setTodos([...todos, result.todo])
    }
  }

  return <div>{/* render todos */}</div>
}

// modules/todos/actions.ts (Server Actions)
'use server' // Required!
import { db } from '@/db'
import { todos } from '@/db/schema'
import { auth } from '@/lib/auth'

export async function getTodos() {
  const session = await auth()
  if (!session.user) throw new Error('Unauthorized')

  return await db.query.todos.findMany({
    where: (todos, { eq }) => eq(todos.userId, session.user.id)
  })
}

export async function createTodo(data) {
  const session = await auth()
  if (!session.user) throw new Error('Unauthorized')

  const todo = await db.insert(todos).values({
    ...data,
    userId: session.user.id
  }).returning()

  return { success: true, todo }
}
```

**Cognitive Load:**
- ❓ Is this a Server Component or Client Component?
- ❓ Can I use `useState` here?
- ❓ Can I use `await` here?
- ❓ Do I need `'use client'` or `'use server'`?
- ❓ When does this code run (server, client, both)?
- ❓ What's in the RSC payload?

---

### Proposed: Vite + Hono + TanStack Query

**The same Todo CRUD feature:**

```typescript
// src/client/modules/todos/pages/TodosPage.tsx (React Component)
import { TodoList } from '../components/TodoList'
import { useTodos } from '../hooks/useTodos'

export function TodosPage() {
  const { data: todos, isLoading } = useTodos()

  if (isLoading) return <div>Loading...</div>
  return <TodoList todos={todos} />
}

// src/client/modules/todos/components/TodoList.tsx (React Component)
import { useCreateTodo, useDeleteTodo } from '../hooks/useTodos'

export function TodoList({ todos }) {
  const createTodo = useCreateTodo()
  const deleteTodo = useDeleteTodo()

  const handleCreate = (data) => {
    createTodo.mutate(data) // TanStack Query handles optimistic updates
  }

  return <div>{/* render todos */}</div>
}

// src/client/modules/todos/hooks/useTodos.ts (TanStack Query hooks)
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export function useTodos() {
  return useQuery({
    queryKey: ['todos'],
    queryFn: async () => {
      const res = await fetch('/api/todos')
      if (!res.ok) throw new Error('Failed to fetch')
      return res.json()
    }
  })
}

export function useCreateTodo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data) => {
      const res = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (!res.ok) throw new Error('Failed to create')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] })
    }
  })
}

// src/server/modules/todos/routes.ts (Hono routes)
import { Hono } from 'hono'
import { db } from '@/server/lib/db'
import { todos } from './db/schema'
import { authMiddleware } from '@/server/middleware/auth'
import { zValidator } from '@hono/zod-validator'
import { createTodoSchema } from './schemas/todo.schema'

const app = new Hono<{ Bindings: Env, Variables: { user: User } }>()

app.use('/*', authMiddleware) // Protect all routes

app.get('/', async (c) => {
  const userId = c.get('user').id

  const userTodos = await db.query.todos.findMany({
    where: (todos, { eq }) => eq(todos.userId, userId)
  })

  return c.json(userTodos)
})

app.post('/', zValidator('json', createTodoSchema), async (c) => {
  const userId = c.get('user').id
  const data = c.req.valid('json')

  const [todo] = await db.insert(todos).values({
    ...data,
    userId
  }).returning()

  return c.json(todo)
})

export default app
```

**Cognitive Load:**
- ✅ Everything in `src/client/` runs on client
- ✅ Everything in `src/server/` runs on server
- ✅ `fetch('/api/todos')` is obvious
- ✅ Standard React patterns (hooks, components)
- ✅ Standard API patterns (request/response)

---

## Build & Deploy Comparison

### Current: Next.js + OpenNext

**Build Process:**
```bash
# Build for Cloudflare
pnpm run build:cf

# This runs:
# 1. next build (creates .next/)
# 2. @opennextjs/cloudflare build (transforms to .worker-next/)
# 3. Generates worker wrapper
# 4. Bundles everything

# Output:
.worker-next/
├── index.mjs              # Worker entry point
├── _worker.js/            # Adapter code
├── chunks/                # Next.js chunks
└── assets/                # Static files

# Size: ~10MB
```

**Deploy Process:**
```bash
# Option 1: Doesn't work (auth errors)
pnpm run deploy
# Uses @opennextjs/cloudflare deploy
# Fails with: "Could not authenticate"

# Option 2: Workaround that works
wrangler deploy
# Must use wrangler directly
# Deploys from .worker-next/
```

**Pain Points:**
- 😓 Two-step build (Next.js → OpenNext)
- 😓 Large bundle size (~10MB)
- 😓 Deployment auth errors
- 😓 Unclear what's in the bundle
- 😓 Can't easily inspect worker code

---

### Proposed: Vite + Hono

**Build Process:**
```bash
# Build for production
pnpm run build

# This runs:
# 1. Vite build (creates dist/client/ for frontend)
# 2. Vite build (creates dist/server/ for worker)
# 3. Bundles everything together

# Output:
dist/
├── _worker.js             # Worker with Hono app
├── assets/                # Hashed static files (CSS, JS)
│   ├── index-a1b2c3.js
│   └── index-d4e5f6.css
└── index.html             # Entry HTML

# Size: ~2MB
```

**Deploy Process:**
```bash
# One command that always works:
wrangler deploy

# Deploys from dist/
# No auth issues
# No adapter layer
```

**Benefits:**
- ✅ One-step build (Vite does everything)
- ✅ Smaller bundle (~2MB vs ~10MB)
- ✅ Standard wrangler deploy (no workarounds)
- ✅ Clear output structure
- ✅ Can inspect _worker.js easily

---

## Type Safety Comparison

### Current: Next.js + OpenNext

**Cloudflare bindings:**
```typescript
// types/cloudflare.d.ts (manually maintained)
interface CloudflareEnv {
  DB: D1Database
  R2: R2Bucket
  // Must manually keep in sync with wrangler.jsonc
}

// app/api/todos/route.ts
import { getRequestContext } from '@opennextjs/cloudflare'

export async function GET() {
  const { env } = await getRequestContext<CloudflareEnv>()
  const db = env.DB // Type is D1Database (manually defined)
  // ...
}
```

**Problems:**
- Must manually define types
- No auto-completion for binding names
- Easy to get out of sync with wrangler.jsonc
- getRequestContext is OpenNext-specific

---

### Proposed: Vite + Hono

**Cloudflare bindings:**
```typescript
// vite.config.ts
export default defineConfig({
  plugins: [
    cloudflare({
      worker: {
        main: './src/server/index.ts',
        bindings: {
          DB: { type: 'd1', name: 'my-database' },
          R2: { type: 'r2', name: 'my-bucket' },
        }
      }
    })
  ]
})

// Auto-generated types in .wrangler/types/
interface Env {
  DB: D1Database
  R2: R2Bucket
}

// src/server/index.ts
const app = new Hono<{ Bindings: Env }>()

app.get('/api/todos', async (c) => {
  const db = c.env.DB // ✅ TypeScript knows this exists!
  const bucket = c.env.R2 // ✅ Auto-completion works!
  // ...
})
```

**Benefits:**
- ✅ Types auto-generated from config
- ✅ Single source of truth (vite.config.ts)
- ✅ Auto-completion for all bindings
- ✅ Type errors if you use wrong binding name
- ✅ Standard Cloudflare types (no adapter layer)

---

## Module System Comparison

### Current: Next.js Modules

**Structure:**
```
src/modules/todos/
├── actions.ts              # Server Actions
├── components/             # Client Components (mostly)
│   ├── todo-list.tsx      # 'use client'
│   ├── todo-form.tsx      # 'use client'
│   └── todo-card.tsx      # 'use client'
├── schemas/
│   └── todo.schema.ts
└── [no backend routes, uses Server Actions]
```

**Exporting the module:**
```typescript
// app/dashboard/todos/page.tsx
import { TodoList } from '@/modules/todos/components/todo-list'
import { getTodos } from '@/modules/todos/actions'

// Server Component that calls Server Action
export default async function TodosPage() {
  const todos = await getTodos()
  return <TodoList initialTodos={todos} />
}
```

**Issues:**
- Server Actions are Next.js-specific (not portable)
- `'use client'` directives everywhere (confusing)
- Hard to extract module to separate package
- Tight coupling with Next.js App Router

---

### Proposed: Vite + Hono Modules

**Structure:**
```
src/client/modules/todos/      # Frontend module
├── components/
│   ├── TodoList.tsx          # Just React components
│   ├── TodoForm.tsx          # Just React components
│   └── TodoCard.tsx          # Just React components
├── hooks/
│   └── useTodos.ts           # TanStack Query hooks
├── schemas/
│   └── todo.schema.ts        # Shared Zod schema
└── pages/
    └── TodosPage.tsx         # Route component

src/server/modules/todos/      # Backend module
├── routes.ts                 # Hono routes
├── schemas/
│   └── todo.schema.ts        # Same Zod schema
└── db/
    └── schema.ts             # Drizzle schema
```

**Exporting the module:**
```typescript
// src/client/App.tsx
import { TodosPage } from './modules/todos/pages/TodosPage'

<Route path="/todos" element={<TodosPage />} />

// src/server/index.ts
import todosRoutes from './modules/todos/routes'

app.route('/api/todos', todosRoutes)
```

**Benefits:**
- ✅ Frontend module is just React (portable)
- ✅ Backend module is just Hono (portable)
- ✅ Clear separation (could split into packages easily)
- ✅ No framework-specific directives
- ✅ Schemas shared via standard imports
- ✅ Could publish to npm as standalone packages

---

## Authentication Comparison

### Current: Next.js + better-auth

**Setup:**
```typescript
// lib/auth.ts
import { betterAuth } from 'better-auth'
import { getRequestContext } from '@opennextjs/cloudflare'

export const auth = betterAuth({
  // ...config
})

export async function authMiddleware() {
  const { env } = await getRequestContext()
  const session = await auth.api.getSession({
    headers: /* get headers from somewhere */
  })
  return session
}

// app/api/todos/route.ts
export async function GET() {
  const session = await authMiddleware()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  // ...
}
```

**Issues:**
- `getRequestContext` is OpenNext-specific
- Headers handling is awkward in Server Actions
- Session management split between server/client
- Middleware setup is complex

---

### Proposed: Vite + Hono + better-auth

**Setup:**
```typescript
// src/server/lib/auth.ts
import { betterAuth } from 'better-auth'

export const auth = betterAuth({
  database: /* D1 adapter */,
  // ...config
})

// src/server/middleware/auth.ts
import { createMiddleware } from 'hono/factory'
import { auth } from '../lib/auth'

export const authMiddleware = createMiddleware(async (c, next) => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers
  })

  if (!session?.user) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  c.set('user', session.user)
  await next()
})

// src/server/modules/todos/routes.ts
import { authMiddleware } from '@/server/middleware/auth'

app.use('/*', authMiddleware) // Protect all routes

app.get('/', async (c) => {
  const user = c.get('user') // ✅ TypeScript knows this exists
  // ...
})
```

**Benefits:**
- ✅ Standard Hono patterns
- ✅ Headers easily accessible (c.req.raw.headers)
- ✅ Middleware is composable
- ✅ User object type-safe in context
- ✅ Clear separation (auth = server concern)

---

## Testing Comparison

### Current: Next.js Testing Challenges

**What's hard to test:**
- Server Actions (run in Next.js runtime)
- Server Components (RSC payload)
- Interaction between server/client
- Cloudflare Workers environment (need test-env)

**What you'd use:**
```typescript
// __tests__/todos.test.ts
import { GET } from '@/app/api/todos/route'
import { testEnv } from '@/test/setup'

// Mock getRequestContext (OpenNext-specific)
jest.mock('@opennextjs/cloudflare', () => ({
  getRequestContext: jest.fn(() => ({
    env: testEnv
  }))
}))

test('GET /api/todos returns user todos', async () => {
  const response = await GET()
  const data = await response.json()
  expect(data).toEqual([/* todos */])
})
```

**Pain Points:**
- 😓 Must mock OpenNext adapter
- 😓 Must mock Next.js request context
- 😓 Server Actions hard to test in isolation
- 😓 Need complex test setup

---

### Proposed: Vite + Hono Testing

**What's easy to test:**
- Hono routes (just functions!)
- React components (standard React testing)
- Hooks (standard hook testing)
- Workers (Cloudflare provides test environment)

**What you'd use:**
```typescript
// src/server/modules/todos/routes.test.ts
import { describe, it, expect } from 'vitest'
import app from './routes'

describe('Todos API', () => {
  it('GET /api/todos returns user todos', async () => {
    const res = await app.request('/api/todos', {
      headers: {
        'Cookie': 'session=test-session'
      }
    }, {
      DB: testDB,
      // Mock env
    })

    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data).toEqual([/* todos */])
  })
})

// src/client/modules/todos/TodoList.test.tsx
import { render, screen } from '@testing-library/react'
import { TodoList } from './TodoList'

test('renders todo list', () => {
  render(<TodoList todos={[/* test data */]} />)
  expect(screen.getByText('My Todo')).toBeInTheDocument()
})
```

**Benefits:**
- ✅ No framework mocking needed
- ✅ Hono routes are just request/response
- ✅ Standard React component testing
- ✅ Cloudflare test environment is first-class
- ✅ Easier to test in isolation

---

## Performance Comparison

### Bundle Size

**Current (Next.js + OpenNext):**
```
Worker bundle: ~10MB
  - Next.js runtime
  - React Server Components runtime
  - OpenNext adapter layer
  - Your application code
  - All page chunks
```

**Proposed (Vite + Hono):**
```
Worker bundle: ~2MB
  - Hono framework (~11KB)
  - better-auth
  - Drizzle ORM
  - Your application code
  - No framework runtime overhead
```

**Impact:**
- ✅ Faster cold starts (smaller bundle)
- ✅ Faster deploys (less to upload)
- ✅ Less memory usage on Workers

---

### Cold Start Time

**Current (Next.js):**
```
~100-150ms cold start
  - Load Next.js runtime
  - Load RSC runtime
  - Load OpenNext adapter
  - Initialize app
```

**Proposed (Hono):**
```
~30-50ms cold start
  - Load Hono (~11KB)
  - Initialize app
  - Much less overhead
```

**Impact:**
- ✅ Better user experience (faster first request)
- ✅ Better suited for edge deployment

---

### Hot Reload Speed

**Current (Next.js):**
```
~3-5 seconds HMR
  - Next.js compiles changes
  - RSC payload regenerates
  - Browser hydrates
```

**Proposed (Vite):**
```
~0.5-1 second HMR
  - Vite's optimized HMR
  - No RSC overhead
  - Direct module replacement
```

**Impact:**
- ✅ Faster development iteration
- ✅ Better developer experience
- ✅ Less context switching while coding

---

## Ecosystem & Learning Resources

### Current: Next.js App Router

**Maturity:** Very new (App Router released 2023)

**Learning Resources:**
- ✅ Official Next.js docs (good)
- ⚠️ Community tutorials (mixed quality, many outdated)
- ⚠️ Stack Overflow (RSC answers are confusing)
- ⚠️ Next.js 15 specific content (limited)

**Community:**
- ✅ Large Next.js community
- ⚠️ App Router adoption still growing
- ⚠️ Pages Router vs. App Router confusion
- ⚠️ Server Actions best practices still evolving

**Claude Code Assistance:**
- ⚠️ Can help, but sometimes confused by RSC
- ⚠️ 'use client' vs 'use server' often requires clarification
- ⚠️ OpenNext adapter patterns are less documented

---

### Proposed: Vite + Hono + React

**Maturity:** Established patterns

**Learning Resources:**
- ✅ React docs (extensive, stable)
- ✅ Vite docs (clear, comprehensive)
- ✅ Hono docs (simple, well-written)
- ✅ Cloudflare Workers docs (first-class support)
- ✅ TanStack Query docs (excellent)
- ✅ Tons of Stack Overflow for React + API patterns

**Community:**
- ✅ React: Massive, mature community
- ✅ Hono: Growing fast, active maintainers
- ✅ Vite: Large community, widely adopted
- ✅ Standard patterns (SPA + API) well understood

**Claude Code Assistance:**
- ✅ Excellent (clear client/server separation)
- ✅ Standard patterns are well-represented in training data
- ✅ Easy to debug (errors are obvious)
- ✅ Can suggest idiomatic code confidently

---

## Migration Path (If Needed Later)

### From Vite + Hono → Next.js (if you want SSR later)

**Frontend:**
- React components work as-is (just remove TanStack Query)
- Replace client-side routing with Next.js App Router
- Add 'use client' directives

**Backend:**
- Hono routes → Next.js Route Handlers (similar API)
- Or keep Hono as separate API (Next.js can call it)

**Effort:** ~5-10 days

---

### From Next.js → Vite + Hono (current situation)

**Frontend:**
- Remove 'use client' directives
- Replace Server Actions with TanStack Query hooks
- Add client-side routing (React Router)
- Keep components mostly as-is

**Backend:**
- Extract data fetching from Server Components/Actions
- Create Hono routes
- Add auth middleware

**Effort:** ~15-25 days (current codebase)

---

## Final Recommendation

### Choose Next.js + OpenNext if:
- ❌ You NEED server-side rendering for SEO
- ❌ You're building a public marketing site
- ❌ Your team is already expert in Next.js App Router
- ❌ You want to use Server Actions (love them or need them)

### Choose Vite + Hono if:
- ✅ Building authenticated business apps (CRM, dashboards, tools)
- ✅ Want simpler mental model
- ✅ Value fast iteration and clear separation
- ✅ Working with AI assistants (Claude Code)
- ✅ Want maximum Cloudflare alignment
- ✅ Need to build multiple apps from starter kit
- ✅ Team is learning full-stack development

**For Jezweb's use case (business apps starter kit): Vite + Hono is the clear winner.**

---

## Appendix: Code Size Comparison

### Todo Module Lines of Code

**Current (Next.js):**
```
modules/todos/
├── actions.ts          (150 lines) - Server Actions + validation
├── components/
│   ├── todo-list.tsx   (120 lines) - Client component + state
│   ├── todo-form.tsx   (180 lines) - Form + validation
│   └── todo-card.tsx   (80 lines)  - Display component

Total: ~530 lines
```

**Proposed (Vite + Hono):**
```
src/client/modules/todos/
├── components/
│   ├── TodoList.tsx    (80 lines)  - Display only
│   ├── TodoForm.tsx    (120 lines) - Form + validation
│   └── TodoCard.tsx    (60 lines)  - Display component
├── hooks/
│   └── useTodos.ts     (100 lines) - TanStack Query hooks

src/server/modules/todos/
└── routes.ts           (120 lines) - Hono routes + validation

Total: ~480 lines
```

**Difference:**
- ✅ ~10% less code
- ✅ Clearer separation of concerns
- ✅ Each file has single responsibility

---

**Document Version:** 1.0
**Author:** Claude Code
**Date:** 2025-11-15
