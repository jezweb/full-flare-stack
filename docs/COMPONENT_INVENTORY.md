# shadcn/ui Component Inventory

Complete inventory of installed shadcn/ui components (Layer 1: UI Primitives) and their role in the three-layer architecture.

**Last Updated:** 2025-11-10
**Total Components:** 43

---

## 📊 Component Categories

### Forms & Inputs (13 components)

| Component | File | Purpose | Used In Patterns |
|-----------|------|---------|------------------|
| **button** | `button.tsx` | Interactive buttons | All patterns, FormActions, PageHeader |
| **input** | `input.tsx` | Text input | FormField, SearchableSelect, DataTable filters |
| **textarea** | `textarea.tsx` | Multi-line text | FormField, rich text patterns |
| **select** | `select.tsx` | Dropdown selection | FormField, filters, status selectors |
| **checkbox** | `checkbox.tsx` | Boolean selection | DataTable row selection, FormField |
| **label** | `label.tsx` | Form labels | FormField, all forms |
| **form** | `form.tsx` | Form context (React Hook Form) | All form patterns |
| **radio-group** | `radio-group.tsx` | Single selection from visible options | FormField, filter controls, plan selectors |
| **slider** | `slider.tsx` | Range input | Price filters, settings, volume controls |
| **switch** | `switch.tsx` | Toggle on/off | Settings, feature toggles, dark mode |
| **calendar** | `calendar.tsx` | Date selection | DateRangePicker, DatePicker patterns |
| **toggle** | `toggle.tsx` | Toggle button state | Text formatting, active filters |
| **toggle-group** | `toggle-group.tsx` | Exclusive/multiple toggle selection | ViewSwitcher, toolbar controls |

---

### Data Display (6 components)

| Component | File | Purpose | Used In Patterns |
|-----------|------|---------|------------------|
| **card** | `card.tsx` | Container with sections | CardView, dashboard widgets, product cards |
| **table** | `table.tsx` | Tabular data display | DataTable, CollectionContainer table view |
| **pagination** | `pagination.tsx` | Page navigation | DataTable, ListView, any paginated content |
| **badge** | `badge.tsx` | Status indicators | DataTable columns, status displays, counts |
| **avatar** | `avatar.tsx` | User images | User menus, lists, comment threads |
| **separator** | `separator.tsx` | Visual dividers | Layouts, menus, sections |

---

### Overlays & Popups (8 components)

| Component | File | Purpose | Used In Patterns |
|-----------|------|---------|------------------|
| **dialog** | `dialog.tsx` | Modal dialogs | Forms, detail views, confirmations |
| **alert-dialog** | `alert-dialog.tsx` | Confirmation dialogs | ConfirmDialog pattern, delete confirmations |
| **sheet** | `sheet.tsx` | Side panels | Mobile navigation, filters, detail views |
| **popover** | `popover.tsx` | Floating content | Date pickers, SearchableSelect (combobox), menus |
| **tooltip** | `tooltip.tsx` | Help text on hover | Icon buttons, abbreviations, help hints |
| **hover-card** | `hover-card.tsx` | Rich preview on hover | User cards, link previews, data previews |
| **dropdown-menu** | `dropdown-menu.tsx` | Action menus | Table row actions, user menus, filters |
| **navigation-menu** | `navigation-menu.tsx` | Complex navigation | Marketing site nav, mega menus |

---

### Feedback & Status (5 components)

| Component | File | Purpose | Used In Patterns |
|-----------|------|---------|------------------|
| **alert** | `alert.tsx` | Static notifications | EmptyState variants, error states, warnings |
| **sonner** | `sonner.tsx` | Toast notifications | Success/error feedback after actions |
| **progress** | `progress.tsx` | Loading progress | File uploads, multi-step forms, async operations |
| **skeleton** | `skeleton.tsx` | Loading placeholders | LoadingState pattern, suspense fallbacks |
| **scroll-area** | `scroll-area.tsx` | Custom scrollbars | Sidebar navigation, modals with long content |

---

### Layout & Navigation (7 components)

| Component | File | Purpose | Used In Patterns |
|-----------|------|---------|------------------|
| **tabs** | `tabs.tsx` | Tab navigation | PageHeader tabs, settings sections, view organization |
| **accordion** | `accordion.tsx` | Collapsible sections | Settings, FAQs, mobile nav, MultiStepForm sections |
| **breadcrumb** | `breadcrumb.tsx` | Hierarchical navigation | PageHeader, deep navigation paths |
| **sidebar** | `sidebar.tsx` | Sidebar layouts | DashboardLayout, app navigation |
| **command** | `command.tsx` | Command palette (⌘K) | Global search, quick actions, SearchableSelect |
| **color-picker** | `color-picker.tsx` | Color selection | Theme customization, category colors |
| ~~**combobox**~~ | *N/A* | **Not a component** - Pattern built from `command` + `popover` | SearchableSelect pattern |

---

## 🎯 Installation History

### November 10, 2025 - Foundation Installation

**Session 1: Core components** (via layouts module)
- button, card, form, input, label, select, separator, sheet
- dialog, badge, dropdown-menu, navigation-menu, avatar
- checkbox, textarea, tooltip, popover, skeleton
- sidebar, color-picker

**Session 2: Data display & feedback** (manual installation)
- table, pagination, calendar, sonner, alert, progress
- breadcrumb, tabs, scroll-area, switch

**Session 3: Advanced forms & UI** (manual installation)
- accordion, radio-group, slider, hover-card
- command, toggle, toggle-group

---

## 📦 Components by Composed Pattern

Shows which Layer 2 (composed patterns) each Layer 1 (primitive) enables.

### Priority 1: Data Display Patterns

**DataTable**
- Uses: `table`, `pagination`, `checkbox`, `badge`, `dropdown-menu`, `button`, `input`
- Status: Ready to build

**CardView**
- Uses: `card`, `badge`, `button`, `dropdown-menu`, `avatar`
- Status: Ready to build

**ListView**
- Uses: `separator`, `avatar`, `badge`, `button`
- Status: Ready to build

**ViewSwitcher**
- Uses: `toggle-group`
- Status: Ready to build

**CollectionContainer**
- Uses: All data display patterns + `input`, `select`, `button`
- Status: Ready to build

---

### Priority 2: Layout Patterns

**PageHeader**
- Uses: `breadcrumb`, `tabs`, `button`, `separator`
- Status: Ready to build

**DashboardLayout**
- Uses: `sidebar`, `navigation-menu`, `dropdown-menu`, `avatar`, `scroll-area`
- Status: Ready to build

**SidebarNav**
- Uses: `sidebar`, `scroll-area`, `badge`, `separator`
- Status: Ready to build

---

### Priority 3: Form Patterns

**FormField**
- Uses: `form`, `label`, `input`, `textarea`, `select`, all form primitives
- Status: Ready to build

**SearchableSelect** (Combobox)
- Uses: `command`, `popover`, `button`
- Status: Ready to build (requires custom composition - see shadcn docs)
- Reference: https://ui.shadcn.com/docs/components/combobox

**DateRangePicker**
- Uses: `calendar`, `popover`, `button`
- Status: Ready to build

**MultiStepForm**
- Uses: `tabs`, `accordion`, `progress`, `button`, `form`
- Status: Ready to build

**FormActions**
- Uses: `button`, `separator`
- Status: Ready to build

---

### Priority 4: Feedback Patterns

**EmptyState**
- Uses: `alert`, `button`
- Status: Ready to build

**LoadingState**
- Uses: `skeleton`, `progress`
- Status: Ready to build

**ConfirmDialog**
- Uses: `alert-dialog`, `button`
- Status: Ready to build

**Toast System**
- Uses: `sonner`
- Status: Ready to build (just wrap sonner with consistent API)

---

### Priority 5: Media/Upload Patterns

**FileUpload**
- Uses: `button`, `progress`, `badge`, `card`
- Status: Ready to build (needs R2 integration)

**ImageGallery**
- Uses: `dialog`, `button`, `card`
- Status: Ready to build

**AvatarUpload**
- Uses: `avatar`, `button`, `dialog`
- Status: Ready to build

---

## 🚫 Components NOT Installed (Intentionally Skipped)

| Component | Reason for Skipping |
|-----------|---------------------|
| **drawer** | Already have `sheet` which serves the same purpose |
| **context-menu** | Niche use case (right-click menus), have `dropdown-menu` |
| **menubar** | Desktop app pattern, rare in web apps |
| **carousel** | Marketing site component, not core to business apps |
| **resizable** | Code editor pattern, very niche |
| **input-otp** | Only needed for 2FA, add when implementing auth features |
| **collapsible** | Use `accordion` instead for consistent patterns |
| **combobox** | Not a registry component - build from `command` + `popover` |

---

## 🔄 Upgrade Strategy

When shadcn/ui releases new components or updates:

1. **Check changelog**: https://ui.shadcn.com/docs/changelog
2. **Review breaking changes** in Tailwind v4 compatibility
3. **Update components**: `pnpm dlx shadcn@latest update`
4. **Test composed patterns** that depend on updated primitives
5. **Update this inventory** with new components

---

## 📚 Resources

**Official Documentation:**
- Component docs: https://ui.shadcn.com/docs/components
- Installation guide: https://ui.shadcn.com/docs/installation/vite
- Tailwind v4 setup: https://ui.shadcn.com/docs/tailwind-v4

**Related Project Docs:**
- [Architecture Overview](./development-planning/architecture-overview.md) - Three-layer system
- [Component Decision Framework](./development-planning/component-decision-framework.md) - Where to put components
- [Pattern Library Plan](./development-planning/pattern-library-plan.md) - Detailed pattern specifications
- [Composed Patterns Roadmap](./COMPOSED_PATTERNS_ROADMAP.md) - Build order and dependencies

---

## ✅ Component Health Check

Run this checklist after major updates:

- [ ] All components render without errors
- [ ] Dark/light mode works for all components
- [ ] TypeScript types are up to date
- [ ] Accessibility features intact (keyboard nav, ARIA labels)
- [ ] Mobile responsive behavior maintained
- [ ] No breaking changes in composed patterns

---

**Next Steps:**
1. Start building Priority 1 composed patterns (DataTable, ViewSwitcher)
2. Document patterns as you build them
3. Extract patterns after 3rd use in features
4. Keep this inventory updated with new components

---

*This inventory represents the foundation (Layer 1) for the three-layer architecture. All business applications will use these primitives to build composed patterns (Layer 2) and feature modules (Layer 3).*
