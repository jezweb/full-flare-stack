# Full-Stack Next.js + Cloudflare Architecture

## Overview

This architecture uses a three-layer component structure designed for building reusable, maintainable client applications on Cloudflare's edge infrastructure.

## The Three-Layer Architecture

### Layer 1: UI Primitives (`/components/ui/`)

**Purpose:** Unstyled, unopinionated building blocks

**What Lives Here:**
- shadcn/ui components (Button, Input, Dialog, Select, etc.)
- Single-responsibility components
- No business logic
- Maximum flexibility

**Examples:**
- `button.tsx`
- `input.tsx`
- `dialog.tsx`
- `card.tsx`
- `select.tsx`

**Rules:**
- Keep shadcn components as-is
- Don't add business logic
- These are imported by higher layers

---

### Layer 2: Composed Patterns (`/components/composed/`)

**Purpose:** Reusable UI patterns that solve common problems

**What Lives Here:**
- Combinations of Layer 1 primitives
- Opinionated patterns without business logic
- Reusable across multiple features
- Configured via props

**Organization:**
```
/components/composed/
├── data-display/      # Tables, cards, lists, view switchers
├── layouts/           # Page shells, headers, sidebars
├── forms/             # Multi-step forms, field patterns, actions
├── feedback/          # Empty states, loading, errors
├── media/             # File uploads, image galleries
└── navigation/        # Breadcrumbs, tabs, pagination
```

**Examples:**
- `DataTable` - sortable, filterable table with actions
- `PageHeader` - title + actions + breadcrumbs
- `EmptyState` - icon + message + action
- `FileUpload` - drag-drop with progress
- `MultiStepForm` - wizard-style form flow

**Rules:**
- No direct database access
- No Server Actions
- Accept data via props
- Emit events via callbacks
- Must be reusable across 3+ features

---

### Layer 3: Feature Modules (`/modules/`)

**Purpose:** Complete features with business logic

**What Lives Here:**
- Domain-specific features
- Business logic and data handling
- Server Actions
- Database schemas
- Feature-specific components

**Module Structure:**
```
/modules/[feature]/
├── actions/           # Server Actions
├── components/        # Feature-specific UI
├── hooks/             # Feature hooks
├── models/            # Type definitions
├── schemas/           # Zod validation schemas
└── utils/             # Feature utilities
```

**Examples:**
- `auth` - Authentication flows
- `todos` - Todo CRUD operations
- `users` - User management
- `products` - Product catalog

**Rules:**
- Can use both Layer 1 and Layer 2
- Contains business logic
- Uses Server Actions for mutations
- Includes validation schemas

---

## Data Flow

```
User Interaction
    ↓
Feature Module Component (Layer 3)
    ↓
Server Action (business logic)
    ↓
Database/API
    ↑
Feature Module Component
    ↓
Composed Pattern Component (Layer 2)
    ↓
UI Primitives (Layer 1)
    ↓
User sees result
```

---

## When to Create Each Layer

### Create a UI Primitive when:
- ✅ It's a single, unopinionated building block
- ✅ shadcn/ui provides it
- ✅ It needs maximum flexibility
- ❌ Don't create your own primitives unless necessary

### Create a Composed Pattern when:
- ✅ You're combining 2+ primitives repeatedly
- ✅ The pattern appears in 3+ different features
- ✅ It solves a common UI problem
- ✅ It has no business logic
- ❌ Don't create patterns speculatively

### Create a Feature Module when:
- ✅ It represents a business domain
- ✅ It needs database access
- ✅ It has specific business rules
- ✅ It includes CRUD operations

---

## Directory Structure

```
src/
├── app/                              # Next.js App Router
│   ├── (auth)/                       # Auth pages
│   ├── api/                          # API routes
│   ├── dashboard/                    # Dashboard pages
│   └── globals.css
│
├── components/
│   ├── ui/                           # Layer 1: shadcn primitives
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   └── ...
│   │
│   ├── composed/                     # Layer 2: Reusable patterns
│   │   ├── data-display/
│   │   ├── layouts/
│   │   ├── forms/
│   │   ├── feedback/
│   │   ├── media/
│   │   └── navigation/
│   │
│   └── shared/                       # One-off components
│       └── Logo.tsx
│
├── modules/                          # Layer 3: Features
│   ├── auth/
│   ├── todos/
│   ├── users/
│   └── ...
│
├── db/                               # Database
│   ├── index.ts
│   └── schema.ts
│
├── lib/                              # Shared utilities
└── services/                         # Business services
```

---

## Benefits of This Architecture

1. **Clear Separation of Concerns**
   - UI primitives are dumb and flexible
   - Patterns are smart but generic
   - Modules contain business logic

2. **Reusability**
   - Build once, use everywhere
   - Easy to find components
   - Reduces duplication

3. **Maintainability**
   - Changes to primitives affect everything (rare)
   - Changes to patterns affect multiple features (carefully)
   - Changes to modules are isolated (common)

4. **Testability**
   - Each layer can be tested independently
   - Patterns can be tested without business logic
   - Modules can be tested with mock patterns

5. **Developer Experience**
   - Clear mental model
   - Easy to navigate
   - Know where to put new code

---

## Evolution Strategy

### Phase 1: Foundation (Current)
- shadcn/ui components installed
- Basic feature modules (auth, todos)
- Initial layout components

### Phase 2: Pattern Extraction (Next)
- Identify repeated UI patterns
- Extract to `/components/composed/`
- Document each pattern

### Phase 3: Pattern Library (Future)
- Comprehensive pattern library
- Documentation site
- Storybook or similar

### Phase 4: Optimization (Ongoing)
- Performance monitoring
- Code splitting
- Pattern refinement

---

## Key Principles

1. **Don't Over-Engineer Upfront**
   - Build patterns as needs emerge
   - Start in modules, extract to composed later
   - Prove the pattern before abstracting

2. **Maintain Clear Boundaries**
   - No business logic in composed patterns
   - No database access in components
   - Server Actions only in feature modules

3. **Prioritize Reusability**
   - If used 3+ times, consider extracting
   - If used once, keep it in the module
   - Document the "why" for each pattern

4. **Keep It Simple**
   - Prefer composition over complexity
   - Clear over clever
   - Explicit over magic

---

## Reference Documentation

- [Component Decision Framework](./component-decision-framework.md)
- [Pattern Library Plan](./pattern-library-plan.md)
- [Module Development Guide](./module-development-guide.md)
