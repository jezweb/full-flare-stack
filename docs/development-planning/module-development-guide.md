# Module Development Guide

Complete guide for building feature modules in the Next.js + Cloudflare architecture.

---

## What is a Feature Module?

A feature module is a self-contained domain feature that includes:
- **Business logic** (Server Actions)
- **UI components** (feature-specific)
- **Data models** (TypeScript types)
- **Validation schemas** (Zod)
- **Database interactions** (via Drizzle)
- **Custom hooks** (feature-specific)

---

## Module Structure

```
/modules/[feature-name]/
├── actions/              # Server Actions (mutations & queries)
│   ├── create-[entity].ts
│   ├── update-[entity].ts
│   ├── delete-[entity].ts
│   └── get-[entities].ts
│
├── components/           # Feature-specific UI components
│   ├── [Entity]List.tsx
│   ├── [Entity]Form.tsx
│   ├── [Entity]Card.tsx
│   └── [Entity]Details.tsx
│
├── hooks/               # Feature-specific React hooks
│   ├── use-[entity].ts
│   └── use-[entity]-form.ts
│
├── models/              # TypeScript type definitions
│   └── [entity].ts
│
├── schemas/             # Zod validation schemas
│   └── [entity].schema.ts
│
└── utils/               # Feature-specific utilities
    └── [entity]-helpers.ts
```

---

## Step-by-Step Module Creation

### Step 1: Define the Database Schema

**File:** `/db/schema.ts` (or feature-specific schema file)

```typescript
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { createId } from '@paralleldrive/cuid2';

export const products = sqliteTable('products', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  name: text('name').notNull(),
  description: text('description'),
  price: integer('price').notNull(), // Store as cents
  status: text('status', { enum: ['draft', 'active', 'archived'] })
    .notNull()
    .default('draft'),
  userId: text('user_id').notNull(),
  imageUrl: text('image_url'),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
});

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
```

**Then generate and apply migration:**
```bash
pnpm run db:generate:named "add_products_table"
pnpm run db:migrate:local
```

---

### Step 2: Create Type Models

**File:** `/modules/products/models/product.ts`

```typescript
import { Product, NewProduct } from '@/db/schema';

// Re-export database types
export type { Product, NewProduct };

// Add any additional types for the feature
export interface ProductWithUser extends Product {
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export interface ProductListItem {
  id: string;
  name: string;
  price: number;
  status: Product['status'];
  imageUrl: string | null;
  createdAt: Date;
}

export type ProductStatus = Product['status'];

export const PRODUCT_STATUSES: { value: ProductStatus; label: string }[] = [
  { value: 'draft', label: 'Draft' },
  { value: 'active', label: 'Active' },
  { value: 'archived', label: 'Archived' },
];
```

---

### Step 3: Create Validation Schemas

**File:** `/modules/products/schemas/product.schema.ts`

```typescript
import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().max(500).optional(),
  price: z.number().min(0, 'Price must be positive'),
  status: z.enum(['draft', 'active', 'archived']).default('draft'),
  imageUrl: z.string().url().optional().nullable(),
});

export const updateProductSchema = createProductSchema.partial().extend({
  id: z.string().cuid2(),
});

export const deleteProductSchema = z.object({
  id: z.string().cuid2(),
});

export const getProductSchema = z.object({
  id: z.string().cuid2(),
});

export const listProductsSchema = z.object({
  status: z.enum(['draft', 'active', 'archived']).optional(),
  search: z.string().optional(),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
});

// Infer types from schemas
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type DeleteProductInput = z.infer<typeof deleteProductSchema>;
export type GetProductInput = z.infer<typeof getProductSchema>;
export type ListProductsInput = z.infer<typeof listProductsSchema>;
```

---

### Step 4: Create Server Actions

**File:** `/modules/products/actions/create-product.ts`

```typescript
'use server';

import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { db } from '@/db';
import { products } from '@/db/schema';
import { auth } from '@/lib/auth';
import { 
  createProductSchema, 
  type CreateProductInput 
} from '../schemas/product.schema';

export async function createProduct(input: CreateProductInput) {
  try {
    // 1. Authenticate user
    const session = await auth();
    if (!session?.user) {
      return {
        success: false,
        error: 'Unauthorized',
      };
    }

    // 2. Validate input
    const validated = createProductSchema.parse(input);

    // 3. Perform database operation
    const [product] = await db
      .insert(products)
      .values({
        ...validated,
        userId: session.user.id,
      })
      .returning();

    // 4. Revalidate relevant paths
    revalidatePath('/dashboard/products');

    // 5. Return success response
    return {
      success: true,
      data: product,
    };
  } catch (error) {
    console.error('Failed to create product:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create product',
    };
  }
}
```

**File:** `/modules/products/actions/get-products.ts`

```typescript
'use server';

import { eq, like, and, desc } from 'drizzle-orm';
import { db } from '@/db';
import { products } from '@/db/schema';
import { auth } from '@/lib/auth';
import { 
  listProductsSchema, 
  type ListProductsInput 
} from '../schemas/product.schema';

export async function getProducts(input: ListProductsInput = {}) {
  try {
    // 1. Authenticate user
    const session = await auth();
    if (!session?.user) {
      return {
        success: false,
        error: 'Unauthorized',
        data: null,
      };
    }

    // 2. Validate input
    const validated = listProductsSchema.parse(input);

    // 3. Build query conditions
    const conditions = [eq(products.userId, session.user.id)];

    if (validated.status) {
      conditions.push(eq(products.status, validated.status));
    }

    if (validated.search) {
      conditions.push(like(products.name, `%${validated.search}%`));
    }

    // 4. Fetch data
    const data = await db
      .select()
      .from(products)
      .where(and(...conditions))
      .orderBy(desc(products.createdAt))
      .limit(validated.limit)
      .offset(validated.offset);

    // 5. Return success response
    return {
      success: true,
      data,
      error: null,
    };
  } catch (error) {
    console.error('Failed to fetch products:', error);
    
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : 'Failed to fetch products',
    };
  }
}
```

**File:** `/modules/products/actions/index.ts`

```typescript
// Barrel export for all actions
export { createProduct } from './create-product';
export { getProducts } from './get-products';
export { getProduct } from './get-product';
export { updateProduct } from './update-product';
export { deleteProduct } from './delete-product';
```

---

### Step 5: Create Custom Hooks (Optional)

**File:** `/modules/products/hooks/use-products.ts`

```typescript
import { useOptimistic } from 'react';
import { Product } from '../models/product';

export function useProducts(initialProducts: Product[]) {
  const [optimisticProducts, setOptimisticProducts] = useOptimistic(
    initialProducts,
    (state, newProduct: Product) => [...state, newProduct]
  );

  return {
    products: optimisticProducts,
    addOptimisticProduct: setOptimisticProducts,
  };
}
```

**File:** `/modules/products/hooks/use-product-form.ts`

```typescript
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { createProduct } from '../actions';
import { createProductSchema, type CreateProductInput } from '../schemas/product.schema';

export function useProductForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CreateProductInput>({
    resolver: zodResolver(createProductSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      status: 'draft',
      imageUrl: null,
    },
  });

  const onSubmit = async (data: CreateProductInput) => {
    setIsSubmitting(true);
    
    try {
      const result = await createProduct(data);
      
      if (result.success) {
        toast.success('Product created successfully');
        form.reset();
        return result.data;
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    isSubmitting,
    onSubmit: form.handleSubmit(onSubmit),
  };
}
```

---

### Step 6: Create UI Components

**File:** `/modules/products/components/ProductList.tsx`

```typescript
import { Suspense } from 'react';
import { getProducts } from '../actions';
import { DataTable } from '@/components/composed/data-display/DataTable';
import { productColumns } from './product-columns';
import { ProductListSkeleton } from './ProductListSkeleton';

export async function ProductList() {
  const result = await getProducts();

  if (!result.success) {
    return <div>Error: {result.error}</div>;
  }

  return (
    <DataTable
      data={result.data}
      columns={productColumns}
    />
  );
}

export function ProductListWithSuspense() {
  return (
    <Suspense fallback={<ProductListSkeleton />}>
      <ProductList />
    </Suspense>
  );
}
```

**File:** `/modules/products/components/ProductForm.tsx`

```typescript
'use client';

import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useProductForm } from '../hooks/use-product-form';
import { PRODUCT_STATUSES } from '../models/product';

interface ProductFormProps {
  onSuccess?: () => void;
}

export function ProductForm({ onSuccess }: ProductFormProps) {
  const { form, isSubmitting, onSubmit } = useProductForm();

  const handleSubmit = async (data: any) => {
    const result = await onSubmit(data);
    if (result && onSuccess) {
      onSuccess();
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter product name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Enter product description" 
                  {...field} 
                  value={field.value ?? ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price ($)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  step="0.01"
                  {...field} 
                  onChange={(e) => field.onChange(parseFloat(e.target.value) * 100)}
                  value={field.value ? field.value / 100 : 0}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {PRODUCT_STATUSES.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => form.reset()}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Product'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
```

---

### Step 7: Create Page Route

**File:** `/app/dashboard/products/page.tsx`

```typescript
import { PageHeader } from '@/components/composed/layouts/PageHeader';
import { ProductListWithSuspense } from '@/modules/products/components/ProductList';
import { CreateProductButton } from '@/modules/products/components/CreateProductButton';

export default function ProductsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Products"
        description="Manage your products"
        actions={[
          <CreateProductButton key="create" />
        ]}
      />
      
      <ProductListWithSuspense />
    </div>
  );
}
```

---

## Best Practices

### 1. Server Actions

✅ **Do:**
- Always authenticate users first
- Validate input with Zod schemas
- Return consistent response shape: `{ success, data, error }`
- Use try-catch for error handling
- Revalidate paths after mutations
- Log errors for debugging

❌ **Don't:**
- Expose sensitive data in error messages
- Skip input validation
- Forget to check permissions
- Return raw database errors to client

### 2. Type Safety

✅ **Do:**
- Use Drizzle's `$inferSelect` and `$inferInsert`
- Create Zod schemas for all inputs
- Infer types from Zod schemas
- Export types from models

❌ **Don't:**
- Use `any` types
- Duplicate type definitions
- Skip validation

### 3. Component Design

✅ **Do:**
- Keep components focused (single responsibility)
- Use Server Components by default
- Add 'use client' only when needed
- Extract reusable patterns to composed components
- Use Suspense for async Server Components

❌ **Don't:**
- Mix client and server logic
- Fetch data in Client Components
- Create massive components
- Skip loading/error states

### 4. File Organization

✅ **Do:**
- One action per file
- Barrel exports (`index.ts`) for convenience
- Co-locate related files
- Use consistent naming conventions

❌ **Don't:**
- Put everything in one file
- Mix feature code across modules
- Use inconsistent naming

### 5. Error Handling

✅ **Do:**
- Provide user-friendly error messages
- Log detailed errors server-side
- Handle errors at action level
- Show toast notifications

❌ **Don't:**
- Expose implementation details
- Crash without feedback
- Ignore errors

---

## Action Response Pattern

**Standard response format:**

```typescript
type ActionResponse<T = unknown> = {
  success: true;
  data: T;
  error?: never;
} | {
  success: false;
  data?: never;
  error: string;
};
```

**Usage:**

```typescript
export async function myAction(input: Input): Promise<ActionResponse<Output>> {
  try {
    // ... logic
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: 'Error message' };
  }
}
```

---

## Testing Checklist

Before considering a module complete:

- [ ] Database schema created and migrated
- [ ] All CRUD operations implemented
- [ ] Input validation with Zod
- [ ] Authentication checks in place
- [ ] Error handling comprehensive
- [ ] Loading states implemented
- [ ] Empty states implemented
- [ ] TypeScript types exported
- [ ] Reusable patterns extracted
- [ ] Page routes created
- [ ] Tested in development
- [ ] Migration tested

---

## Common Patterns

### Pattern: Soft Delete

```typescript
// Schema
export const products = sqliteTable('products', {
  // ... other fields
  deletedAt: integer('deleted_at', { mode: 'timestamp' }),
});

// Action
export async function deleteProduct(input: DeleteProductInput) {
  const result = await db
    .update(products)
    .set({ deletedAt: new Date() })
    .where(eq(products.id, input.id))
    .returning();
  
  // ...
}

// Query (exclude deleted)
const data = await db
  .select()
  .from(products)
  .where(
    and(
      eq(products.userId, userId),
      isNull(products.deletedAt) // Exclude soft-deleted
    )
  );
```

### Pattern: Optimistic Updates

```typescript
'use client';

import { useOptimistic } from 'react';
import { createProduct } from '../actions';

export function ProductList({ initialProducts }) {
  const [products, addOptimistic] = useOptimistic(
    initialProducts,
    (state, newProduct) => [...state, newProduct]
  );

  const handleCreate = async (data) => {
    // Optimistically add
    addOptimistic({ ...data, id: 'temp-id' });
    
    // Actually create
    const result = await createProduct(data);
    
    // UI automatically updates when server responds
  };

  return (
    <div>
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
```

### Pattern: Pagination

```typescript
export async function getProducts(input: ListProductsInput) {
  const { limit = 20, offset = 0 } = input;

  const [data, [{ count }]] = await Promise.all([
    db
      .select()
      .from(products)
      .limit(limit)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)` })
      .from(products)
  ]);

  return {
    success: true,
    data: {
      items: data,
      total: count,
      hasMore: offset + limit < count,
    },
  };
}
```

---

## Migration Strategy

When refactoring existing code into modules:

1. **Identify the feature boundary**
2. **Create the module structure**
3. **Move actions first**
4. **Then move components**
5. **Update imports**
6. **Test thoroughly**
7. **Delete old files**

---

## Next Steps

After creating your first module:

1. **Extract patterns** - Did you create reusable components?
2. **Document edge cases** - What gotchas did you find?
3. **Refactor** - Can you simplify anything?
4. **Share learnings** - Update this guide with new patterns

---

## Quick Reference

**Create new module:**
```bash
# Create structure
mkdir -p src/modules/[feature]/{actions,components,hooks,models,schemas,utils}

# Create schema in db/schema.ts
# Generate migration
pnpm run db:generate:named "add_[feature]_table"

# Apply migration
pnpm run db:migrate:local
```

**File naming conventions:**
- Actions: `create-[entity].ts`, `get-[entities].ts`
- Components: `[Entity]List.tsx`, `[Entity]Form.tsx`
- Hooks: `use-[entity].ts`, `use-[entity]-form.ts`
- Models: `[entity].ts`
- Schemas: `[entity].schema.ts`
