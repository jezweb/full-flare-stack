# Full-Stack Next.js + Cloudflare Architecture Documentation

Complete reference documentation for building client applications with the three-layer architecture pattern.

---

## 📚 Documentation Set

This documentation package contains comprehensive guides for developing with the Next.js + Cloudflare stack using a three-layer component architecture.

### Core Documents

1. **[Architecture Overview](./architecture-overview.md)** - Start here
   - Explains the three-layer architecture
   - Directory structure
   - Benefits and principles
   - Evolution strategy

2. **[Component Decision Framework](./component-decision-framework.md)** - For daily decisions
   - Decision tree for component placement
   - Detailed criteria for each layer
   - Common scenarios with solutions
   - Red flags and anti-patterns

3. **[Pattern Library Plan](./pattern-library-plan.md)** - For building reusable patterns
   - Prioritized list of patterns to build
   - Detailed specifications for each pattern
   - Implementation strategy
   - Resources and inspiration

4. **[Module Development Guide](./module-development-guide.md)** - For building features
   - Step-by-step module creation
   - Best practices
   - Code examples
   - Common patterns

5. **[Architecture Quick Reference](./architecture-quick-reference.md)** - For quick lookups
   - Fast decision trees
   - Common tasks and commands
   - Code snippets
   - Troubleshooting

---

## 🎯 How to Use This Documentation

### For First-Time Setup

1. Read **Architecture Overview** to understand the system
2. Skim **Component Decision Framework** to learn the rules
3. Reference **Quick Reference** while working

### When Building a New Feature

1. Use **Module Development Guide** for step-by-step instructions
2. Check **Component Decision Framework** when unsure about placement
3. Keep **Quick Reference** open for commands and snippets

### When Building Reusable Patterns

1. Consult **Pattern Library Plan** for pattern ideas
2. Follow **Component Decision Framework** for proper abstraction
3. Reference existing patterns in **Pattern Library Plan**

### When Stuck or Confused

1. Check **Quick Reference** decision trees
2. Review **Component Decision Framework** scenarios
3. Look at examples in **Module Development Guide**

---

## 🏗️ Architecture Summary

### The Three Layers

```
┌─────────────────────────────────────────────────┐
│  Layer 3: Feature Modules                       │
│  /modules/[feature]/                            │
│  • Business logic                               │
│  • Server Actions                               │
│  • Database access                              │
│  • Feature-specific components                  │
└─────────────────────────────────────────────────┘
                      ↓ uses
┌─────────────────────────────────────────────────┐
│  Layer 2: Composed Patterns                     │
│  /components/composed/                          │
│  • Reusable UI patterns                         │
│  • No business logic                            │
│  • Used across 3+ features                      │
│  • Prop-based configuration                     │
└─────────────────────────────────────────────────┘
                      ↓ uses
┌─────────────────────────────────────────────────┐
│  Layer 1: UI Primitives                         │
│  /components/ui/                                │
│  • shadcn/ui components                         │
│  • Single-responsibility                        │
│  • Maximum flexibility                          │
│  • No opinions                                  │
└─────────────────────────────────────────────────┘
```

### Quick Decision Guide

**"Where should this component go?"**

```
Has business logic? 
  → YES: /modules/[feature]/components/
  → NO: Continue...

Will be used in 3+ features?
  → YES: /components/composed/[category]/
  → NO: Continue...

Is it a shadcn component?
  → YES: /components/ui/
  → NO: /components/shared/ or inline
```

---

## 🚀 Getting Started Checklist

### Phase 1: Foundation Setup
- [ ] Read Architecture Overview
- [ ] Understand the three layers
- [ ] Review existing repo structure
- [ ] Create `/components/composed/` directory structure

### Phase 2: Build First Feature
- [ ] Follow Module Development Guide
- [ ] Create database schema
- [ ] Build CRUD operations
- [ ] Create UI components
- [ ] Test thoroughly

### Phase 3: Extract Patterns
- [ ] Identify repeated UI patterns (after 3rd use)
- [ ] Extract to `/components/composed/`
- [ ] Document the pattern
- [ ] Use in multiple features

### Phase 4: Refine & Scale
- [ ] Build remaining priority patterns
- [ ] Document learnings
- [ ] Share with team
- [ ] Iterate based on usage

---

## 📖 Document Quick Links

### By Use Case

**Building a new feature?**
→ [Module Development Guide](./module-development-guide.md)

**Not sure where a component goes?**
→ [Component Decision Framework](./component-decision-framework.md)

**Need to extract a reusable pattern?**
→ [Pattern Library Plan](./pattern-library-plan.md)

**Looking for a quick answer?**
→ [Architecture Quick Reference](./architecture-quick-reference.md)

**Want to understand the big picture?**
→ [Architecture Overview](./architecture-overview.md)

---

## 💡 Key Principles

1. **Build patterns as you need them** - Don't over-architect upfront
2. **Extract after 3rd use** - Prove the pattern before abstracting
3. **Server Components by default** - Only use 'use client' when needed
4. **Clear layer boundaries** - No business logic in patterns
5. **Consistent patterns** - Reuse rather than rebuild

---

## 🛠️ Development Workflow

### Daily Development

```bash
# Terminal 1: Wrangler (for D1 access)
pnpm run wrangler:dev

# Terminal 2: Next.js (with HMR)
pnpm run dev

# Browser: http://localhost:3000
```

### When You Need to...

**Create a new feature module:**
```bash
mkdir -p src/modules/[feature]/{actions,components,hooks,models,schemas}
# Then follow Module Development Guide
```

**Add a database table:**
```bash
# Edit src/db/schema.ts
pnpm run db:generate:named "add_[table]"
pnpm run db:migrate:local
```

**Extract a reusable pattern:**
```bash
# 1. Identify the pattern (used 3+ times)
# 2. Create in /components/composed/[category]/
# 3. Make it generic (props-based)
# 4. Document usage
# 5. Replace usage in features
```

**Deploy to production:**
```bash
pnpm run build:cf
pnpm run db:migrate:prod
pnpm run deploy
```

---

## 📝 Common Patterns Reference

### Server Action Structure
```typescript
'use server';
export async function myAction(input: Input): Promise<ActionResponse<Data>> {
  try {
    const session = await auth();              // 1. Authenticate
    if (!session?.user) return { success: false, error: 'Unauthorized' };
    
    const validated = schema.parse(input);     // 2. Validate
    const result = await db.insert(...);       // 3. Database operation
    revalidatePath('/path');                   // 4. Revalidate
    
    return { success: true, data: result };    // 5. Return
  } catch (error) {
    return { success: false, error: 'Message' };
  }
}
```

### Component with Server Action
```typescript
// Server Component (default)
export async function MyList() {
  const result = await getItems();
  if (!result.success) return <ErrorState />;
  return <DataTable data={result.data} />;
}

// Client Component (when needed)
'use client';
export function MyForm() {
  const form = useForm({
    resolver: zodResolver(schema),
  });
  
  const onSubmit = async (data) => {
    const result = await createItem(data);
    if (result.success) toast.success('Created!');
  };
  
  return <form onSubmit={form.handleSubmit(onSubmit)}>...</form>;
}
```

---

## 🎓 Learning Path

### Week 1-2: Foundation
- [ ] Understand the three-layer architecture
- [ ] Build your first feature module
- [ ] Create basic CRUD operations
- [ ] Add a simple page

### Week 3-4: Patterns
- [ ] Identify repeated UI patterns
- [ ] Extract first reusable pattern (probably DataTable)
- [ ] Build PageHeader and EmptyState patterns
- [ ] Document your patterns

### Week 5-6: Advanced
- [ ] Build form patterns (multi-step, fields)
- [ ] Add file upload with R2
- [ ] Create view switcher (table/card/list)
- [ ] Optimize for mobile

### Week 7-8: Polish
- [ ] Complete pattern library (priority patterns)
- [ ] Add loading/error states everywhere
- [ ] Improve accessibility
- [ ] Document everything

---

## 🆘 Troubleshooting

### "I don't know where to put this component"
→ Use the decision tree in [Component Decision Framework](./component-decision-framework.md)

### "This pattern has business logic"
→ It's not a pattern, it's a feature component. Keep it in the module.

### "I'm repeating code across features"
→ After 3rd use, extract to `/components/composed/`. See [Pattern Library Plan](./pattern-library-plan.md)

### "My Server Action isn't updating the UI"
→ Did you call `revalidatePath()`? See [Module Development Guide](./module-development-guide.md)

### "I need more examples"
→ Check the [Module Development Guide](./module-development-guide.md) for detailed examples

---

## 🔄 Keeping Documentation Updated

As your project evolves:

1. **Document new patterns** in Pattern Library Plan
2. **Add examples** to Module Development Guide
3. **Update decision framework** if rules change
4. **Share learnings** with your team
5. **Refine based on experience**

This documentation is a living guide that should evolve with your understanding and needs.

---

## 📊 Success Metrics

You'll know the architecture is working when:

- ✅ You can build new features faster
- ✅ Components are easy to find
- ✅ Code duplication decreases
- ✅ New developers onboard quickly
- ✅ Bugs are isolated to modules
- ✅ Refactoring is straightforward
- ✅ Tests are easy to write

---

## 🤝 Contributing Back

If you discover:
- Better patterns
- Clearer explanations
- Useful examples
- Common gotchas

Consider contributing back to the original template or sharing with the community.

---

## 📞 Support

When you need help:

1. Check [Architecture Quick Reference](./architecture-quick-reference.md) first
2. Review relevant detailed guide
3. Look at existing code examples
4. Experiment in a feature branch
5. Ask your team or community

---

## 🎯 Remember

> "Build patterns as you need them, not speculatively.  
> Extract after the 3rd use, not before.  
> Keep layers separated, keep code clean."

---

## 📅 Next Steps

1. **Today:** Read Architecture Overview
2. **This Week:** Build your first module following Module Development Guide
3. **This Month:** Extract your first 3-5 reusable patterns
4. **This Quarter:** Have a comprehensive pattern library

Good luck building amazing applications! 🚀

---

*Last Updated: 2025*  
*For: Full-Stack Next.js + Cloudflare Template*  
*Repository: github.com/jezweb/fullstack-next-cloudflare*
