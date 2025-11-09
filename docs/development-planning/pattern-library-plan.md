# Pattern Library Development Plan

Comprehensive guide for building reusable patterns in `/components/composed/`.

---

## Philosophy

**Build patterns as you need them, not speculatively.**

The patterns listed here are priorities based on common client application needs. Build them when:
1. You need them for a feature
2. You've used a similar pattern 3+ times
3. You can clearly define the pattern's purpose

---

## Priority 1: Data Display Patterns 🔥

**Why First:** Every business application displays collections of data. These patterns provide the most ROI.

### 1.1 DataTable Component

**Location:** `/components/composed/data-display/DataTable.tsx`

**Purpose:** Display tabular data with sorting, filtering, pagination, and actions

**Features:**
- Server-side sorting and filtering
- Column visibility toggles
- Bulk actions (select multiple)
- Expandable rows
- Column resizing
- Export (CSV/Excel)
- Empty states
- Loading states
- Mobile responsive

**Props:**
```typescript
interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  onRowClick?: (row: T) => void;
  onBulkAction?: (action: string, rows: T[]) => void;
  enableFiltering?: boolean;
  enableSorting?: boolean;
  enableColumnVisibility?: boolean;
  enableRowSelection?: boolean;
  enableExport?: boolean;
  emptyState?: React.ReactNode;
  loadingState?: React.ReactNode;
}
```

**Tech Stack:**
- TanStack Table (react-table v8)
- shadcn/ui Table components
- Server Actions for data fetching

**Reference:**
- [shadcn Data Table](https://ui.shadcn.com/docs/components/data-table)
- [TanStack Table Docs](https://tanstack.com/table/latest)

---

### 1.2 CardView Component

**Location:** `/components/composed/data-display/CardView.tsx`

**Purpose:** Display data in card/grid format

**Features:**
- Responsive grid layout
- Card actions (edit, delete, etc.)
- Image/icon support
- Status badges
- Hover states
- Empty states
- Loading skeleton

**Props:**
```typescript
interface CardViewProps<T> {
  items: T[];
  renderCard: (item: T) => React.ReactNode;
  columns?: { sm: number; md: number; lg: number; xl: number };
  onCardClick?: (item: T) => void;
  actions?: CardAction<T>[];
  emptyState?: React.ReactNode;
}
```

---

### 1.3 ListView Component

**Location:** `/components/composed/data-display/ListView.tsx`

**Purpose:** Simple list view for mobile-friendly data display

**Features:**
- Compact list items
- Avatars/icons
- Secondary text
- Right-side actions
- Infinite scroll support
- Grouped lists
- Sticky headers

**Props:**
```typescript
interface ListViewProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  onItemClick?: (item: T) => void;
  grouped?: boolean;
  groupBy?: (item: T) => string;
  emptyState?: React.ReactNode;
}
```

---

### 1.4 ViewSwitcher Component

**Location:** `/components/composed/data-display/ViewSwitcher.tsx`

**Purpose:** Toggle between different view types for the same data

**Features:**
- Table/Card/List view toggle
- Persists view preference
- Smooth transitions
- Icon indicators

**Props:**
```typescript
interface ViewSwitcherProps {
  views: ('table' | 'card' | 'list' | 'kanban' | 'calendar')[];
  currentView: string;
  onViewChange: (view: string) => void;
}
```

---

### 1.5 CollectionContainer Component

**Location:** `/components/composed/data-display/CollectionContainer.tsx`

**Purpose:** Container that orchestrates data display with header, filters, and view switching

**Features:**
- Combines header, filters, view switcher, and content
- Search bar
- Filter dropdown
- Sort controls
- Action buttons
- Responsive layout

**Props:**
```typescript
interface CollectionContainerProps<T> {
  title: string;
  data: T[];
  views: ViewConfig[];
  filters?: FilterConfig[];
  actions?: ActionButton[];
  onSearch?: (query: string) => void;
  onFilter?: (filters: FilterState) => void;
  onSort?: (field: string, direction: 'asc' | 'desc') => void;
}
```

**Example Usage:**
```typescript
<CollectionContainer
  title="Products"
  data={products}
  views={[
    { type: 'table', render: (data) => <DataTable data={data} columns={productColumns} /> },
    { type: 'card', render: (data) => <CardView items={data} renderCard={ProductCard} /> },
    { type: 'list', render: (data) => <ListView items={data} renderItem={ProductListItem} /> }
  ]}
  filters={[
    { field: 'category', label: 'Category', options: categories },
    { field: 'status', label: 'Status', options: ['active', 'draft'] }
  ]}
  actions={[
    { label: 'Add Product', onClick: openCreateDialog, icon: Plus }
  ]}
  onSearch={handleSearch}
  onFilter={handleFilter}
/>
```

---

## Priority 2: Layout Patterns 🏗️

**Why Second:** Consistent layouts speed up development and improve UX.

### 2.1 DashboardLayout Component

**Location:** `/components/composed/layouts/DashboardLayout.tsx`

**Features:**
- Collapsible sidebar
- Top navigation bar
- Mobile drawer
- Breadcrumbs
- User menu
- Notification center
- Search bar

---

### 2.2 PageHeader Component

**Location:** `/components/composed/layouts/PageHeader.tsx`

**Features:**
- Page title
- Description/subtitle
- Breadcrumbs
- Action buttons (right-aligned)
- Back button option
- Tab navigation option

**Props:**
```typescript
interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: Breadcrumb[];
  actions?: ActionButton[];
  backButton?: boolean;
  tabs?: TabConfig[];
}
```

---

### 2.3 SidebarNav Component

**Location:** `/components/composed/layouts/SidebarNav.tsx`

**Features:**
- Collapsible/expandable
- Nested navigation
- Active state highlighting
- Icon support
- Badge/notification counts
- Mobile-friendly drawer

---

### 2.4 ContentContainer Component

**Location:** `/components/composed/layouts/ContentContainer.tsx`

**Features:**
- Consistent padding/spacing
- Max-width constraints
- Background variants
- Centered or full-width options

---

## Priority 3: Form Patterns 📝

**Why Third:** Forms are everywhere, and good patterns save hours per feature.

### 3.1 FormField Component

**Location:** `/components/composed/forms/FormField.tsx`

**Purpose:** Consistent form field with label, input, error, and help text

**Features:**
- Label with required indicator
- Input/Textarea/Select integration
- Error message display
- Help text
- Character counter
- Proper accessibility

**Props:**
```typescript
interface FormFieldProps {
  label: string;
  name: string;
  required?: boolean;
  error?: string;
  helpText?: string;
  maxLength?: number;
  children: React.ReactNode;
}
```

---

### 3.2 MultiStepForm Component

**Location:** `/components/composed/forms/MultiStepForm.tsx`

**Purpose:** Wizard-style multi-step forms

**Features:**
- Step indicator
- Next/Previous navigation
- Progress bar
- Form validation per step
- Data persistence between steps
- Review step option

**Props:**
```typescript
interface MultiStepFormProps {
  steps: StepConfig[];
  onComplete: (data: FormData) => Promise<void>;
  onCancel?: () => void;
  persistData?: boolean;
}
```

---

### 3.3 FormActions Component

**Location:** `/components/composed/forms/FormActions.tsx`

**Purpose:** Consistent form button layout

**Features:**
- Save/Cancel buttons
- Loading states
- Disabled states
- Custom actions
- Sticky footer option

---

### 3.4 SearchableSelect Component

**Location:** `/components/composed/forms/SearchableSelect.tsx`

**Purpose:** Select with search/filter capability

**Features:**
- Fuzzy search
- Multi-select option
- Create new option
- Async loading
- Custom rendering

---

### 3.5 DateRangePicker Component

**Location:** `/components/composed/forms/DateRangePicker.tsx`

**Purpose:** Select date ranges with presets

**Features:**
- Preset ranges (Today, Last 7 days, etc.)
- Custom date selection
- Time selection option
- Clear button

---

## Priority 4: Feedback Patterns 💬

**Why Fourth:** Good feedback improves perceived performance and UX.

### 4.1 EmptyState Component

**Location:** `/components/composed/feedback/EmptyState.tsx`

**Features:**
- Icon/illustration
- Title and description
- Call-to-action button
- Multiple variants (no-data, no-results, error, no-permission)

**Props:**
```typescript
interface EmptyStateProps {
  variant: 'no-data' | 'no-results' | 'error' | 'no-permission';
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}
```

---

### 4.2 LoadingState Component

**Location:** `/components/composed/feedback/LoadingState.tsx`

**Features:**
- Skeleton loaders
- Spinner variants
- Progress bars
- Custom loading messages
- Full-page overlays

---

### 4.3 ErrorBoundary Component

**Location:** `/components/composed/feedback/ErrorBoundary.tsx`

**Features:**
- Catch React errors
- Custom error UI
- Reset functionality
- Error logging
- Fallback content

---

### 4.4 ConfirmDialog Component

**Location:** `/components/composed/feedback/ConfirmDialog.tsx`

**Purpose:** Consistent confirmation dialogs

**Features:**
- Variants (danger, warning, info)
- Custom messages
- Async actions
- Loading states
- Keyboard navigation

**Props:**
```typescript
interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  variant: 'danger' | 'warning' | 'info';
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => Promise<void>;
}
```

---

### 4.5 Toast Component

**Location:** `/components/composed/feedback/Toast.tsx`

**Features:**
- Success/Error/Warning/Info variants
- Auto-dismiss
- Action button
- Queued toasts
- Positioned correctly

**Note:** Consider using `sonner` library or shadcn's toast

---

## Priority 5: Media/Upload Patterns 🖼️

**Why Fifth:** File handling is common but tricky to get right.

### 5.1 FileUpload Component

**Location:** `/components/composed/media/FileUpload.tsx`

**Features:**
- Drag and drop
- Click to upload
- Multiple files
- File type validation
- Size validation
- Upload progress
- Preview thumbnails
- Error states
- Remove uploaded files

**Props:**
```typescript
interface FileUploadProps {
  accept?: string;
  maxSize?: number;
  maxFiles?: number;
  multiple?: boolean;
  onUpload: (files: File[]) => Promise<void>;
  onRemove?: (file: File) => void;
  existingFiles?: UploadedFile[];
}
```

---

### 5.2 ImageGallery Component

**Location:** `/components/composed/media/ImageGallery.tsx`

**Features:**
- Grid layout
- Lightbox/modal view
- Image zoom
- Navigation (prev/next)
- Thumbnails
- Delete/download actions
- Responsive grid

---

### 5.3 AvatarUpload Component

**Location:** `/components/composed/media/AvatarUpload.tsx`

**Features:**
- Circle preview
- Crop/resize UI
- Replace/remove
- Fallback initials
- Loading state

---

## Priority 6: Navigation Patterns 🧭

### 6.1 Breadcrumbs Component

**Location:** `/components/composed/navigation/Breadcrumbs.tsx`

**Features:**
- Hierarchical navigation
- Separators
- Current page indicator
- Overflow handling
- Mobile-friendly

---

### 6.2 Pagination Component

**Location:** `/components/composed/navigation/Pagination.tsx`

**Features:**
- Page numbers
- Previous/Next buttons
- Jump to page
- Items per page selector
- Total count display

---

### 6.3 Tabs Component

**Location:** `/components/composed/navigation/Tabs.tsx`

**Features:**
- Horizontal/vertical variants
- URL sync option
- Badge counts
- Disabled states
- Keyboard navigation

---

## Additional Patterns (Lower Priority)

### 7. Dashboard/Analytics Patterns

- **StatCard** - Metric display with trend
- **ChartContainer** - Consistent chart wrapper
- **ActivityFeed** - Timeline of events
- **ProgressTracker** - Multi-step progress

### 8. Content Patterns

- **RichTextEditor** - WYSIWYG editor (use Novel or Plate)
- **MarkdownEditor** - Split view editor
- **CodeBlock** - Syntax-highlighted code
- **VideoPlayer** - Custom video controls

### 9. Advanced Data Patterns

- **KanbanBoard** - Drag-drop columns (use dnd-kit)
- **CalendarView** - Event calendar
- **TimelineView** - Gantt-style timeline
- **TreeView** - Hierarchical data

### 10. Communication Patterns

- **CommentThread** - Nested comments
- **ChatInterface** - Message list
- **NotificationCenter** - Dropdown notifications
- **InboxView** - Email-style interface

---

## Implementation Strategy

### Phase 1: Foundation (Weeks 1-2)
Build as needed during client projects:
1. DataTable (you'll need this immediately)
2. PageHeader
3. EmptyState
4. LoadingState

### Phase 2: Forms & Feedback (Weeks 3-4)
1. FormField
2. ConfirmDialog
3. FileUpload
4. Toast system

### Phase 3: Views & Navigation (Weeks 5-6)
1. CardView
2. ListView
3. ViewSwitcher
4. Pagination
5. Breadcrumbs

### Phase 4: Advanced Layouts (Weeks 7-8)
1. DashboardLayout
2. SidebarNav
3. MultiStepForm
4. Advanced form components

### Phase 5: Media & Polish (Weeks 9+)
1. ImageGallery
2. AvatarUpload
3. Advanced data views
4. Nice-to-have patterns

---

## Pattern Documentation Template

For each pattern you build, document:

```markdown
# [Pattern Name]

## Purpose
Brief description of what problem this solves.

## When to Use
- Use case 1
- Use case 2
- Use case 3

## When NOT to Use
- Anti-pattern 1
- Anti-pattern 2

## Props
TypeScript interface with comments

## Examples
Code examples showing common usage

## Accessibility
ARIA labels, keyboard navigation, screen reader support

## Related Patterns
Links to similar or complementary patterns

## Implementation Notes
Any gotchas or important details
```

---

## Quality Checklist

Before considering a pattern "complete":

- [ ] TypeScript types are comprehensive
- [ ] Props are well-documented with JSDoc
- [ ] Accessibility tested (keyboard, screen reader)
- [ ] Mobile-responsive
- [ ] Loading states handled
- [ ] Error states handled
- [ ] Empty states handled
- [ ] Works with both light and dark mode
- [ ] Follows shadcn/ui design tokens
- [ ] Examples documented
- [ ] Used in at least 3 features (or planned for)

---

## Resources & Inspiration

### Component Libraries
- [shadcn/ui](https://ui.shadcn.com/)
- [shadcn/ui Pro](https://ui.shadcn.com/blocks)
- [Tremor](https://tremor.so/) - Charts and data viz
- [Magic UI](https://magicui.design/) - Animated components
- [Aceternity UI](https://ui.aceternity.com/) - Creative components

### Patterns & Best Practices
- [Radix UI](https://www.radix-ui.com/) - Accessible primitives
- [Headless UI](https://headlessui.com/) - Unstyled patterns
- [Ark UI](https://ark-ui.com/) - Framework-agnostic patterns

### Rich Text Editors
- [Novel](https://novel.sh/) - Notion-style editor
- [Plate](https://platejs.org/) - Powerful rich text framework
- [Tiptap](https://tiptap.dev/) - Headless editor

### Data Tables
- [TanStack Table](https://tanstack.com/table/latest)
- [AG Grid](https://www.ag-grid.com/) - Enterprise tables

### Drag & Drop
- [dnd kit](https://dndkit.com/)
- [pragmatic-drag-and-drop](https://github.com/atlassian/pragmatic-drag-and-drop)

### File Upload
- [react-dropzone](https://react-dropzone.js.org/)
- [uppy](https://uppy.io/)

### Date Pickers
- [react-day-picker](https://react-day-picker.js.org/)
- [date-fns](https://date-fns.org/)

---

## Next Steps

1. **Start with DataTable** - Build it for your first feature that needs it
2. **Document as you go** - Don't wait until the end
3. **Refactor after 3 uses** - Extract patterns when they prove useful
4. **Get feedback** - Use patterns in real projects
5. **Iterate** - Improve based on actual usage

Remember: **Good patterns emerge from solving real problems, not from speculation.**
