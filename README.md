# 🔥 Full Flare Stack

**Production-ready Next.js + Cloudflare Workers starter with 43 shadcn components, three-layer architecture, and D1/R2/AI integration.**

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)
[![Next.js 15](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-orange)](https://workers.cloudflare.com/)
[![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-43_components-blue)](https://ui.shadcn.com/)

> A [Jezweb](https://jezweb.com.au) Open Source Project
> Maintained by [Jez Dawes](https://github.com/jezweb) • jeremy@jezweb.net

---

## 🚀 What is Full Flare Stack?

Full Flare Stack is a **modular, production-ready starter kit** for building full-stack applications on Cloudflare's edge infrastructure. It combines Next.js 15 with Cloudflare Workers, D1, R2, and Workers AI to deliver ultra-fast, globally distributed applications that scale effortlessly.

**Built for:**
- 🎯 **MVPs & Side Projects** - Generous free tiers, deploy in minutes
- 💼 **SaaS Applications** - Multi-tenancy ready, enterprise-scale performance
- 🏢 **Business Tools** - CRMs, dashboards, admin panels with 5 production layouts
- 🤖 **AI-Powered Apps** - Edge AI inference with Workers AI

---

## ✨ What Makes It Different?

### **1. Three-Layer Component Architecture**

Full Flare Stack pioneered a clean separation of concerns:

```
Layer 1: UI Primitives (/components/ui/)
↓ 43 shadcn/ui components (foundation complete)

Layer 2: Composed Patterns (/components/composed/)
↓ Reusable patterns (DataTable, forms, etc.) - build as you need

Layer 3: Feature Modules (/modules/[feature]/)
↓ Business logic, Server Actions, database access
```

**Why it matters:**
- ✅ Know exactly where every component belongs
- ✅ Extract patterns after 3rd use (not speculatively)
- ✅ Reusable across projects
- ✅ Clear boundaries prevent technical debt

**See:** [Component Architecture Docs](./docs/development-planning/)

---

### **2. 43 shadcn/ui Components Pre-Installed**

Every primitive you need, ready to use:

| Category | Components | Count |
|----------|------------|-------|
| **Forms** | button, input, select, checkbox, radio-group, slider, switch, calendar, etc. | 13 |
| **Data Display** | table, card, badge, avatar, pagination, separator | 6 |
| **Overlays** | dialog, sheet, popover, tooltip, dropdown-menu, etc. | 8 |
| **Feedback** | alert, toast (sonner), progress, skeleton, scroll-area | 5 |
| **Layout & Nav** | tabs, accordion, breadcrumb, sidebar, command (⌘K) | 7 |

**See:** [Component Inventory](./docs/COMPONENT_INVENTORY.md) • [Build Roadmap](./docs/COMPOSED_PATTERNS_ROADMAP.md)

---

### **3. 5 Production-Ready Layouts**

Choose the layout that matches your app:

| Layout | Best For | Features |
|--------|----------|----------|
| **Sidebar** | Dashboards, Admin Panels | Collapsible sidebar, keyboard shortcuts |
| **Top Nav** | Simple Tools | Horizontal nav, full-width content |
| **Hybrid** | Complex SaaS | Top header + sidebar, most polished |
| **Centered** | Docs, Blogs | Max-width content, optimal reading |
| **Marketing** | Landing Pages | Public pages with footer |

**See:** [Layouts Documentation](./LAYOUTS.md)

---

### **4. Modular Feature System**

```bash
src/modules/
├── auth/           # Required - Google OAuth, session management
├── dashboard/      # Required - Layout wrapper
└── todos/          # Optional - Example CRUD module

# Remove unwanted modules:
rm -rf src/modules/todos

# Add new module:
mkdir -p src/modules/products/{actions,components,schemas}
```

**See:** [Module System Guide](./MODULES.md) • [Module Template](./MODULE_TEMPLATE.md)

---

### **5. Comprehensive Documentation**

Full Flare Stack includes **production-tested documentation** that saves hours:

**Architecture Guides:**
- [Architecture Overview](./docs/development-planning/architecture-overview.md) - Three-layer system
- [Component Decision Framework](./docs/development-planning/component-decision-framework.md) - Where components go
- [Module Development Guide](./docs/development-planning/module-development-guide.md) - Building features
- [Pattern Library Plan](./docs/development-planning/pattern-library-plan.md) - Reusable patterns

**Reference Docs:**
- [Component Inventory](./docs/COMPONENT_INVENTORY.md) - All 43 installed components
- [Composed Patterns Roadmap](./docs/COMPOSED_PATTERNS_ROADMAP.md) - Build order & priorities
- [API Endpoints](./docs/API_ENDPOINTS.md) - Complete API documentation
- [Database Schema](./docs/DATABASE_SCHEMA.md) - D1 schema reference

**Templates:**
- [Pattern Template](./docs/templates/PATTERN_TEMPLATE.md) - Document new patterns

---

## 🛠️ Tech Stack

### Frontend
- **Next.js 15.4.6** - App Router, React Server Components, Server Actions
- **React 19.1.0** - Latest React with concurrent features
- **TailwindCSS v4** - Utility-first CSS with native CSS variables
- **shadcn/ui** - 43 pre-installed Radix UI components
- **React Hook Form + Zod** - Type-safe form validation

### Backend & Infrastructure
- **Cloudflare Workers** - Serverless edge compute (via @opennextjs/cloudflare)
- **Cloudflare D1** - SQLite database at the edge
- **Cloudflare R2** - S3-compatible object storage (no egress fees)
- **Cloudflare Workers AI** - Edge AI inference with open-source models
- **better-auth 1.3.9** - Modern authentication with Google OAuth
- **Drizzle ORM 0.44.5** - TypeScript-first database toolkit

### DevOps
- **Wrangler 4.46.0** - Cloudflare CLI
- **pnpm** - Fast, efficient package manager
- **Biome** - Fast code formatter
- **GitHub Actions** - CI/CD (ready to configure)

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ (20+ recommended)
- pnpm (`npm install -g pnpm`)
- Cloudflare account (free tier works)
- Google OAuth credentials (for auth)

### 1. Clone & Install

```bash
git clone https://github.com/jezweb/full-flare-stack.git my-app
cd my-app
pnpm install
```

### 2. Environment Setup

```bash
# Copy environment template
cp .dev.vars.example .dev.vars

# Edit .dev.vars with your credentials:
# - CLOUDFLARE_ACCOUNT_ID (from Cloudflare dashboard)
# - BETTER_AUTH_SECRET (generate with: openssl rand -base64 32)
# - GOOGLE_CLIENT_ID + GOOGLE_CLIENT_SECRET (from Google Cloud Console)
# - CLOUDFLARE_R2_URL (your R2 bucket public URL)
```

**See:** [Environment Setup Guide](./docs/ENVIRONMENT_SETUP.md) (if available)

### 3. Database Setup

```bash
# Create D1 database (local development)
pnpm run db:migrate:local

# Or use Wrangler to create remote database
pnpm wrangler d1 create full-flare-stack
# Update wrangler.jsonc with database ID
```

### 4. Start Development

**Two-terminal setup (recommended):**

```bash
# Terminal 1: Wrangler (provides D1 database access)
pnpm run wrangler:dev

# Terminal 2: Next.js (provides hot module reload)
pnpm run dev
```

**Access:** http://localhost:3000

**Alternative (single terminal, no HMR):**
```bash
pnpm run dev:cf
```

### 5. Build & Deploy

```bash
# Build for Cloudflare Workers
pnpm run build:cf

# Deploy to preview environment
pnpm run deploy:preview

# Deploy to production
pnpm run deploy
```

---

## 📖 Documentation Quick Links

**Getting Started:**
- [Quick Start](#-quick-start) (this file)
- [Environment Setup](./docs/ENVIRONMENT_SETUP.md) (create if needed)
- [Deployment Guide](./docs/DEPLOYMENT.md) (create if needed)

**Architecture:**
- [Three-Layer Component System](./docs/development-planning/architecture-overview.md)
- [Module System Guide](./MODULES.md)
- [Component Decision Framework](./docs/development-planning/component-decision-framework.md)

**Development:**
- [Building Features](./docs/development-planning/module-development-guide.md)
- [Extracting Patterns](./docs/COMPOSED_PATTERNS_ROADMAP.md)
- [Database Migrations](./docs/DATABASE_SCHEMA.md)
- [API Reference](./docs/API_ENDPOINTS.md)

**Reference:**
- [Component Inventory](./docs/COMPONENT_INVENTORY.md)
- [Pattern Library Plan](./docs/development-planning/pattern-library-plan.md)
- [Changelog](./CHANGELOG.md)
- [Roadmap](./ROADMAP.md)

---

## 🎯 Example Use Cases

### SaaS Dashboard
```bash
# 1. Keep auth + dashboard modules
# 2. Remove todos module
rm -rf src/modules/todos

# 3. Add your feature modules
mkdir -p src/modules/{customers,subscriptions,billing}

# 4. Use Sidebar or Hybrid layout
# 5. Build with DataTable, forms, and charts patterns
```

### Marketing Site + App
```bash
# 1. Use Marketing layout for landing pages
# 2. Use Sidebar layout for dashboard
# 3. Add CMS module for content management
# 4. Deploy to Cloudflare Workers (global CDN)
```

### AI-Powered Tool
```bash
# 1. Use Centered layout for focused UX
# 2. Add AI module with Workers AI
# 3. Use Cloudflare R2 for file uploads
# 4. Stream responses with Server Actions
```

---

## 🤝 Contributing

Full Flare Stack is open source and welcomes contributions!

**Ways to contribute:**
- 🐛 Report bugs via [GitHub Issues](https://github.com/jezweb/full-flare-stack/issues)
- 💡 Suggest features via [GitHub Discussions](https://github.com/jezweb/full-flare-stack/discussions)
- 📝 Improve documentation
- 🎨 Submit composed patterns
- 🧩 Share example modules

**See:** [Contributing Guide](./CONTRIBUTING.md) for detailed instructions.

---

## 🙏 Acknowledgments

Full Flare Stack is a fork of [fullstack-next-cloudflare](https://github.com/ifindev/fullstack-next-cloudflare) by [@ifindev](https://github.com/ifindev).

**What we added:**
- ✅ Three-layer component architecture
- ✅ 43 shadcn/ui components (complete foundation)
- ✅ 5 production-ready layout variants
- ✅ Comprehensive architecture documentation
- ✅ Component decision framework
- ✅ Pattern build roadmap
- ✅ 15+ UX/DX improvements

Thank you to **@ifindev** for the excellent starting point!

**Also inspired by:**
- [Cloudflare SaaS Stack](https://github.com/supermemoryai/cloudflare-saas-stack) - Proven stack powering 20k+ users on $5/month
- [Supermemory.ai](https://git.new/memory) - Real-world Cloudflare Workers production app

---

## 📄 License

MIT License - see [LICENSE](./LICENSE) for details.

Copyright (c) 2025 Jez Dawes / Jezweb

---

## 💬 Community & Support

**GitHub:**
- [Issues](https://github.com/jezweb/full-flare-stack/issues) - Bug reports & feature requests
- [Discussions](https://github.com/jezweb/full-flare-stack/discussions) - Community chat

**Jezweb:**
- Website: [jezweb.com.au](https://jezweb.com.au)
- Email: jeremy@jezweb.net
- Phone: +61 411 056 876

**Official Cloudflare Docs:**
- [Workers](https://developers.cloudflare.com/workers/)
- [D1 Database](https://developers.cloudflare.com/d1/)
- [R2 Storage](https://developers.cloudflare.com/r2/)
- [Workers AI](https://developers.cloudflare.com/workers-ai/)

---

## ⭐ Star History

If you find Full Flare Stack useful, please consider giving it a star on GitHub!

[![Star History Chart](https://api.star-history.com/svg?repos=jezweb/full-flare-stack&type=Date)](https://star-history.com/#jezweb/full-flare-stack&Date)

---

**Built with ❤️ by [Jezweb](https://jezweb.com.au) • Powered by ⚡ Cloudflare**
