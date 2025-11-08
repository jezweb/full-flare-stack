# Next.js 16 Upgrade Research

**Date:** 2025-11-08
**Current Version:** Next.js 15.4.6
**Target Version:** Next.js 16.x

---

## Executive Summary

**Recommendation: WAIT for dependency support**

Next.js 16 was released October 21, 2025, but critical dependencies are not yet compatible:
- **better-auth**: No Next.js 16 support (Issue #5263)
- **@opennextjs/cloudflare**: Proxy system partially supported (Issue #972)

**Timeline:** Reassess in Q1 2026 when ecosystem matures.

---

## Current Stack Status

### Installed Versions
- Next.js: 15.4.6 ✅
- React: 19.1.0 ✅
- @opennextjs/cloudflare: 1.11.1 ✅ (upgraded 2025-11-08)
- wrangler: 4.46.0 ✅ (upgraded 2025-11-08)
- better-auth: 1.3.9 ⚠️ (blocks Next.js 16)

### Architecture
- Platform: Cloudflare Workers via @opennextjs/cloudflare
- Auth: better-auth with session management
- Database: Drizzle ORM + D1
- Framework: App Router, Server Components, Server Actions

---

## Next.js 16 Key Changes

### Major Features
1. **Turbopack Stable** - Now default bundler (webpack deprecated)
2. **Proxy System** - Replaces `middleware.ts` with `proxy.ts`
3. **Cache Components** - PPR with `use cache` directive
4. **React 19.2** - View Transitions, useEffectEvent

### Breaking Changes

#### 1. Async Request APIs ✅ COMPATIBLE
Project already uses async params pattern:
```typescript
params: Promise<{ id: string }>
const { id } = await params;
```

#### 2. Middleware → Proxy ❌ BLOCKER
Must rename `middleware.ts` → `proxy.ts` and update export:
```typescript
// proxy.ts
export async function proxy(request: NextRequest) {
  // Same logic as middleware
}
```

**Issue:** @opennextjs/cloudflare doesn't fully support proxy yet (tracking in #972)

#### 3. Minimum Requirements ✅ MET
- Node.js 20.9+ ✅
- TypeScript 5.1+ ✅
- React 19+ ✅

---

## Dependency Compatibility

### Critical Blockers

#### better-auth ❌ INCOMPATIBLE
- **Version:** 1.3.9
- **Status:** No Next.js 16 support
- **Issue:** https://github.com/better-auth/better-auth/issues/5263
- **Impact:** Middleware → proxy changes break session handling
- **Timeline:** Unknown - no committed release date

#### @opennextjs/cloudflare ⚠️ PARTIAL
- **Version:** 1.11.1
- **Status:** Proxy not fully supported
- **Issue:** https://github.com/opennextjs/opennextjs-cloudflare/issues/972
- **Workaround:** Use deprecated middleware.ts naming (generates warnings)
- **Timeline:** Active development - likely 2-4 weeks

### Compatible Dependencies ✅

- **drizzle-orm** - Framework-agnostic ORM
- **Radix UI** - React 19 compatible
- **react-hook-form, zod, tailwind** - Framework-agnostic
- **Cloudflare bindings** - Worker-level, independent of Next.js

---

## Upgrade Path (When Ready)

### Pre-Upgrade Checklist
- [ ] better-auth releases Next.js 16 compatible version
- [ ] @opennextjs/cloudflare completes Issue #972
- [ ] Review community success stories
- [ ] Backup D1 database
- [ ] Create git checkpoint

### Upgrade Steps

```bash
# 1. Update dependencies
pnpm install next@16 react@latest react-dom@latest
pnpm install @opennextjs/cloudflare@latest better-auth@latest

# 2. Run automated codemod
npx @next/codemod@canary upgrade latest

# 3. Manual changes
# - Rename middleware.ts → proxy.ts
# - Update export: middleware → proxy
# - Update better-auth integration (follow their migration guide)

# 4. Update wrangler.jsonc if needed
# "compatibility_date": "2025-11-08" or later

# 5. Clear cache and test
rm -rf .next
pnpm run dev

# 6. Deploy to preview and validate
pnpm run deploy:preview
```

**Estimated effort when ready:** 2-4 hours

---

## Monitoring Strategy

### Weekly Checks (Until Dependencies Ready)

**better-auth:**
- GitHub: https://github.com/better-auth/better-auth/issues/5263
- NPM: https://www.npmjs.com/package/better-auth
- Look for: "Next.js 16" in changelog

**@opennextjs/cloudflare:**
- GitHub: https://github.com/opennextjs/opennextjs-cloudflare/issues/972
- NPM: https://www.npmjs.com/package/@opennextjs/cloudflare
- Releases: https://github.com/opennextjs/opennextjs-cloudflare/releases

**Community:**
- Reddit: r/nextjs
- X/Twitter: #nextjs hashtag
- Discord: Next.js Discord server

### Reassessment Date
**December 2025** - Check dependency status and reassess upgrade viability.

---

## Alternative Auth Options (If better-auth Never Updates)

### Option A: NextAuth.js v5
- Has Next.js 16 support roadmap
- Migration effort: 4-8 hours
- Loss of better-auth features

### Option B: Custom Auth
- Use jose (JWT library) + session cookies
- Migration effort: 8-16 hours
- Full control, more maintenance

### Option C: Cloudflare Access
- Zero Trust authentication
- No code changes
- Limits to Cloudflare ecosystem

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Auth breaks in production | HIGH | CRITICAL | Wait for better-auth update |
| Middleware/proxy incompatibility | MEDIUM | HIGH | Use workaround temporarily |
| Cloudflare binding issues | LOW | HIGH | Test in preview |
| Turbopack build failures | LOW | MEDIUM | Revert with --webpack flag |
| React 19 component issues | LOW | MEDIUM | Already using React 19.1.0 |

---

## References

- [Next.js 16 Release](https://nextjs.org/blog/next-16)
- [Upgrade Guide](https://nextjs.org/docs/app/guides/upgrading/version-16)
- [better-auth Issue #5263](https://github.com/better-auth/better-auth/issues/5263)
- [OpenNext Issue #972](https://github.com/opennextjs/opennextjs-cloudflare/issues/972)
- [Codemod Tool](https://nextjs.org/docs/app/guides/codemod)

---

**Last Updated:** 2025-11-08
**Next Review:** 2025-12-08
