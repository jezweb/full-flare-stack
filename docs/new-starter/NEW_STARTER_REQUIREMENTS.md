# Full-Stack Cloudflare Starter Kit - Requirements & Architecture

**Status:** Planning Phase
**Target Start Date:** TBD
**Purpose:** Production-ready starter kit for building business applications on Cloudflare Workers

---

## Project Goals

### Primary Objective
Create a **simple, modular, full-stack starter kit** that Jezweb team can use to quickly build client business applications (CRM, agent workspaces, live chat, etc.) using Cloudflare Workers instead of Firebase/Vercel.

### Key Principles
1. **Simplicity First** - Easy to understand, even for developers learning with AI assistance
2. **Cloudflare Native** - Work with the platform, not against it
3. **Modular by Default** - Easy to add/remove features for each client project
4. **Developer Experience** - Fast iteration, clear errors, minimal config
5. **Production Ready** - Includes auth, database, storage, and deployment from day one

---

## Architecture Decision

### Frontend: React SPA (Vite)
**Why React SPA instead of Next.js:**
- ✅ Simpler mental model (no SSR, RSC, App Router complexity)
- ✅ Better for authenticated business apps (don't need SEO)
- ✅ Full React ecosystem access (all plugins/libraries work)
- ✅ Faster hot reload
- ✅ Easier to reason about (client vs. server is clear)
- ✅ Works perfectly with shadcn/ui
- ✅ Better for Claude Code assistance (clearer patterns)

### Backend: Hono on Cloudflare Workers
**Why Hono instead of Next.js API Routes:**
- ✅ Designed for Workers (not adapted via OpenNext)
- ✅ Ultra-lightweight (~11KB)
- ✅ Simple request/response model
- ✅ No framework version conflicts
- ✅ Direct access to Cloudflare bindings
- ✅ Faster cold starts
- ✅ Better TypeScript support for Workers

### Integration: Cloudflare Vite Plugin
**Why unified build instead of separate projects:**
- ✅ **One terminal** for development (not two!)
- ✅ **One deployment** (single Worker)
- ✅ **No CORS** configuration needed
- ✅ **Type-safe bindings** (auto-generated from config)
- ✅ **Faster development** (HMR for frontend + backend)
- ✅ **Less configuration** (one vite.config.ts vs. multiple files)

---

## Tech Stack

### Frontend Stack
```
React 19+               - UI library
Vite 6+                 - Build tool & dev server
TypeScript 5+           - Type safety
React Router 7+         - Client-side routing
TanStack Query 5+       - Server state management
React Hook Form 7+      - Form handling
Zod 3+                  - Schema validation
shadcn/ui              - UI component library (Radix UI based)
Tailwind CSS v4        - Styling
Lucide React           - Icons
```

### Backend Stack
```
Hono 4+                - Web framework for Workers
Cloudflare Workers     - Edge compute platform
Cloudflare D1          - SQLite database at edge
Cloudflare R2          - Object storage (S3-compatible)
Cloudflare Workers AI  - AI inference (optional)
Drizzle ORM 0.38+     - Database toolkit
better-auth 1.3+       - Authentication library
Zod 3+                 - Shared schema validation
```

### Development Tools
```
Wrangler 4+            - Cloudflare CLI
pnpm                   - Package manager
Biome                  - Linter & formatter
TypeScript             - Type checking
Drizzle Kit            - Database migrations
```

---

## Development Workflow

### Single-Terminal Development
```bash
# Start everything with one command:
pnpm dev

# This runs:
# - Vite dev server (http://localhost:5173)
# - Hono worker (via Vite plugin)
# - D1 local database (via getPlatformProxy)
# - R2 local storage (via getPlatformProxy)
# - Hot reload for frontend AND backend
```

**No more:**
- ❌ Two terminal requirement
- ❌ Wrangler dev in one terminal, Next.js in another
- ❌ Different ports for different servers
- ❌ CORS configuration between frontend/backend

### Configuration Files
```
vite.config.ts         - Single source of truth
  ├─ Frontend config (React, Tailwind)
  ├─ Backend config (Worker bindings)
  ├─ D1 database binding
  ├─ R2 storage binding
  └─ Type generation

.dev.vars              - Local secrets (gitignored)
wrangler.jsonc         - Deployment config only
tsconfig.json          - TypeScript settings
package.json           - Dependencies & scripts
```

### Build & Deploy
```bash
# Build for production
pnpm run build
# Output: dist/ (static files + worker script)

# Deploy to Cloudflare
wrangler deploy
# Deploys single Worker with bundled assets

# That's it! No adapter, no workarounds
```

---

## Core Features (MVP)

### 1. Authentication Module (Required)
**Provider:** better-auth
**Features:**
- Email/password authentication
- Google OAuth (social login)
- Session management (cookie-based)
- Protected route middleware
- User profile management
- Password reset flow (email optional for MVP)

**Why better-auth:**
- Works with D1 (many auth libs don't)
- TypeScript-first
- No external service dependencies
- Lightweight and fast
- Flexible adapter system

### 2. Database Module (Required)
**Provider:** Drizzle ORM + Cloudflare D1
**Features:**
- Type-safe database queries
- Migration system (Drizzle Kit)
- Schema-first development
- User data isolation (automatic userId filtering)
- Local development database (.wrangler/state)
- Production database (Cloudflare D1)

**Tables:**
```sql
users          - User accounts (managed by better-auth)
sessions       - Active sessions (managed by better-auth)
accounts       - OAuth accounts (managed by better-auth)
verification   - Email verification tokens (managed by better-auth)
[module tables] - Created per feature module
```

### 3. UI Component Library (Required)
**Provider:** shadcn/ui + Tailwind v4
**Pre-installed components:**
- Button, Input, Label, Textarea
- Form, Card, Dialog, Sheet
- Table, Select, Checkbox, Switch
- Dropdown, Toast, Tabs
- Avatar, Badge, Separator
- Navigation Menu

**Theming:**
- Dark/light mode toggle
- System preference detection
- Persisted preference (localStorage)
- CSS variables for customization

### 4. Module System (Required)
**Architecture:** Feature-based modules (self-contained)

**Frontend module structure:**
```
src/client/modules/[module-name]/
├── components/          # React components
│   ├── [Module]List.tsx
│   ├── [Module]Form.tsx
│   └── [Module]Card.tsx
├── hooks/               # Custom hooks
│   ├── use[Module].ts   # TanStack Query hooks
│   └── use[Module]Form.ts
├── schemas/             # Zod validation
│   └── [module].schema.ts
└── types/               # TypeScript types
    └── [module].types.ts
```

**Backend module structure:**
```
src/server/modules/[module-name]/
├── routes.ts            # Hono route handlers
├── schemas/             # Shared Zod schemas (same as frontend)
│   └── [module].schema.ts
└── db/                  # Database schema
    └── schema.ts        # Drizzle table definitions
```

**Module dependencies:**
- Modules can depend on `auth` module
- Modules CANNOT depend on each other
- Shared logic goes in `/lib` or `/services`

---

## Example Modules (Starter Kit Includes)

### Module 1: Todo List (Example CRUD)
**Purpose:** Reference implementation for building new modules

**Frontend:**
- Todo list with filtering/sorting
- Create/edit/delete todo
- Mark as complete
- Category assignment
- Form validation with Zod
- Optimistic updates (TanStack Query)

**Backend:**
- `GET /api/todos` - List user's todos
- `POST /api/todos` - Create todo
- `PUT /api/todos/:id` - Update todo
- `DELETE /api/todos/:id` - Delete todo
- User isolation (only see your own todos)

**Database:**
```sql
CREATE TABLE todos (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  completed INTEGER DEFAULT 0,
  category_id TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
)
```

### Module 2: Categories (Supporting Feature)
**Purpose:** Demonstrate relationships and shared data

**Frontend:**
- Category selector in todo form
- Category management page
- Color picker for categories
- Delete protection (prevent deletion if todos exist)

**Backend:**
- `GET /api/categories` - List user's categories
- `POST /api/categories` - Create category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category (cascade check)

**Database:**
```sql
CREATE TABLE categories (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  created_at INTEGER NOT NULL
)
```

### Module 3: User Settings (Profile)
**Purpose:** User preferences and account management

**Frontend:**
- Profile information form
- Theme preference (dark/light/system)
- Email change flow
- Password change form
- Account deletion

**Backend:**
- `GET /api/settings` - Get user settings
- `PUT /api/settings` - Update settings
- `PUT /api/settings/password` - Change password
- `DELETE /api/settings/account` - Delete account

**Database:**
```sql
CREATE TABLE user_settings (
  user_id TEXT PRIMARY KEY,
  theme TEXT DEFAULT 'system',
  updated_at INTEGER NOT NULL
)
```

### Module 4: Dashboard (Layout)
**Purpose:** Main application layout and navigation

**Frontend:**
- Sidebar navigation
- Top navigation bar
- User menu (profile, settings, logout)
- Breadcrumbs
- Responsive mobile menu
- Module navigation links

**Backend:**
- No backend routes (layout only)

---

## File Structure

```
my-cloudflare-starter/
├── src/
│   ├── client/                    # Frontend (React SPA)
│   │   ├── main.tsx              # App entry point
│   │   ├── App.tsx               # Router setup
│   │   ├── index.css             # Tailwind imports
│   │   │
│   │   ├── components/           # Shared UI components
│   │   │   ├── ui/              # shadcn/ui components
│   │   │   ├── layout/          # Layout components
│   │   │   └── shared/          # Reusable components
│   │   │
│   │   ├── lib/                  # Shared utilities
│   │   │   ├── utils.ts         # Helper functions
│   │   │   ├── auth-client.ts   # better-auth client
│   │   │   └── query-client.ts  # TanStack Query config
│   │   │
│   │   └── modules/              # Feature modules
│   │       ├── auth/            # Authentication module
│   │       │   ├── components/
│   │       │   │   ├── LoginForm.tsx
│   │       │   │   └── SignupForm.tsx
│   │       │   ├── hooks/
│   │       │   │   └── useAuth.ts
│   │       │   └── pages/
│   │       │       ├── LoginPage.tsx
│   │       │       └── SignupPage.tsx
│   │       │
│   │       ├── dashboard/       # Dashboard layout module
│   │       │   ├── components/
│   │       │   │   ├── Sidebar.tsx
│   │       │   │   ├── TopNav.tsx
│   │       │   │   └── UserMenu.tsx
│   │       │   └── pages/
│   │       │       └── DashboardLayout.tsx
│   │       │
│   │       ├── todos/           # Todo CRUD module
│   │       │   ├── components/
│   │       │   │   ├── TodoList.tsx
│   │       │   │   ├── TodoForm.tsx
│   │       │   │   └── TodoCard.tsx
│   │       │   ├── hooks/
│   │       │   │   └── useTodos.ts
│   │       │   ├── schemas/
│   │       │   │   └── todo.schema.ts
│   │       │   └── pages/
│   │       │       └── TodosPage.tsx
│   │       │
│   │       ├── categories/      # Categories module
│   │       │   └── [similar structure]
│   │       │
│   │       └── settings/        # User settings module
│   │           └── [similar structure]
│   │
│   └── server/                    # Backend (Hono Worker)
│       ├── index.ts              # Main worker entry point
│       │
│       ├── lib/                  # Shared utilities
│       │   ├── auth.ts          # better-auth server config
│       │   └── db.ts            # Drizzle DB connection
│       │
│       ├── middleware/           # Hono middleware
│       │   ├── auth.ts          # Protected route middleware
│       │   └── cors.ts          # CORS (if needed)
│       │
│       └── modules/              # Feature modules (backend)
│           ├── auth/
│           │   └── routes.ts    # Auth endpoints
│           │
│           ├── todos/
│           │   ├── routes.ts    # Todo CRUD endpoints
│           │   ├── schemas/
│           │   │   └── todo.schema.ts  # Shared with client
│           │   └── db/
│           │       └── schema.ts       # Drizzle schema
│           │
│           ├── categories/
│           │   └── [similar structure]
│           │
│           └── settings/
│               └── [similar structure]
│
├── drizzle/                       # Database migrations
│   ├── 0000_initial.sql
│   ├── 0001_add_todos.sql
│   └── meta/
│
├── docs/                          # Documentation
│   ├── ARCHITECTURE.md
│   ├── MODULE_TEMPLATE.md
│   ├── DATABASE_SCHEMA.md
│   └── DEPLOYMENT.md
│
├── public/                        # Static assets
│   └── [images, fonts, etc.]
│
├── vite.config.ts                 # Vite + Cloudflare config
├── wrangler.jsonc                 # Cloudflare deployment config
├── drizzle.config.ts             # Drizzle Kit config
├── tsconfig.json                  # TypeScript config
├── package.json                   # Dependencies & scripts
├── .dev.vars                      # Local secrets (gitignored)
├── .env.example                   # Environment template
├── README.md                      # Project documentation
└── CLAUDE.md                      # Claude Code context
```

---

## Developer Experience Requirements

### Must-Have DX Features
1. **Single command start** - `pnpm dev` runs everything
2. **Fast hot reload** - Changes visible in < 1 second
3. **Clear error messages** - TypeScript errors show in terminal and browser
4. **Type safety** - Full type inference across frontend/backend
5. **No build step in dev** - Instant iteration
6. **Automatic database** - Local D1 works without setup
7. **Easy debugging** - Console.log works, source maps included

### Nice-to-Have DX Features
1. **Auto-import** - TypeScript auto-imports from modules
2. **Path aliases** - Use `@/` instead of `../../..`
3. **Database GUI** - Drizzle Studio for inspecting data
4. **API testing** - Example curl commands in docs
5. **Component preview** - Storybook (future consideration)

---

## Security Requirements

### Authentication & Authorization
- ✅ Secure session management (httpOnly cookies)
- ✅ CSRF protection (via better-auth)
- ✅ Password hashing (bcrypt via better-auth)
- ✅ OAuth token handling (secure storage)
- ✅ User isolation (all queries filter by userId)
- ✅ Protected API routes (auth middleware)

### Input Validation
- ✅ Client-side validation (Zod + React Hook Form)
- ✅ Server-side validation (Zod schemas)
- ✅ Shared schemas (same Zod schema on client/server)
- ✅ SQL injection prevention (Drizzle parameterized queries)
- ✅ XSS prevention (React escaping + Content Security Policy)

### Data Protection
- ✅ Environment variable management (.dev.vars gitignored)
- ✅ Secret rotation support (Wrangler secrets)
- ✅ User data isolation (database-level filtering)
- ✅ HTTPS only in production (Cloudflare enforced)

---

## Performance Requirements

### Frontend Performance
- **Target:** First Contentful Paint < 1.5s
- **Method:**
  - Code splitting (React Router lazy loading)
  - Optimized bundle size (< 200KB gzipped)
  - Tailwind CSS purging
  - Image optimization (Cloudflare Images if needed)

### Backend Performance
- **Target:** API response time < 100ms (p95)
- **Method:**
  - Edge deployment (Cloudflare Workers)
  - D1 query optimization (indexed queries)
  - No unnecessary database calls
  - Efficient serialization (Hono built-in)

### Database Performance
- **Target:** Query time < 50ms (p95)
- **Method:**
  - Indexed columns (userId, createdAt, etc.)
  - Optimized schema design
  - Connection pooling (D1 automatic)
  - Query result caching (TanStack Query on frontend)

---

## Deployment Strategy

### Environments
1. **Local** - Development on laptop
   - D1 local database (.wrangler/state)
   - R2 local storage (miniflare)
   - No real OAuth (use test credentials)

2. **Preview** - Testing environment
   - Cloudflare Workers preview
   - D1 preview database
   - R2 preview bucket
   - Test OAuth credentials

3. **Production** - Live application
   - Cloudflare Workers production
   - D1 production database
   - R2 production bucket
   - Production OAuth credentials
   - Custom domain (optional)

### Deployment Commands
```bash
# Preview deployment
pnpm run build
wrangler deploy --env preview

# Production deployment
pnpm run build
wrangler deploy --env production

# Database migrations
pnpm run db:migrate:preview
pnpm run db:migrate:production
```

### Zero-Downtime Deployments
- ✅ Cloudflare Workers deploy atomically (no downtime)
- ✅ Database migrations run separately (not in deploy)
- ✅ Versioned deployments (Wrangler automatic)
- ✅ Rollback support (`wrangler rollback`)

---

## Testing Strategy

### Manual Testing (MVP)
**Current approach:** No automated tests initially

**Smoke test checklist:**
- [ ] App loads without errors
- [ ] Can sign up new account
- [ ] Can log in with existing account
- [ ] Can create/edit/delete todos
- [ ] Can create/edit/delete categories
- [ ] Can assign category to todo
- [ ] Theme toggle works
- [ ] User settings save correctly
- [ ] Logout works
- [ ] Data persists after refresh

### Future Testing (Post-MVP)
**When project matures:**
- Vitest for unit tests (frontend utilities)
- React Testing Library for component tests
- Playwright for E2E tests
- Wrangler test for Worker unit tests

---

## Migration Benefits

### From Current Next.js Setup

| Problem (Next.js + OpenNext) | Solution (Vite + Hono) |
|------------------------------|------------------------|
| Two terminals required | ✅ One terminal (`pnpm dev`) |
| Slow HMR (3-5 seconds) | ✅ Fast HMR (< 1 second) |
| Complex build process | ✅ Standard Vite build |
| Deployment auth errors | ✅ Standard `wrangler deploy` |
| Next.js version blockers | ✅ Independent versions |
| Adapter layer overhead | ✅ Native Workers support |
| ~10MB worker bundle | ✅ ~2MB worker bundle |
| Unclear what runs where (RSC) | ✅ Clear client/server split |
| Server Components learning curve | ✅ Standard React patterns |

### New Capabilities
- ✅ Faster development iteration
- ✅ Simpler architecture (easier for team to learn)
- ✅ Better Claude Code assistance (clearer patterns)
- ✅ More portable modules (less framework-specific)
- ✅ Easier debugging (client vs. server is obvious)
- ✅ Better alignment with Cloudflare Workers
- ✅ Future-proof (no framework lock-in)

---

## Open Questions / Decisions Needed

### 1. better-auth Alternative?
**Question:** Should we use better-auth or build custom auth?
- **better-auth pros:** TypeScript-first, works with D1, social auth included
- **better-auth cons:** Less mature than Auth.js, smaller community
- **Custom auth pros:** Full control, learn auth internals
- **Custom auth cons:** Security risk, time investment (5-10 days)

**Recommendation:** Stick with better-auth for MVP, can swap later if needed

### 2. File Uploads (R2)?
**Question:** Include file upload module in starter kit?
- **Pros:** Common requirement (profile photos, attachments)
- **Cons:** Adds complexity, not all apps need it
- **Compromise:** Document in MODULE_TEMPLATE.md, don't include in core

### 3. Real-time Features?
**Question:** Include WebSocket/SSE example for live chat use case?
- **Pros:** Differentiator vs. traditional starters, useful for chat/collaboration
- **Cons:** Adds complexity, Cloudflare Durable Objects learning curve
- **Compromise:** Separate example module (not in core starter)

### 4. Monorepo or Separate Repos?
**Question:** Keep frontend/backend in one repo or split?
- **One repo pros:** Easier to manage, shared schemas work naturally
- **One repo cons:** Larger git repo, frontend/backend coupled
- **Split repos pros:** Independent versioning, smaller checkouts
- **Split repos cons:** Schema sharing requires npm package

**Recommendation:** One repo (monorepo) for simplicity

### 5. Styling Approach?
**Question:** Tailwind v4 or CSS Modules or both?
- **Tailwind pros:** Fast iteration, shadcn/ui requires it, utility-first
- **CSS Modules pros:** Component-scoped styles, better for complex layouts
- **Both:** Flexibility, but increases bundle size

**Recommendation:** Tailwind v4 only (required for shadcn/ui anyway)

---

## Success Metrics

### Developer Experience Success
- **Setup time:** < 15 minutes from clone to running app
- **First feature time:** < 2 hours to add a new CRUD module
- **Build time:** < 30 seconds for production build
- **Hot reload time:** < 1 second for frontend changes

### Technical Success
- **Bundle size:** < 200KB gzipped (frontend)
- **Worker size:** < 2MB (backend)
- **Cold start:** < 50ms (Cloudflare Workers)
- **API response:** < 100ms p95

### Team Success
- **Onboarding:** Junior dev can understand architecture in < 1 day
- **Reusability:** Can fork starter and build new app in < 1 week
- **AI assistance:** Claude Code can help without confusion
- **Documentation:** All common tasks documented with examples

---

## Timeline Estimate

### Week 1: Foundation
- Day 1-2: Project setup (Vite + Hono + TypeScript)
- Day 3-4: Database setup (Drizzle + D1)
- Day 5: Basic routing (React Router + Hono routes)

### Week 2: Authentication
- Day 1-2: better-auth integration
- Day 3: Login/signup pages
- Day 4: Session management
- Day 5: Protected routes

### Week 3: First Module (Todos)
- Day 1-2: Database schema + migrations
- Day 3: Backend API routes
- Day 4: Frontend components
- Day 5: Form handling + validation

### Week 4: UI & Supporting Modules
- Day 1-2: Dashboard layout
- Day 3: Categories module
- Day 4: User settings
- Day 5: Theme toggle + polish

### Week 5: Testing & Documentation
- Day 1-2: Manual testing checklist
- Day 3: Documentation (README, MODULE_TEMPLATE)
- Day 4: Deployment testing (preview + production)
- Day 5: Final polish + examples

**Total: ~25 days for full-featured starter kit**

With Claude Code assistance: Potentially 15-20 days

---

## Next Steps

1. **Review this document** - Validate requirements and architecture decisions
2. **Create new repository** - Fresh start with clear git history
3. **Start with foundation** - Vite + Hono + TypeScript skeleton
4. **Build iteratively** - One module at a time, test as you go
5. **Document as you build** - Keep CLAUDE.md and MODULE_TEMPLATE.md updated

---

**Document Status:** Draft for review
**Author:** Claude Code
**Date:** 2025-11-15
**Next Review:** After initial validation
