# Composed Patterns Development Roadmap

Build order and dependencies for Layer 2 (composed patterns) based on the three-layer architecture.

**Last Updated:** 2025-11-10
**Status:** Foundation complete, ready to build patterns

---

## 🎯 Build Strategy

**Golden Rule:** Build patterns as you need them, not speculatively.

### When to Build a Pattern

1. **After 3rd use** - You've used similar code in 3 different features
2. **Clear reuse case** - Other features will obviously need this
3. **No business logic** - Pattern can be made generic with props
4. **Dependencies ready** - All required shadcn primitives are installed

### How to Build

1. Create pattern in `/components/composed/[category]/[Pattern].tsx`
2. Use only Layer 1 primitives (shadcn/ui components)
3. Accept data via props, emit events via callbacks
4. NO Server Actions, NO database access
5. Document with PATTERN_TEMPLATE.md
6. Use in at least 3 features before considering it "proven"

---

## 📋 Priority 1: Data Display Patterns

**Why First:** Every feature displays data. These provide maximum ROI.

**Build Order:** Build when you create your first feature that needs data display (products, users, orders, etc.)

---

### 1.1 DataTable ⚡ HIGHEST PRIORITY

**Location:** `/components/composed/data-display/DataTable.tsx`

**Dependencies (shadcn):**
- ✅ table
- ✅ pagination
- ✅ checkbox (for row selection)
- ✅ badge (for status columns)
- ✅ dropdown-menu (for row actions)
- ✅ button
- ✅ input (for search/filters)

**Features to Implement:**
- [ ] Basic table with columns
- [ ] Sortable columns (client-side)
- [ ] Pagination controls
- [ ] Row selection (single/multiple)
- [ ] Column visibility toggle
- [ ] Search/filter input
- [ ] Row actions dropdown
- [ ] Empty state
- [ ] Loading state
- [ ] Mobile responsive (card view on mobile)
- [ ] Export to CSV (optional)

**Tech Stack:**
- TanStack Table v8
- Zod for column definitions (optional)
- Server Actions for data fetching (passed as props)

**Reference:**
- shadcn Data Table: https://ui.shadcn.com/docs/components/data-table
- TanStack Table: https://tanstack.com/table/latest

**Usage Example:**
```typescript
// Feature component (Layer 3)
export async function ProductList() {
  const products = await getProducts();

  return (
    <DataTable
      data={products}
      columns={productColumns}
      enableSorting
      enableFiltering
      enableRowSelection
      onRowClick={(product) => router.push(`/products/${product.id}`)}
    />
  );
}
```

**Build Trigger:** Create this when building your first CRUD feature module.

---

### 1.2 ViewSwitcher ⚡ HIGH PRIORITY

**Location:** `/components/composed/data-display/ViewSwitcher.tsx`

**Dependencies (shadcn):**
- ✅ toggle-group

**Features to Implement:**
- [ ] Toggle between views (table/card/list/kanban/calendar)
- [ ] Persist preference to localStorage
- [ ] Icon indicators for each view
- [ ] Active state styling
- [ ] Responsive (hide labels on mobile)

**Usage Example:**
```typescript
<ViewSwitcher
  views={['table', 'card', 'list']}
  currentView={view}
  onViewChange={setView}
/>
```

**Build Trigger:** Build immediately after DataTable (you'll want alternative views).

---

### 1.3 CardView

**Location:** `/components/composed/data-display/CardView.tsx`

**Dependencies (shadcn):**
- ✅ card
- ✅ badge
- ✅ button
- ✅ dropdown-menu
- ✅ avatar

**Features to Implement:**
- [ ] Responsive grid layout
- [ ] Card actions menu
- [ ] Image/icon support
- [ ] Status badges
- [ ] Hover effects
- [ ] Empty state
- [ ] Loading skeleton

**Usage Example:**
```typescript
<CardView
  items={products}
  columns={{ sm: 1, md: 2, lg: 3, xl: 4 }}
  renderCard={(product) => (
    <ProductCard product={product} />
  )}
  actions={[
    { label: 'Edit', onClick: handleEdit },
    { label: 'Delete', onClick: handleDelete }
  ]}
/>
```

**Build Trigger:** After ViewSwitcher, when you want grid view option.

---

### 1.4 ListView

**Location:** `/components/composed/data-display/ListView.tsx`

**Dependencies (shadcn):**
- ✅ separator
- ✅ avatar
- ✅ badge
- ✅ button

**Features to Implement:**
- [ ] Compact list items
- [ ] Avatar/icon support
- [ ] Secondary text
- [ ] Right-side actions
- [ ] Grouped lists with headers
- [ ] Sticky section headers
- [ ] Empty state

**Usage Example:**
```typescript
<ListView
  items={users}
  grouped
  groupBy={(user) => user.role}
  renderItem={(user) => (
    <UserListItem user={user} />
  )}
/>
```

**Build Trigger:** After CardView, for mobile-friendly alternative.

---

### 1.5 CollectionContainer

**Location:** `/components/composed/data-display/CollectionContainer.tsx`

**Dependencies (shadcn):**
- ✅ All above patterns
- ✅ input (search)
- ✅ select (filters)
- ✅ button (actions)

**Features to Implement:**
- [ ] Page header with title/actions
- [ ] Search bar
- [ ] Filter controls
- [ ] Sort dropdown
- [ ] View switcher integration
- [ ] Content area (renders active view)
- [ ] Loading/error/empty states

**Usage Example:**
```typescript
<CollectionContainer
  title="Products"
  data={products}
  views={[
    { type: 'table', render: (data) => <DataTable data={data} columns={columns} /> },
    { type: 'card', render: (data) => <CardView items={data} renderCard={ProductCard} /> }
  ]}
  filters={[
    { field: 'category', label: 'Category', options: categories },
    { field: 'status', label: 'Status', options: ['active', 'draft'] }
  ]}
  actions={[{ label: 'Add Product', onClick: openDialog, icon: Plus }]}
  onSearch={handleSearch}
/>
```

**Build Trigger:** After all data display patterns, when you want turnkey collection pages.

---

## 📋 Priority 2: Layout Patterns

**Why Second:** Consistent layouts speed up every feature.

**Build Order:** Build after first 2-3 features reveal common layout needs.

---

### 2.1 PageHeader ⚡ HIGH PRIORITY

**Location:** `/components/composed/layouts/PageHeader.tsx`

**Dependencies (shadcn):**
- ✅ breadcrumb
- ✅ tabs
- ✅ button
- ✅ separator

**Features to Implement:**
- [ ] Page title + description
- [ ] Breadcrumbs
- [ ] Action buttons (right-aligned)
- [ ] Back button (optional)
- [ ] Tab navigation (optional)
- [ ] Responsive (stack on mobile)

**Usage Example:**
```typescript
<PageHeader
  title="Products"
  description="Manage your product catalog"
  breadcrumbs={[
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Products', href: '/products' }
  ]}
  actions={[
    <Button key="export">Export</Button>,
    <Button key="add" onClick={openDialog}>Add Product</Button>
  ]}
  tabs={[
    { label: 'All', value: 'all', href: '/products' },
    { label: 'Active', value: 'active', href: '/products?status=active' }
  ]}
/>
```

**Build Trigger:** Immediately, you'll use this on every page.

---

### 2.2 DashboardLayout

**Location:** `/components/composed/layouts/DashboardLayout.tsx`

**Dependencies (shadcn):**
- ✅ sidebar
- ✅ navigation-menu
- ✅ dropdown-menu
- ✅ avatar
- ✅ scroll-area

**Features to Implement:**
- [ ] Collapsible sidebar
- [ ] Top navigation bar
- [ ] Mobile drawer
- [ ] User menu
- [ ] Breadcrumbs integration
- [ ] Content area
- [ ] Footer (optional)

**Build Trigger:** Already exists (via layouts module). May need refinement.

---

### 2.3 SidebarNav

**Location:** `/components/composed/layouts/SidebarNav.tsx`

**Dependencies (shadcn):**
- ✅ sidebar
- ✅ scroll-area
- ✅ badge
- ✅ separator

**Features to Implement:**
- [ ] Nested navigation items
- [ ] Active state highlighting
- [ ] Icon support
- [ ] Badge/notification counts
- [ ] Collapsible groups
- [ ] Mobile-friendly

**Build Trigger:** Already exists (via layouts module). May need refinement.

---

## 📋 Priority 3: Form Patterns

**Why Third:** Forms are everywhere, good patterns save hours per feature.

**Build Order:** Build as you encounter complex form needs.

---

### 3.1 SearchableSelect (Combobox) ⚡ HIGH PRIORITY

**Location:** `/components/composed/forms/SearchableSelect.tsx`

**Dependencies (shadcn):**
- ✅ command
- ✅ popover
- ✅ button

**Features to Implement:**
- [ ] Search/filter options
- [ ] Keyboard navigation
- [ ] Multi-select mode (optional)
- [ ] Create new option (optional)
- [ ] Async loading support
- [ ] Custom option rendering
- [ ] Clear selection

**Reference:**
- shadcn Combobox: https://ui.shadcn.com/docs/components/combobox

**Usage Example:**
```typescript
<SearchableSelect
  options={users}
  value={selectedUser}
  onValueChange={setSelectedUser}
  placeholder="Select user..."
  searchPlaceholder="Search users..."
  renderOption={(user) => (
    <div className="flex items-center gap-2">
      <Avatar src={user.avatar} />
      <span>{user.name}</span>
    </div>
  )}
/>
```

**Build Trigger:** When you need to select from 10+ options (categories, users, tags).

---

### 3.2 DateRangePicker

**Location:** `/components/composed/forms/DateRangePicker.tsx`

**Dependencies (shadcn):**
- ✅ calendar
- ✅ popover
- ✅ button

**Features to Implement:**
- [ ] Date range selection
- [ ] Preset ranges (Today, Last 7 days, Last 30 days, etc.)
- [ ] Clear selection
- [ ] Timezone aware
- [ ] Min/max date constraints
- [ ] Format customization

**Usage Example:**
```typescript
<DateRangePicker
  value={dateRange}
  onValueChange={setDateRange}
  presets={[
    { label: 'Today', value: { from: today, to: today } },
    { label: 'Last 7 days', value: { from: sevenDaysAgo, to: today } }
  ]}
/>
```

**Build Trigger:** When building reports/analytics features.

---

### 3.3 FormField Enhancement

**Location:** `/components/composed/forms/FormField.tsx`

**Dependencies (shadcn):**
- ✅ form
- ✅ label
- ✅ All input primitives

**Features to Implement:**
- [ ] Unified field wrapper
- [ ] Required indicator
- [ ] Character counter
- [ ] Help text
- [ ] Error message display
- [ ] Field-level loading state

**Usage Example:**
```typescript
<FormField
  label="Product Name"
  name="name"
  required
  helpText="This will be visible to customers"
  maxLength={100}
>
  <Input {...field} />
</FormField>
```

**Build Trigger:** After building 2-3 forms with repetitive field markup.

---

### 3.4 MultiStepForm

**Location:** `/components/composed/forms/MultiStepForm.tsx`

**Dependencies (shadcn):**
- ✅ tabs
- ✅ accordion
- ✅ progress
- ✅ button
- ✅ form

**Features to Implement:**
- [ ] Step indicator with progress
- [ ] Next/Previous navigation
- [ ] Per-step validation
- [ ] Data persistence between steps
- [ ] Review step
- [ ] Save draft functionality

**Usage Example:**
```typescript
<MultiStepForm
  steps={[
    { title: 'Basic Info', component: BasicInfoStep },
    { title: 'Pricing', component: PricingStep },
    { title: 'Review', component: ReviewStep }
  ]}
  onComplete={handleSubmit}
  persistData
/>
```

**Build Trigger:** When building onboarding or complex creation flows.

---

### 3.5 FormActions

**Location:** `/components/composed/forms/FormActions.tsx`

**Dependencies (shadcn):**
- ✅ button
- ✅ separator

**Features to Implement:**
- [ ] Save/Cancel buttons
- [ ] Loading states
- [ ] Disabled states
- [ ] Custom actions
- [ ] Sticky footer (optional)
- [ ] Responsive layout

**Usage Example:**
```typescript
<FormActions
  onSave={handleSubmit}
  onCancel={closeDialog}
  isSubmitting={isSubmitting}
  isDirty={form.formState.isDirty}
  actions={[
    { label: 'Save as Draft', onClick: saveDraft, variant: 'outline' }
  ]}
/>
```

**Build Trigger:** After building 2-3 forms with similar button layouts.

---

## 📋 Priority 4: Feedback Patterns

**Why Fourth:** Good feedback improves UX and perceived performance.

**Build Order:** Build as you encounter the need for consistent feedback.

---

### 4.1 EmptyState ⚡ HIGH PRIORITY

**Location:** `/components/composed/feedback/EmptyState.tsx`

**Dependencies (shadcn):**
- ✅ alert
- ✅ button

**Features to Implement:**
- [ ] Icon/illustration
- [ ] Title and description
- [ ] Call-to-action button
- [ ] Variants (no-data, no-results, error, no-permission)
- [ ] Custom rendering

**Usage Example:**
```typescript
<EmptyState
  variant="no-data"
  icon={Package}
  title="No products yet"
  description="Get started by creating your first product"
  action={{
    label: 'Add Product',
    onClick: openCreateDialog
  }}
/>
```

**Build Trigger:** Immediately, you'll use this everywhere.

---

### 4.2 LoadingState

**Location:** `/components/composed/feedback/LoadingState.tsx`

**Dependencies (shadcn):**
- ✅ skeleton
- ✅ progress

**Features to Implement:**
- [ ] Skeleton loaders (table, card, list)
- [ ] Spinner variants
- [ ] Progress bar
- [ ] Loading messages
- [ ] Full-page overlay option

**Usage Example:**
```typescript
<LoadingState
  variant="table"
  rows={5}
  message="Loading products..."
/>
```

**Build Trigger:** Immediately, for Suspense fallbacks.

---

### 4.3 ConfirmDialog

**Location:** `/components/composed/feedback/ConfirmDialog.tsx`

**Dependencies (shadcn):**
- ✅ alert-dialog
- ✅ button

**Features to Implement:**
- [ ] Variants (danger, warning, info)
- [ ] Custom title/description
- [ ] Async action support
- [ ] Loading state during action
- [ ] Keyboard shortcuts (Enter/Esc)

**Usage Example:**
```typescript
<ConfirmDialog
  open={confirmOpen}
  onOpenChange={setConfirmOpen}
  variant="danger"
  title="Delete Product"
  description="This action cannot be undone. This will permanently delete the product."
  confirmLabel="Delete"
  onConfirm={async () => {
    await deleteProduct(id);
    toast.success('Product deleted');
  }}
/>
```

**Build Trigger:** When implementing delete actions.

---

### 4.4 Toast System

**Location:** Already provided by `sonner`

**Usage:**
```typescript
import { toast } from 'sonner';

toast.success('Product created successfully');
toast.error('Failed to create product');
toast.info('Feature coming soon');
toast.warning('Unsaved changes');
```

**Build Trigger:** Already available, just document usage patterns.

---

## 📋 Priority 5: Media/Upload Patterns

**Why Fifth:** File handling is common but requires careful implementation.

**Build Order:** Build when implementing file upload features.

---

### 5.1 FileUpload

**Location:** `/components/composed/media/FileUpload.tsx`

**Dependencies (shadcn):**
- ✅ button
- ✅ progress
- ✅ badge
- ✅ card

**External Dependencies:**
- react-dropzone (optional, for better DX)
- R2 integration (via Server Action)

**Features to Implement:**
- [ ] Drag and drop zone
- [ ] Click to upload
- [ ] Multiple file support
- [ ] File type validation
- [ ] Size validation
- [ ] Upload progress
- [ ] Preview thumbnails
- [ ] Remove files
- [ ] Error states

**Usage Example:**
```typescript
<FileUpload
  accept="image/*"
  maxSize={5 * 1024 * 1024} // 5MB
  maxFiles={5}
  onUpload={async (files) => {
    const result = await uploadToR2(files);
    return result;
  }}
  existingFiles={product.images}
  onRemove={handleRemoveImage}
/>
```

**Build Trigger:** When building features with image/file uploads.

---

### 5.2 ImageGallery

**Location:** `/components/composed/media/ImageGallery.tsx`

**Dependencies (shadcn):**
- ✅ dialog
- ✅ button
- ✅ card

**Features to Implement:**
- [ ] Grid layout
- [ ] Lightbox/modal view
- [ ] Image zoom
- [ ] Navigation (prev/next)
- [ ] Thumbnails
- [ ] Delete action
- [ ] Download action
- [ ] Responsive grid

**Build Trigger:** When displaying multiple images per item.

---

### 5.3 AvatarUpload

**Location:** `/components/composed/media/AvatarUpload.tsx`

**Dependencies (shadcn):**
- ✅ avatar
- ✅ button
- ✅ dialog

**External Dependencies:**
- react-image-crop (for cropping)

**Features to Implement:**
- [ ] Circle preview
- [ ] Crop/resize UI
- [ ] Replace/remove
- [ ] Fallback initials
- [ ] Loading state
- [ ] Upload to R2

**Build Trigger:** When implementing user profiles or team members.

---

## 📋 Priority 6: Navigation Patterns

**Build Order:** As needed for complex navigation.

---

### 6.1 Breadcrumbs (Wrapper)

**Location:** `/components/composed/navigation/Breadcrumbs.tsx`

**Dependencies (shadcn):**
- ✅ breadcrumb

**Features to Implement:**
- [ ] Auto-generate from route
- [ ] Custom labels
- [ ] Overflow handling
- [ ] Mobile responsive

**Build Trigger:** Low priority (shadcn breadcrumb is already good).

---

### 6.2 Pagination (Enhanced)

**Location:** `/components/composed/navigation/Pagination.tsx`

**Dependencies (shadcn):**
- ✅ pagination
- ✅ select

**Features to Implement:**
- [ ] Items per page selector
- [ ] Jump to page input
- [ ] Total count display
- [ ] First/last buttons
- [ ] Responsive (compact on mobile)

**Build Trigger:** When DataTable pagination needs enhancement.

---

## 🎯 Build Phases

### Phase 1: Foundation (Week 1-2)

**Build when creating first CRUD feature:**
1. ✅ PageHeader
2. ✅ EmptyState
3. ✅ LoadingState
4. ✅ DataTable
5. ✅ ViewSwitcher

**Outcome:** Can build complete feature pages with data display.

---

### Phase 2: Forms & Actions (Week 3-4)

**Build when creating second feature with forms:**
1. ✅ FormField (enhanced)
2. ✅ FormActions
3. ✅ ConfirmDialog
4. ✅ SearchableSelect (Combobox)

**Outcome:** Can build complex forms with rich interactions.

---

### Phase 3: Alternative Views (Week 5-6)

**Build when users request different data views:**
1. ✅ CardView
2. ✅ ListView
3. ✅ CollectionContainer
4. ✅ DateRangePicker (if needed)

**Outcome:** Flexible data display options.

---

### Phase 4: Advanced Features (Week 7+)

**Build as specific needs arise:**
1. ✅ MultiStepForm (if building onboarding)
2. ✅ FileUpload (if uploading files)
3. ✅ ImageGallery (if displaying images)
4. ✅ Command Palette (for power users)

**Outcome:** Polish and advanced UX features.

---

## 📊 Progress Tracking

| Pattern | Priority | Dependencies Ready | Status | Built Date |
|---------|----------|-------------------|--------|------------|
| DataTable | P1 | ✅ | ⏸️ Not started | - |
| ViewSwitcher | P1 | ✅ | ⏸️ Not started | - |
| CardView | P1 | ✅ | ⏸️ Not started | - |
| ListView | P1 | ✅ | ⏸️ Not started | - |
| CollectionContainer | P1 | ✅ | ⏸️ Not started | - |
| PageHeader | P2 | ✅ | ⏸️ Not started | - |
| DashboardLayout | P2 | ✅ | ✅ Exists | 2025-11-08 |
| SidebarNav | P2 | ✅ | ✅ Exists | 2025-11-08 |
| SearchableSelect | P3 | ✅ | ⏸️ Not started | - |
| DateRangePicker | P3 | ✅ | ⏸️ Not started | - |
| FormField | P3 | ✅ | ⏸️ Not started | - |
| MultiStepForm | P3 | ✅ | ⏸️ Not started | - |
| FormActions | P3 | ✅ | ⏸️ Not started | - |
| EmptyState | P4 | ✅ | ⏸️ Not started | - |
| LoadingState | P4 | ✅ | ⏸️ Not started | - |
| ConfirmDialog | P4 | ✅ | ⏸️ Not started | - |
| FileUpload | P5 | ✅ | ⏸️ Not started | - |
| ImageGallery | P5 | ✅ | ⏸️ Not started | - |
| AvatarUpload | P5 | ✅ | ⏸️ Not started | - |

---

## 🔄 Pattern Review Schedule

After building each pattern:

1. **Document it** - Use PATTERN_TEMPLATE.md
2. **Test in 3 features** - Ensure it's truly reusable
3. **Refine API** - Improve props based on usage
4. **Add to examples** - Create usage examples
5. **Mark complete** - Update progress table

---

## 📚 Resources

**Official References:**
- shadcn/ui Components: https://ui.shadcn.com/docs/components
- shadcn/ui Pro Blocks: https://ui.shadcn.com/blocks
- TanStack Table: https://tanstack.com/table/latest
- React Hook Form: https://react-hook-form.com/

**Inspiration:**
- Tremor: https://tremor.so/ (Data viz)
- Magic UI: https://magicui.design/ (Animated components)
- Aceternity UI: https://ui.aceternity.com/ (Creative components)

**Related Docs:**
- [Component Inventory](./COMPONENT_INVENTORY.md) - All installed primitives
- [Pattern Library Plan](./development-planning/pattern-library-plan.md) - Detailed specs
- [Component Decision Framework](./development-planning/component-decision-framework.md) - Where to put components
- [Module Development Guide](./development-planning/module-development-guide.md) - Building features

---

**Next Action:** Start building your first feature module (e.g., products, invoices, tasks). Extract DataTable pattern when you need it in the 3rd feature.
