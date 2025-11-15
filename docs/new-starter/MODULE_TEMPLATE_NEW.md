# Module Template: Vite + Hono Architecture

**Purpose:** Step-by-step guide for creating new feature modules in the Cloudflare starter kit

**Architecture:** React SPA (Vite) + Hono API

---

## Module Anatomy

Every module has **two parts**:

1. **Frontend Module** (`src/client/modules/[name]/`)
   - React components
   - TanStack Query hooks for data fetching
   - Shared Zod schemas
   - Pages/routes

2. **Backend Module** (`src/server/modules/[name]/`)
   - Hono route handlers
   - Database schema (Drizzle)
   - Business logic
   - Same Zod schemas (shared with frontend)

**Key Principle:** Frontend and backend are separate but share schemas for type safety.

---

## Example: Building an "Invoices" Module

Let's build a complete invoices module with:
- List invoices
- Create invoice
- Edit invoice
- Delete invoice
- Mark as paid/unpaid

---

## Step 1: Define Database Schema

**File:** `src/server/modules/invoices/db/schema.ts`

```typescript
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { createId } from '@paralleldrive/cid'

export const invoices = sqliteTable('invoices', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').notNull(),

  // Invoice details
  invoiceNumber: text('invoice_number').notNull(),
  clientName: text('client_name').notNull(),
  clientEmail: text('client_email'),

  // Financial
  amount: integer('amount').notNull(), // Store in cents
  currency: text('currency').notNull().default('USD'),
  status: text('status').notNull().default('draft'), // draft, sent, paid, overdue

  // Dates
  issueDate: integer('issue_date').notNull(), // Unix timestamp
  dueDate: integer('due_date').notNull(),
  paidDate: integer('paid_date'), // Null if unpaid

  // Metadata
  createdAt: integer('created_at').notNull().$defaultFn(() => Date.now()),
  updatedAt: integer('updated_at').notNull().$defaultFn(() => Date.now()),
})

export type Invoice = typeof invoices.$inferSelect
export type NewInvoice = typeof invoices.$inferInsert
```

**Export in central schema:**

**File:** `src/server/db/schema.ts`

```typescript
// Export all table schemas here
export { users, sessions, accounts, verification } from '@/server/modules/auth/db/schema'
export { todos } from '@/server/modules/todos/db/schema'
export { invoices } from '@/server/modules/invoices/db/schema' // Add this
```

---

## Step 2: Create Database Migration

```bash
# Generate migration
pnpm run db:generate:named "add_invoices_table"

# This creates: drizzle/XXXX_add_invoices_table.sql
# Review the SQL, then apply:
pnpm run db:migrate:local
```

**Verify migration:**
```bash
# Open Drizzle Studio
pnpm run db:studio:local

# Check that 'invoices' table exists
```

---

## Step 3: Create Shared Validation Schemas

**File:** `src/shared/schemas/invoice.schema.ts`

(Note: Use a shared folder so both client and server can import)

```typescript
import { z } from 'zod'

// Create schema
export const createInvoiceSchema = z.object({
  invoiceNumber: z.string().min(1, 'Invoice number is required'),
  clientName: z.string().min(1, 'Client name is required'),
  clientEmail: z.string().email('Invalid email').optional(),
  amount: z.number().int().positive('Amount must be positive'),
  currency: z.string().default('USD'),
  issueDate: z.number().int().positive(),
  dueDate: z.number().int().positive(),
})

// Update schema (allows partial updates)
export const updateInvoiceSchema = createInvoiceSchema.partial()

// Mark as paid schema
export const markPaidSchema = z.object({
  paidDate: z.number().int().positive(),
})

// Types inferred from schemas
export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>
export type UpdateInvoiceInput = z.infer<typeof updateInvoiceSchema>
```

---

## Step 4: Create Backend Routes (Hono)

**File:** `src/server/modules/invoices/routes.ts`

```typescript
import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { db } from '@/server/lib/db'
import { invoices } from './db/schema'
import { createInvoiceSchema, updateInvoiceSchema, markPaidSchema } from '@/shared/schemas/invoice.schema'
import { authMiddleware } from '@/server/middleware/auth'
import { eq, and, desc } from 'drizzle-orm'

type Variables = {
  user: {
    id: string
    email: string
  }
}

const app = new Hono<{ Bindings: Env, Variables: Variables }>()

// Protect all routes with auth middleware
app.use('/*', authMiddleware)

// GET /api/invoices - List user's invoices
app.get('/', async (c) => {
  const userId = c.get('user').id

  const userInvoices = await db.query.invoices.findMany({
    where: eq(invoices.userId, userId),
    orderBy: [desc(invoices.createdAt)]
  })

  return c.json(userInvoices)
})

// GET /api/invoices/:id - Get single invoice
app.get('/:id', async (c) => {
  const userId = c.get('user').id
  const invoiceId = c.req.param('id')

  const invoice = await db.query.invoices.findFirst({
    where: and(
      eq(invoices.id, invoiceId),
      eq(invoices.userId, userId)
    )
  })

  if (!invoice) {
    return c.json({ error: 'Invoice not found' }, 404)
  }

  return c.json(invoice)
})

// POST /api/invoices - Create invoice
app.post('/', zValidator('json', createInvoiceSchema), async (c) => {
  const userId = c.get('user').id
  const data = c.req.valid('json')

  const [invoice] = await db.insert(invoices).values({
    ...data,
    userId,
    status: 'draft',
  }).returning()

  return c.json(invoice, 201)
})

// PUT /api/invoices/:id - Update invoice
app.put('/:id', zValidator('json', updateInvoiceSchema), async (c) => {
  const userId = c.get('user').id
  const invoiceId = c.req.param('id')
  const data = c.req.valid('json')

  // Verify ownership
  const existing = await db.query.invoices.findFirst({
    where: and(
      eq(invoices.id, invoiceId),
      eq(invoices.userId, userId)
    )
  })

  if (!existing) {
    return c.json({ error: 'Invoice not found' }, 404)
  }

  const [updated] = await db.update(invoices)
    .set({
      ...data,
      updatedAt: Date.now(),
    })
    .where(eq(invoices.id, invoiceId))
    .returning()

  return c.json(updated)
})

// POST /api/invoices/:id/mark-paid - Mark as paid
app.post('/:id/mark-paid', zValidator('json', markPaidSchema), async (c) => {
  const userId = c.get('user').id
  const invoiceId = c.req.param('id')
  const { paidDate } = c.req.valid('json')

  // Verify ownership
  const existing = await db.query.invoices.findFirst({
    where: and(
      eq(invoices.id, invoiceId),
      eq(invoices.userId, userId)
    )
  })

  if (!existing) {
    return c.json({ error: 'Invoice not found' }, 404)
  }

  const [updated] = await db.update(invoices)
    .set({
      status: 'paid',
      paidDate,
      updatedAt: Date.now(),
    })
    .where(eq(invoices.id, invoiceId))
    .returning()

  return c.json(updated)
})

// DELETE /api/invoices/:id - Delete invoice
app.delete('/:id', async (c) => {
  const userId = c.get('user').id
  const invoiceId = c.req.param('id')

  // Verify ownership
  const existing = await db.query.invoices.findFirst({
    where: and(
      eq(invoices.id, invoiceId),
      eq(invoices.userId, userId)
    )
  })

  if (!existing) {
    return c.json({ error: 'Invoice not found' }, 404)
  }

  await db.delete(invoices).where(eq(invoices.id, invoiceId))

  return c.json({ success: true })
})

export default app
```

---

## Step 5: Register Backend Routes

**File:** `src/server/index.ts`

```typescript
import { Hono } from 'hono'
import { serveStatic } from 'hono/cloudflare-workers'

// Import module routes
import authRoutes from './modules/auth/routes'
import todosRoutes from './modules/todos/routes'
import invoicesRoutes from './modules/invoices/routes' // Add this

const app = new Hono<{ Bindings: Env }>()

// API routes
app.route('/api/auth', authRoutes)
app.route('/api/todos', todosRoutes)
app.route('/api/invoices', invoicesRoutes) // Add this

// Serve static files for everything else
app.get('/*', serveStatic({ root: './' }))

export default app
```

---

## Step 6: Create Frontend Data Hooks

**File:** `src/client/modules/invoices/hooks/useInvoices.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Invoice } from '@/server/modules/invoices/db/schema'
import type { CreateInvoiceInput, UpdateInvoiceInput } from '@/shared/schemas/invoice.schema'

const INVOICES_KEY = ['invoices']

// Fetch all invoices
export function useInvoices() {
  return useQuery({
    queryKey: INVOICES_KEY,
    queryFn: async (): Promise<Invoice[]> => {
      const res = await fetch('/api/invoices')
      if (!res.ok) throw new Error('Failed to fetch invoices')
      return res.json()
    }
  })
}

// Fetch single invoice
export function useInvoice(id: string) {
  return useQuery({
    queryKey: [...INVOICES_KEY, id],
    queryFn: async (): Promise<Invoice> => {
      const res = await fetch(`/api/invoices/${id}`)
      if (!res.ok) throw new Error('Failed to fetch invoice')
      return res.json()
    },
    enabled: !!id,
  })
}

// Create invoice
export function useCreateInvoice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateInvoiceInput): Promise<Invoice> => {
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to create invoice')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INVOICES_KEY })
    }
  })
}

// Update invoice
export function useUpdateInvoice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string, data: UpdateInvoiceInput }): Promise<Invoice> => {
      const res = await fetch(`/api/invoices/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to update invoice')
      return res.json()
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: INVOICES_KEY })
      queryClient.invalidateQueries({ queryKey: [...INVOICES_KEY, variables.id] })
    }
  })
}

// Mark invoice as paid
export function useMarkInvoicePaid() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, paidDate }: { id: string, paidDate: number }): Promise<Invoice> => {
      const res = await fetch(`/api/invoices/${id}/mark-paid`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paidDate }),
      })
      if (!res.ok) throw new Error('Failed to mark invoice as paid')
      return res.json()
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: INVOICES_KEY })
      queryClient.invalidateQueries({ queryKey: [...INVOICES_KEY, variables.id] })
    }
  })
}

// Delete invoice
export function useDeleteInvoice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const res = await fetch(`/api/invoices/${id}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Failed to delete invoice')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INVOICES_KEY })
    }
  })
}
```

---

## Step 7: Create Frontend Components

**File:** `src/client/modules/invoices/components/InvoiceList.tsx`

```typescript
import { useInvoices, useDeleteInvoice, useMarkInvoicePaid } from '../hooks/useInvoices'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export function InvoiceList() {
  const { data: invoices, isLoading } = useInvoices()
  const deleteInvoice = useDeleteInvoice()
  const markPaid = useMarkInvoicePaid()

  if (isLoading) return <div>Loading invoices...</div>

  if (!invoices?.length) {
    return <div>No invoices yet. Create your first one!</div>
  }

  const handleDelete = async (id: string) => {
    if (confirm('Delete this invoice?')) {
      await deleteInvoice.mutateAsync(id)
    }
  }

  const handleMarkPaid = async (id: string) => {
    await markPaid.mutateAsync({
      id,
      paidDate: Date.now(),
    })
  }

  return (
    <div className="space-y-4">
      {invoices.map((invoice) => (
        <Card key={invoice.id} className="p-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold">{invoice.invoiceNumber}</h3>
              <p className="text-sm text-muted-foreground">{invoice.clientName}</p>
              <p className="text-lg font-bold mt-2">
                ${(invoice.amount / 100).toFixed(2)} {invoice.currency}
              </p>
            </div>

            <div className="flex gap-2 items-start">
              <Badge variant={invoice.status === 'paid' ? 'success' : 'default'}>
                {invoice.status}
              </Badge>

              {invoice.status !== 'paid' && (
                <Button
                  size="sm"
                  onClick={() => handleMarkPaid(invoice.id)}
                  disabled={markPaid.isPending}
                >
                  Mark Paid
                </Button>
              )}

              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleDelete(invoice.id)}
                disabled={deleteInvoice.isPending}
              >
                Delete
              </Button>
            </div>
          </div>

          <div className="mt-4 text-sm text-muted-foreground">
            <p>Issue Date: {new Date(invoice.issueDate).toLocaleDateString()}</p>
            <p>Due Date: {new Date(invoice.dueDate).toLocaleDateString()}</p>
            {invoice.paidDate && (
              <p>Paid: {new Date(invoice.paidDate).toLocaleDateString()}</p>
            )}
          </div>
        </Card>
      ))}
    </div>
  )
}
```

**File:** `src/client/modules/invoices/components/InvoiceForm.tsx`

```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createInvoiceSchema, type CreateInvoiceInput } from '@/shared/schemas/invoice.schema'
import { useCreateInvoice } from '../hooks/useInvoices'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

export function InvoiceForm({ onSuccess }: { onSuccess?: () => void }) {
  const createInvoice = useCreateInvoice()

  const form = useForm<CreateInvoiceInput>({
    resolver: zodResolver(createInvoiceSchema),
    defaultValues: {
      invoiceNumber: '',
      clientName: '',
      clientEmail: '',
      amount: 0,
      currency: 'USD',
      issueDate: Date.now(),
      dueDate: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days from now
    }
  })

  const onSubmit = async (data: CreateInvoiceInput) => {
    await createInvoice.mutateAsync(data)
    form.reset()
    onSuccess?.()
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="invoiceNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Invoice Number</FormLabel>
              <FormControl>
                <Input placeholder="INV-001" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="clientName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Client Name</FormLabel>
              <FormControl>
                <Input placeholder="Acme Corp" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="clientEmail"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Client Email (Optional)</FormLabel>
              <FormControl>
                <Input type="email" placeholder="client@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount (in cents)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="10000"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={createInvoice.isPending}>
          {createInvoice.isPending ? 'Creating...' : 'Create Invoice'}
        </Button>
      </form>
    </Form>
  )
}
```

---

## Step 8: Create Page Component

**File:** `src/client/modules/invoices/pages/InvoicesPage.tsx`

```typescript
import { useState } from 'react'
import { InvoiceList } from '../components/InvoiceList'
import { InvoiceForm } from '../components/InvoiceForm'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

export function InvoicesPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Invoices</h1>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>Create Invoice</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Invoice</DialogTitle>
            </DialogHeader>
            <InvoiceForm onSuccess={() => setIsDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <InvoiceList />
    </div>
  )
}
```

---

## Step 9: Register Frontend Route

**File:** `src/client/App.tsx`

```typescript
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { DashboardLayout } from './modules/dashboard/pages/DashboardLayout'
import { TodosPage } from './modules/todos/pages/TodosPage'
import { InvoicesPage } from './modules/invoices/pages/InvoicesPage' // Add this

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route path="todos" element={<TodosPage />} />
          <Route path="invoices" element={<InvoicesPage />} /> {/* Add this */}
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
```

---

## Step 10: Add Navigation Link

**File:** `src/client/modules/dashboard/components/Sidebar.tsx`

```typescript
import { Link } from 'react-router-dom'
import { FileText, ListTodo, Receipt } from 'lucide-react'

export function Sidebar() {
  return (
    <nav className="space-y-2">
      <Link to="/dashboard/todos" className="flex items-center gap-2 p-2 hover:bg-accent rounded">
        <ListTodo className="h-4 w-4" />
        Todos
      </Link>

      <Link to="/dashboard/invoices" className="flex items-center gap-2 p-2 hover:bg-accent rounded">
        <Receipt className="h-4 w-4" />
        Invoices
      </Link>
    </nav>
  )
}
```

---

## Module Complete! 🎉

You now have a fully functional invoices module with:

- ✅ Database schema and migrations
- ✅ Backend API (Hono routes)
- ✅ Frontend data hooks (TanStack Query)
- ✅ UI components (shadcn/ui)
- ✅ Form validation (Zod)
- ✅ Type safety (TypeScript end-to-end)
- ✅ User isolation (userId filtering)
- ✅ CRUD operations
- ✅ Navigation integration

---

## Testing Your Module

### 1. Start Development Server
```bash
pnpm dev
```

### 2. Manual Testing Checklist
- [ ] Navigate to /dashboard/invoices
- [ ] Page loads without errors
- [ ] Click "Create Invoice"
- [ ] Fill out form with valid data
- [ ] Submit form
- [ ] New invoice appears in list
- [ ] Click "Mark Paid"
- [ ] Status badge updates to "paid"
- [ ] Click "Delete"
- [ ] Confirm deletion
- [ ] Invoice removed from list
- [ ] Refresh page
- [ ] Data persists

### 3. Database Verification
```bash
# Open Drizzle Studio
pnpm run db:studio:local

# Check:
# - 'invoices' table exists
# - Invoice records have correct userId
# - Status updates are persisted
# - Deleted invoices are removed
```

---

## Module Patterns & Best Practices

### 1. User Isolation (Security)
**Always filter by userId on backend:**
```typescript
// ✅ Good: Filter by userId
const invoices = await db.query.invoices.findMany({
  where: eq(invoices.userId, userId)
})

// ❌ Bad: Returns all users' data
const invoices = await db.query.invoices.findMany()
```

### 2. Shared Schemas (Type Safety)
**Keep Zod schemas in `/shared`:**
```typescript
// src/shared/schemas/invoice.schema.ts
export const createInvoiceSchema = z.object({ ... })

// Used on frontend:
import { createInvoiceSchema } from '@/shared/schemas/invoice.schema'

// Used on backend:
import { createInvoiceSchema } from '@/shared/schemas/invoice.schema'
```

### 3. Optimistic Updates (Better UX)
**For instant feedback:**
```typescript
export function useDeleteInvoice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      await fetch(`/api/invoices/${id}`, { method: 'DELETE' })
    },
    onMutate: async (id) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: INVOICES_KEY })

      // Snapshot previous value
      const previous = queryClient.getQueryData(INVOICES_KEY)

      // Optimistically remove from list
      queryClient.setQueryData(INVOICES_KEY, (old: Invoice[]) =>
        old.filter(invoice => invoice.id !== id)
      )

      return { previous }
    },
    onError: (err, id, context) => {
      // Rollback on error
      queryClient.setQueryData(INVOICES_KEY, context?.previous)
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: INVOICES_KEY })
    }
  })
}
```

### 4. Error Handling
**Backend:**
```typescript
app.post('/', zValidator('json', createInvoiceSchema), async (c) => {
  try {
    const userId = c.get('user').id
    const data = c.req.valid('json')

    const [invoice] = await db.insert(invoices).values({
      ...data,
      userId,
    }).returning()

    return c.json(invoice, 201)
  } catch (error) {
    console.error('Failed to create invoice:', error)
    return c.json({ error: 'Failed to create invoice' }, 500)
  }
})
```

**Frontend:**
```typescript
export function InvoiceForm() {
  const createInvoice = useCreateInvoice()

  const onSubmit = async (data: CreateInvoiceInput) => {
    try {
      await createInvoice.mutateAsync(data)
      toast.success('Invoice created successfully')
    } catch (error) {
      toast.error('Failed to create invoice')
      console.error(error)
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* form fields */}
    </form>
  )
}
```

### 5. Loading States
```typescript
export function InvoiceList() {
  const { data: invoices, isLoading, error } = useInvoices()

  if (isLoading) {
    return <div className="animate-pulse">Loading invoices...</div>
  }

  if (error) {
    return <div className="text-red-500">Error loading invoices</div>
  }

  if (!invoices?.length) {
    return <div>No invoices yet</div>
  }

  return <div>{/* render invoices */}</div>
}
```

---

## Advanced Patterns

### Relationships (e.g., Invoice Items)

**Database schema:**
```typescript
export const invoiceItems = sqliteTable('invoice_items', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  invoiceId: text('invoice_id').notNull().references(() => invoices.id, { onDelete: 'cascade' }),
  description: text('description').notNull(),
  quantity: integer('quantity').notNull(),
  unitPrice: integer('unit_price').notNull(),
  total: integer('total').notNull(),
})

// Define relations
export const invoicesRelations = relations(invoices, ({ many }) => ({
  items: many(invoiceItems),
}))

export const invoiceItemsRelations = relations(invoiceItems, ({ one }) => ({
  invoice: one(invoices, {
    fields: [invoiceItems.invoiceId],
    references: [invoices.id],
  }),
}))
```

**Query with relations:**
```typescript
app.get('/:id', async (c) => {
  const userId = c.get('user').id
  const invoiceId = c.req.param('id')

  const invoice = await db.query.invoices.findFirst({
    where: and(
      eq(invoices.id, invoiceId),
      eq(invoices.userId, userId)
    ),
    with: {
      items: true, // Include related items
    }
  })

  return c.json(invoice)
})
```

### Pagination

**Backend:**
```typescript
app.get('/', async (c) => {
  const userId = c.get('user').id
  const page = Number(c.req.query('page') || '1')
  const limit = Number(c.req.query('limit') || '20')
  const offset = (page - 1) * limit

  const [items, total] = await Promise.all([
    db.query.invoices.findMany({
      where: eq(invoices.userId, userId),
      limit,
      offset,
      orderBy: [desc(invoices.createdAt)]
    }),
    db.select({ count: count() })
      .from(invoices)
      .where(eq(invoices.userId, userId))
  ])

  return c.json({
    items,
    pagination: {
      page,
      limit,
      total: total[0].count,
      pages: Math.ceil(total[0].count / limit),
    }
  })
})
```

**Frontend (TanStack Query):**
```typescript
export function useInvoices(page: number = 1) {
  return useQuery({
    queryKey: [...INVOICES_KEY, { page }],
    queryFn: async () => {
      const res = await fetch(`/api/invoices?page=${page}&limit=20`)
      if (!res.ok) throw new Error('Failed to fetch')
      return res.json()
    },
    keepPreviousData: true, // Keep old data while fetching new page
  })
}
```

### Search & Filtering

**Backend:**
```typescript
app.get('/', async (c) => {
  const userId = c.get('user').id
  const search = c.req.query('search')
  const status = c.req.query('status')

  let query = db.query.invoices.findMany({
    where: (invoices, { eq, and, or, like }) => {
      const conditions = [eq(invoices.userId, userId)]

      if (search) {
        conditions.push(
          or(
            like(invoices.invoiceNumber, `%${search}%`),
            like(invoices.clientName, `%${search}%`)
          )
        )
      }

      if (status) {
        conditions.push(eq(invoices.status, status))
      }

      return and(...conditions)
    },
    orderBy: [desc(invoices.createdAt)]
  })

  const items = await query

  return c.json(items)
})
```

---

## File Structure Recap

```
Your completed invoices module:

src/
├── shared/
│   └── schemas/
│       └── invoice.schema.ts      # Shared Zod schemas
│
├── client/
│   └── modules/
│       └── invoices/
│           ├── components/
│           │   ├── InvoiceList.tsx
│           │   ├── InvoiceForm.tsx
│           │   └── InvoiceCard.tsx
│           ├── hooks/
│           │   └── useInvoices.ts
│           └── pages/
│               └── InvoicesPage.tsx
│
└── server/
    └── modules/
        └── invoices/
            ├── routes.ts          # Hono API routes
            └── db/
                └── schema.ts      # Drizzle schema

drizzle/
└── XXXX_add_invoices_table.sql   # Migration file
```

---

## Next Steps

Now that you understand the pattern, you can build any module:

- **Projects Module** - Track client projects with tasks
- **Time Tracking Module** - Log hours worked
- **Contacts Module** - Manage client contacts
- **Files Module** - Upload and manage files (R2)
- **Settings Module** - User preferences
- **Teams Module** - Multi-user collaboration
- **Live Chat Module** - Real-time messaging (Durable Objects)

Every module follows the same pattern:
1. Database schema
2. Migration
3. Shared Zod schemas
4. Backend Hono routes
5. Frontend TanStack Query hooks
6. React components
7. Page integration
8. Navigation link

---

**Happy module building! 🚀**
