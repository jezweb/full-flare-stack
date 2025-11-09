# Component Decision Framework

Quick reference guide for deciding where components should live in the architecture.

---

## The Decision Tree

```
Start here: I need to create a component
    ↓
    Does shadcn/ui already provide this?
    ├─ YES → Use /components/ui/[component].tsx
    └─ NO → Continue
        ↓
        Does it have business logic or database access?
        ├─ YES → /modules/[feature]/components/
        └─ NO → Continue
            ↓
            Will it be used in 3+ different features?
            ├─ YES → /components/composed/[category]/
            ├─ MAYBE → Start in module, extract later
            └─ NO → Continue
                ↓
                Is it truly one-off?
                ├─ YES → /components/shared/ or inline
                └─ NO → Reconsider if it's actually a pattern
```

---

## Quick Reference Table

| Component Type | Location | Has Business Logic? | Reused Across Features? | Examples |
|---------------|----------|---------------------|------------------------|----------|
| UI Primitive | `/components/ui/` | ❌ No | ✅ Yes | Button, Input, Dialog |
| Composed Pattern | `/components/composed/` | ❌ No | ✅ Yes (3+) | DataTable, PageHeader, FileUpload |
| Feature Component | `/modules/[feature]/components/` | ✅ Yes | ❌ No | TodoList, UserProfile, ProductCard |
| Shared Component | `/components/shared/` | ❌ No | ❌ No | Logo, specific landing sections |

---

## Detailed Decision Criteria

### ✅ Put in `/components/ui/` when:

**Characteristics:**
- Single, unopinionated building block
- Part of shadcn/ui library
- No business logic
- Maximum flexibility needed
- Used everywhere

**Examples:**
- ✅ Button
- ✅ Input
- ✅ Dialog
- ✅ Card
- ✅ Select

**Anti-examples (DON'T put here):**
- ❌ LoginForm (has auth logic)
- ❌ UserCard (feature-specific)
- ❌ DataTable (opinionated pattern)

---

### ✅ Put in `/components/composed/` when:

**Characteristics:**
- Combines 2+ UI primitives
- Solves a common UI pattern
- NO business logic or database access
- Reusable across 3+ features
- Configured via props
- Emits events via callbacks

**Questions to ask:**
1. Does this solve a pattern I see repeatedly?
2. Can I use it in different features without modification?
3. Is it independent of business logic?
4. Would another developer expect to find this as a reusable pattern?

**Examples:**
- ✅ DataTable with sorting/filtering
- ✅ PageHeader with breadcrumbs
- ✅ FileUpload with drag-drop
- ✅ EmptyState with icon and CTA
- ✅ MultiStepForm wizard
- ✅ ConfirmDialog with form

**Anti-examples (DON'T put here):**
- ❌ TodoList (fetches todos from database)
- ❌ UserProfile (specific to user domain)
- ❌ ProductCheckout (has payment logic)
- ❌ AnalyticsDashboard (specific dashboard)

**The "3+ Rule":**
If you're not sure, start in the feature module. After you use it in 3 different features, extract it to composed patterns.

---

### ✅ Put in `/modules/[feature]/components/` when:

**Characteristics:**
- Domain-specific component
- Uses Server Actions
- Accesses database or external APIs
- Contains business logic
- Validates with feature-specific schemas
- Tied to a specific domain model

**Questions to ask:**
1. Does this component fetch or mutate data?
2. Is it specific to one business domain?
3. Does it use Server Actions from this module?
4. Would it make sense outside this feature?

**Examples:**
- ✅ TodoList (fetches/displays todos)
- ✅ UserProfile (user-specific data)
- ✅ ProductCard (product-specific)
- ✅ OrderSummary (order-specific)
- ✅ CommentThread (comment-specific)

**Structure within module:**
```typescript
/modules/todos/
├── components/
│   ├── TodoList.tsx          // Main list component
│   ├── TodoItem.tsx          // Individual item
│   ├── TodoForm.tsx          // Create/edit form
│   └── TodoFilters.tsx       // Filter controls
```

---

### ✅ Put in `/components/shared/` when:

**Characteristics:**
- Used once or twice
- Doesn't fit a broader pattern
- Simple, one-off need
- Not worth extracting to a pattern yet

**Examples:**
- ✅ Logo
- ✅ Specific landing page hero
- ✅ One-off marketing section
- ✅ Custom 404 page component

**Warning:** Don't let this become a dumping ground. If you find yourself with many "shared" components, they're probably patterns waiting to be extracted.

---

## Common Scenarios

### Scenario 1: "I need a table to display users"

**Analysis:**
- Displays data? → Feature component initially
- Will other features need tables? → Yes, extract pattern

**Decision:**
1. Start: `/modules/users/components/UserTable.tsx`
2. After using in 3 features: Extract to `/components/composed/data-display/DataTable.tsx`
3. Keep: `/modules/users/components/UserTable.tsx` as a wrapper with user-specific logic

**Result:**
```typescript
// Feature-specific wrapper
// /modules/users/components/UserTable.tsx
export function UserTable() {
  const users = await getUsers(); // Server Action
  
  return (
    <DataTable
      data={users}
      columns={userColumns}
      onRowClick={handleUserClick}
    />
  );
}

// Generic pattern
// /components/composed/data-display/DataTable.tsx
export function DataTable<T>({ data, columns, onRowClick }) {
  // Generic table logic with sorting, filtering, pagination
}
```

---

### Scenario 2: "I need a form to create todos"

**Analysis:**
- Has business logic (validation, submission)? → Yes
- Specific to todos? → Yes

**Decision:**
Put in `/modules/todos/components/TodoForm.tsx`

**Note:** If you later need a "ProductForm" and "UserForm" with similar patterns, extract the form PATTERN to `/components/composed/forms/FormContainer.tsx`

---

### Scenario 3: "I need to show 'no results' message"

**Analysis:**
- Will this be used everywhere? → Yes
- Does it have business logic? → No
- Is it a reusable pattern? → Yes

**Decision:**
Put in `/components/composed/feedback/EmptyState.tsx`

**Implementation:**
```typescript
// /components/composed/feedback/EmptyState.tsx
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  actionLabel
}) {
  return (
    <div>
      <Icon />
      <h3>{title}</h3>
      <p>{description}</p>
      {action && <Button onClick={action}>{actionLabel}</Button>}
    </div>
  );
}

// Usage in feature
// /modules/todos/components/TodoList.tsx
{todos.length === 0 && (
  <EmptyState
    icon={CheckSquare}
    title="No todos yet"
    description="Create your first todo to get started"
    action={openCreateDialog}
    actionLabel="Create Todo"
  />
)}
```

---

### Scenario 4: "I need a page layout with sidebar and header"

**Analysis:**
- Used across multiple pages? → Yes
- No business logic? → Correct
- Clear reusable pattern? → Yes

**Decision:**
Put in `/components/composed/layouts/DashboardLayout.tsx`

---

### Scenario 5: "I need to upload files for R2"

**Analysis:**
- Will multiple features need uploads? → Yes
- Has R2-specific logic? → Business logic in Server Action, UI in pattern

**Decision:**
1. Pattern: `/components/composed/media/FileUpload.tsx` (UI only)
2. Logic: `/modules/[feature]/actions/upload.ts` (R2 Server Action)

**Split:**
```typescript
// Pattern - handles UI only
// /components/composed/media/FileUpload.tsx
export function FileUpload({ onUpload, accept, maxSize }) {
  // Drag-drop UI, validation, progress
  // Calls the provided onUpload callback
}

// Feature - handles business logic
// /modules/documents/actions/upload.ts
export async function uploadDocument(file: File) {
  // R2 upload logic
  // Database record creation
  // Permission checks
}

// Usage in feature
// /modules/documents/components/DocumentUploader.tsx
export function DocumentUploader() {
  return (
    <FileUpload
      onUpload={uploadDocument}
      accept="application/pdf"
      maxSize={10 * 1024 * 1024}
    />
  );
}
```

---

## Red Flags

### 🚩 You're probably doing it wrong if:

1. **Composed pattern has Server Actions**
   - Move Server Actions to feature module
   - Pass callbacks via props

2. **Composed pattern imports from `/modules/`**
   - Reverse the dependency
   - Modules should import patterns, not vice versa

3. **UI primitive has opinions about layout**
   - Extract to composed pattern
   - Keep primitives flexible

4. **Feature component has no feature-specific logic**
   - Move to composed patterns
   - Make it generic

5. **Everything goes in `/components/shared/`**
   - Identify patterns
   - Extract to composed
   - Keep shared minimal

6. **Creating patterns speculatively**
   - Wait until you use it 3 times
   - Don't abstract prematurely
   - Prove the need first

---

## Testing Your Decision

Ask yourself:

1. **Can I describe this component in one sentence?**
   - If not, it might need to be split

2. **Does this component do ONE thing?**
   - Single Responsibility Principle applies

3. **Could another project use this exact component?**
   - If yes → Composed pattern
   - If no → Feature component

4. **Does it need to know about my database schema?**
   - If yes → Feature component
   - If no → Composed pattern or UI primitive

5. **Am I repeating this pattern?**
   - If yes (3+) → Extract to composed
   - If no → Keep in feature module

---

## Migration Path

**When you realize a component is in the wrong place:**

1. **Don't panic** - this is normal during development
2. **Document why you're moving it** - update this guide if needed
3. **Check dependencies** - what imports this component?
4. **Update imports** - use your IDE's refactor tools
5. **Test thoroughly** - especially if moving from module to composed

**Common migrations:**
- Feature component → Composed pattern (after 3rd use)
- Shared component → Composed pattern (when pattern emerges)
- Inline component → Shared component → Composed pattern (natural evolution)

---

## Summary Checklist

Before creating a component, ask:

- [ ] Does shadcn/ui provide this? → Use it
- [ ] Does it have business logic? → Feature module
- [ ] Will it be used 3+ times? → Composed pattern (or extract later)
- [ ] Is it truly one-off? → Shared or inline
- [ ] Can I clearly categorize it? → You're ready to build

**When in doubt:** Start in the feature module, extract to composed patterns after the 3rd use.
