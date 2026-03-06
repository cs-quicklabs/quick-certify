# Frontend Bug Report — Quick Certify

> Generated: 2026-03-03
> Reviewer: Senior Frontend / Next.js Audit
> Branch: `refactor/frontend-route`
> Last updated: 2026-03-03 — Code review pass on refactor/frontend-route (BUG-021 → BUG-033 added; BUG-021–BUG-025 fixed)

---

## Route & Route Group Audit

> Added: 2026-03-03 | Based on full `app/` directory and `config/routes.ts` inspection
> **Status: All 11 route bugs FIXED in `501bcb0`. Route group consolidation completed in `160d54d`.**

---

### Actual App Directory Structure (updated after `160d54d`)

```
app/
├── page.tsx                          → / (redirects to /login) ✓
├── layout.tsx                        → root layout ✓
├── not-found.tsx                     ✓
├── providers.tsx                     ✓
│
├── (auth)/                           ← Route group: applies AuthLayout (Logo + centered)
│   ├── layout.tsx                    ← Centered logo layout ✓
│   ├── login/page.tsx                → /login ✓
│   ├── signup/page.tsx               → /signup ✓
│   ├── signup/complete/page.tsx      → /signup/complete ✓
│   ├── forgot-password/page.tsx      → /forgot-password ✓
│   ├── reset-password/page.tsx       → /reset-password ✓
│   ├── invitation/page.tsx           → /invitation ✓
│   └── auth/                         ← ✅ MOVED in from root (160d54d)
│       ├── callback/page.tsx         → /auth/callback ✓ (card only — Logo inherited from layout)
│       └── error/page.tsx            → /auth/error ✓   (card only — Logo inherited from layout)
│
├── (dashboard)/                      ← Route group: applies DashboardLayout (auth guard + Header)
│   ├── layout.tsx                    ← Auth guard + Header ✓
│   ├── dashboard/page.tsx            → /dashboard ✓
│   ├── credentials/page.tsx          → /credentials ✓
│   ├── credentials/[id]/page.tsx     → /credentials/:id ✓
│   ├── credentials/issue/page.tsx    → /credentials/issue ✓
│   ├── pathways/page.tsx             → /pathways ✓
│   ├── pathways/add/page.tsx         → /pathways/add ✓
│   ├── pathways/edit/page.tsx        → /pathways/edit ✓
│   ├── pathways/[id]/page.tsx        → /pathways/:id ✓
│   ├── pathways/[id]/participants/.. → /pathways/:id/participants/:uuid ✓
│   ├── events/                       ← ✅ MOVED in from root (501bcb0)
│   │   ├── page.tsx                  → /events ✓
│   │   ├── add/page.tsx              → /events/add ✓
│   │   └── edit/page.tsx             → /events/edit ✓
│   ├── designs/                      ← ✅ MOVED in from root (501bcb0)
│   │   ├── layout.tsx                ← Thin layout for @modal slot only ✓
│   │   ├── page.tsx                  → /designs ✓
│   │   ├── add/page.tsx              → /designs/add ✓
│   │   ├── edit/[id]/page.tsx        → /designs/:id/edit ✓
│   │   ├── preview/[id]/page.tsx     → /designs/:id/preview ✓
│   │   ├── @modal/(.)preview/[id]    → intercepting route ✓
│   │   └── _components/              ← shared design components ✓
│   ├── admin/                        ← ✅ MOVED in from root (160d54d)
│   │   └── organizations/page.tsx    → /admin/organizations ✓ (layout deleted — inherited)
│   └── settings/
│       ├── page.tsx                  → /settings (redirects to /settings/profile) ✓
│       ├── profile/                  ← ✅ MOVED in from root (160d54d)
│       │   ├── layout.tsx            ← Sidebar only — no AuthGuard/Header (inherited) ✓
│       │   ├── general/page.tsx      → /settings/profile/general ✓
│       │   ├── password/page.tsx     → /settings/profile/password ✓
│       │   └── email-preferences/page.tsx
│       ├── account/                  ← ✅ MOVED in from root (160d54d)
│       │   ├── layout.tsx            ← Sidebar (accountSidebarItems) — inherited auth ✓
│       │   ├── general-information/page.tsx
│       │   ├── social-links/page.tsx
│       │   ├── branding/page.tsx
│       │   ├── billing-information/page.tsx
│       │   ├── skills/page.tsx
│       │   └── issuer-portal/page.tsx → /settings/account/issuer-portal ✓
│       ├── team/                     ← ✅ MOVED in from root (160d54d)
│       │   │                           (layout deleted — identical to dashboard layout)
│       │   ├── page.tsx, add/page.tsx
│       │   └── [uuid]/page.tsx, [uuid]/edit/page.tsx
│       ├── archived/                 ← ✅ MOVED in from root (160d54d)
│       │   ├── layout.tsx            ← Sidebar (archivedSidebarItems) — inherited auth ✓
│       │   └── page.tsx
│       └── event/                    ← ✅ MOVED in from root (160d54d, now protected by dashboard)
│           ├── type/page.tsx         → /settings/event/type ✓
│           ├── level/page.tsx        → /settings/event/level ✓
│           └── format/page.tsx       → /settings/event/format ✓
│
└── public/
    └── company/[slug]/...            → Public unauthenticated routes ✓
    └── credential/[uuid]/...         → Public unauthenticated routes ✓
```

---

### ROUTE-001 — ✅ FIXED (`501bcb0`)

**Was:** `ROUTES.AUTH.GOOGLE_CALLBACK: '/auth/google/callback'` → 404
**Fix:** Changed to `'/auth/callback'` to match actual `app/auth/callback/page.tsx`

---

### ROUTE-002 — ✅ FIXED (`501bcb0`)

**Was:** `ROUTES.SETTINGS.ACCOUNT.PORTAL: '/settings/account/portal'` → 404
**Fix:** Changed to `'/settings/account/issuer-portal'` to match actual directory name

---

### ROUTE-003 — ✅ FIXED (`501bcb0`)

**Was:** No server-side auth — only client-side `useEffect` redirects
**Fix:** `proxy.ts` was already present but had an incorrect `accessToken` cookie name, stale `/auth/google/callback` in public routes, and missing `/pathways` and `/admin` in protected routes. All three corrected.

> Note: The project uses `proxy.ts` (not `middleware.ts`). `TOKEN_KEY = 'accessToken'` in `api-client.ts` — proxy reads `request.cookies.get('accessToken')`.

---

### ROUTE-004 — ✅ FIXED (`501bcb0`)

**Was:** `(dashboard)/settings/layout.tsx` sidebar linked to `/settings/password` and `/settings/email` → 404
**Fix:** Layout deleted entirely (it was dead code — see ROUTE-011)

---

### ROUTE-005 — ✅ FIXED (`501bcb0`) → further improved (`160d54d`)

**Was:** 5 layouts with no auth guard — unauthenticated users could access protected pages
**Fix (`501bcb0`):** Added `AuthGuard` wrapper to all 5 layouts.
**Follow-up (`160d54d`):** All 5 routes moved into `(dashboard)` route group. `AuthGuard` removed from every layout (auth now inherited from `(dashboard)/layout.tsx`). `AuthGuard` component itself deleted as it is no longer used anywhere.

---

### ROUTE-006 — ✅ FIXED (`501bcb0`)

**Was:** Duplicate invitation pages at `/invitation` and `/auth/invitation` with divergent implementations
**Fix:** Deleted `app/auth/invitation/page.tsx`. The canonical `(auth)/invitation/page.tsx` is kept.

---

### ROUTE-007 — ✅ FIXED (`501bcb0`) → further improved (`160d54d`)

**Was:** Auth guard code copy-pasted across `(dashboard)/layout.tsx`, `events/layout.tsx`, `designs/layout.tsx`
**Fix (`501bcb0`):** Extracted `AuthGuard` component; used by all 5 previously unprotected layouts.
**Follow-up (`160d54d`):** All routes consolidated into `(dashboard)` — `AuthGuard` became unnecessary and was deleted entirely. Auth duplication is now fully eliminated.

---

### ROUTE-008 — ✅ FIXED (`501bcb0`)

**Was:** Orphan pages `events/event-formats/`, `events/event-levels/`, `events/event-types/` — unreachable via any route constant or nav link
**Fix:** All three deleted.

---

### ROUTE-009 — ✅ FIXED (`501bcb0`)

**Was:** `events/` and `designs/` at app root with duplicated auth logic; `designs/layout.tsx` silently returned `null` with no redirect
**Fix:** Both moved into `(dashboard)/` route group. Auth inherited from `(dashboard)/layout.tsx`. A thin `(dashboard)/designs/layout.tsx` handles only the parallel `@modal` slot. All `_components/` co-located imports updated to relative paths.

---

### ROUTE-010 — ✅ FIXED (`501bcb0`)

**Was:** `ROUTES.AUTH.GOOGLE_LOGIN: '/auth/google/login'` — backend OAuth URL incorrectly in frontend routes config
**Fix:** Entry removed from `routes.ts`

---

### ROUTE-011 — ✅ FIXED (`501bcb0`)

**Was:** `(dashboard)/settings/layout.tsx` — permanently dead code, never rendered due to immediate redirect in `settings/page.tsx`
**Fix:** File deleted.

---

### Route Group Consolidation — ✅ DONE (`160d54d`)

Following the initial fix pass, the remaining pages that still lived outside their natural route groups were consolidated. No URLs changed.

| Area | Before | After | Change |
|---|---|---|---|
| `auth/callback`, `auth/error` | `app/auth/` (root layout) | `app/(auth)/auth/` | Inherit Logo + centering from `(auth)/layout.tsx`; outer shell + Logo stripped from pages |
| `admin/organizations` | `app/admin/organizations/` (own layout) | `app/(dashboard)/admin/organizations/` | Layout deleted — identical to dashboard layout |
| `settings/*` (5 subdirs) | `app/settings/` (each with `AuthGuard + Header`) | `app/(dashboard)/settings/` | `AuthGuard` + `Header` removed from each layout (inherited); team layout deleted; `<main>` → `<div>`; duplicate `lg:px-8` removed |
| `AuthGuard` component | `components/layout/AuthGuard.tsx` | Deleted | No longer used anywhere — all guarded routes now live inside `(dashboard)/layout.tsx` |

---

### Summary Table — Route & Route Group Bugs

| ID | File / Location | Severity | Status |
|---|---|---|---|
| ROUTE-001 | `routes.ts` | 🔴 Critical | ✅ Fixed `501bcb0` |
| ROUTE-002 | `routes.ts` | 🔴 Critical | ✅ Fixed `501bcb0` |
| ROUTE-003 | `proxy.ts` | 🔴 Critical | ✅ Fixed `501bcb0` |
| ROUTE-004 | `(dashboard)/settings/layout.tsx` | 🔴 Critical | ✅ Fixed `501bcb0` (deleted) |
| ROUTE-005 | `settings/*/layout.tsx`, `admin/*/layout.tsx` | 🔴 Critical | ✅ Fixed `501bcb0` |
| ROUTE-006 | `auth/invitation/page.tsx` | 🟠 High | ✅ Fixed `501bcb0` (deleted) |
| ROUTE-007 | `(dashboard)`, `events/`, `designs/` layouts | 🟠 High | ✅ Fixed `501bcb0` |
| ROUTE-008 | `events/event-formats`, `event-levels`, `event-types` | 🟠 High | ✅ Fixed `501bcb0` (deleted) |
| ROUTE-009 | `events/`, `designs/` directories | 🟠 High | ✅ Fixed `501bcb0` |
| ROUTE-010 | `routes.ts` | 🟡 Medium | ✅ Fixed `501bcb0` |
| ROUTE-011 | `(dashboard)/settings/layout.tsx` | 🟡 Medium | ✅ Fixed `501bcb0` (deleted) |

*Route section total: 4 Critical · 4 High · 3 Medium — **all resolved** (`501bcb0` + `160d54d`)*

---

---

## Code Review Findings — `refactor/frontend-route`

> Added: 2026-03-03 | Full review of all 43 staged files against CLAUDE.md best practices.
> **5 critical issues FIXED in this branch. 8 issues remain open.**

### Changes Made (Fixed)

| ID | File(s) | Issue | Fix Applied |
|---|---|---|---|
| BUG-021 | `headerNav.config.ts`, `header.tsx`, `EventForm.tsx`, `public/.../page.tsx` | Hardcoded route strings in 4 files (12 instances total) | Replaced all with `ROUTES.*` / `createRoute.*`; added `ROUTES.SETTINGS.ARCHIVED` and `createRoute.publicRecipientDetail` to `routes.ts` |
| BUG-022 | `events/page.tsx`, `CredentialDetailView.tsx` | Duplicate error toasts — inline handler fires on top of global `MutationCache` | Removed `showErrorToast` catch block in `events/page.tsx`; removed `onError` from `resendCredential.mutate` in `CredentialDetailView.tsx` |
| BUG-023 | `CredentialCards.tsx`, `CredentialTable.tsx` | `formatDate` defined identically in both files; `CredentialLayout.tsx` already exports it | Removed local definitions; imported `formatDate` from `./CredentialLayout` in both files |
| BUG-024 | `EventForm.tsx` line 123 | `showSuccessToast` used for a validation error ("Please complete current step") — green toast shown for a failure state | Changed to `showErrorToast` |
| BUG-025 | `dashboard/page.tsx` | `const { user } = useAuthStore()` subscribes to entire store; re-renders on any auth state change (loading, error flags, etc.) | Replaced with `const user = useUser()` selector hook |

---

## Legend

| Severity | Description |
|---|---|
| 🔴 Critical | Breaks functionality in production right now |
| 🟠 High | Security risk or significant user-facing defect |
| 🟡 Medium | Performance, maintainability, or reliability concern |
| 🔵 Low | Code consistency, style, or minor correctness issue |

---

## 🔴 Critical Bugs

---

### BUG-001 — Manual `Content-Type` header breaks multipart file uploads

**File:** `apps/frontend/src/services/api/file.service.ts` (~line 30–37)
**Severity:** 🔴 Critical
**Category:** API / Networking
**Status:** ⏳ Open

**Problem:**
Manually setting `Content-Type: multipart/form-data` without a boundary string causes the server to reject the request. Axios auto-generates the correct `multipart/form-data; boundary=...` header when it detects a `FormData` body. Overriding it removes the boundary, making the request unparseable on the backend.

```typescript
// ❌ Current — breaks multipart upload (missing boundary)
headers: { 'Content-Type': 'multipart/form-data' }
```

**Fix:**
```typescript
// ✅ Remove the Content-Type header entirely — Axios handles it
const response = await apiClient.post('/files/upload', formData);
```

---

### BUG-002 — Full page reload on session expiry breaks SPA state

**File:** `apps/frontend/src/services/api/api-client.ts` (~line 188)
**Severity:** 🔴 Critical
**Category:** Navigation / UX
**Status:** ⏳ Open

**Problem:**
Using `window.location.href = '/login'` on 401 causes a full browser navigation, destroying the entire React tree, React Query cache, and Zustand store. This means any in-progress user work is lost with no warning. It also bypasses Next.js middleware and route guards.

```typescript
// ❌ Current — full page reload, destroys all client state
window.location.href = '/login';
```

**Fix:**
Create a router singleton that can be accessed outside of React components and use it for navigation:

```typescript
// lib/router.ts
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context';

let _router: AppRouterInstance | null = null;
export const setRouter = (r: AppRouterInstance) => { _router = r; };
export const getRouter = () => _router;

// In providers.tsx — register the router
const router = useRouter();
useEffect(() => { setRouter(router); }, [router]);

// ✅ In api-client.ts — SPA navigation without page reload
import { getRouter } from '@/lib/router';
import { ROUTES } from '@/config/routes';
getRouter()?.push(ROUTES.AUTH.LOGIN);
```

---

### BUG-003 — Environment variable naming inconsistency causes silent failures

**File:** `apps/frontend/next.config.js` (~line 32) vs `apps/frontend/src/config/env.ts`
**Severity:** 🔴 Critical
**Category:** Configuration
**Status:** ⏳ Open

**Problem:**
`next.config.js` references `process.env.BACKEND_BASE_API_URL` for the API rewrite destination, while `env.ts` reads `NEXT_PUBLIC_API_BASE_URL`. If only one of these is set in `.env`, the app silently breaks — API rewrites fail or the client-side base URL is undefined, producing cryptic network errors.

```typescript
// next.config.js — uses BACKEND_BASE_API_URL
destination: `${process.env.BACKEND_BASE_API_URL}/:path*`

// env.ts — uses NEXT_PUBLIC_API_BASE_URL
apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL
```

**Fix:**
Decide on one canonical variable per purpose and update all references. Document both in `.env.example`:

```bash
# .env.example
BACKEND_BASE_API_URL=http://localhost:3001        # used by next.config.js (server-side rewrite)
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000    # used by client-side axios instance
```

---

### BUG-021 — Hardcoded route strings across multiple components ✅ FIXED

**Files:** `components/layout/header.tsx`, `config/headerNav.config.ts`, `components/events/EventForm.tsx`, `app/public/company/[slug]/events/[uuid]/page.tsx`
**Severity:** 🔴 Critical
**Category:** Routes / Maintainability
**Status:** ✅ Fixed (this branch)

**Problem:**
12 hardcoded route strings across 4 files, bypassing the `ROUTES` / `createRoute` system entirely. Future route refactors would silently produce dead links in navigation, breadcrumbs, and post-action redirects.

Notable instances:
- `headerNav.config.ts` — all 9 nav hrefs hardcoded (`'/dashboard'`, `'/designs'`, `'/events'`, etc.)
- `header.tsx` — `window.location.href = '/login'` post-logout, `href="/dashboard"` logo link
- `EventForm.tsx` — `router.push('/events')` three times (submit, cancel, onCancel config)
- `public/.../page.tsx` — three breadcrumb/participant links using template literals

**Fix applied:**
- Added `ROUTES.SETTINGS.ARCHIVED` and `createRoute.publicRecipientDetail(slug, uuid)` to `routes.ts`
- Replaced all hardcoded strings with `ROUTES.*` and `createRoute.*` equivalents

---

### BUG-022 — Duplicate error toasts from mutateAsync + global MutationCache ✅ FIXED

**Files:** `app/(dashboard)/events/page.tsx`, `components/credentials/CredentialDetailView.tsx`
**Severity:** 🔴 Critical
**Category:** UX / React Query
**Status:** ✅ Fixed (this branch)

**Problem:**
Two patterns in conflict with the project's global `MutationCache` error handler:

1. `events/page.tsx` — `handleDeleteEvent` wraps `mutateAsync` in `try/catch` and calls `showErrorToast` in the catch block. The global handler also fires, producing two error toasts for the same failure.
2. `CredentialDetailView.tsx` — `resendCredential.mutate(uuid, { onError: () => showErrorToast(...) })` — per-call `onError` fires in addition to the global handler.

**Fix applied:**
- Removed `showErrorToast` from the catch block in `handleDeleteEvent` (`finally` block for state reset kept intact)
- Removed the `onError` callback from `resendCredential.mutate` in `CredentialDetailView.tsx`
- Cleaned up unused `showErrorToast` imports in both files

---

### BUG-023 — `formatDate` DRY violation in credential components ✅ FIXED

**Files:** `components/credentials/CredentialCards.tsx`, `components/credentials/CredentialTable.tsx`
**Severity:** 🔴 Critical
**Category:** DRY / Maintainability
**Status:** ✅ Fixed (this branch)

**Problem:**
Identical `formatDate(date: string | null)` function defined locally in both `CredentialCards.tsx` and `CredentialTable.tsx`. `CredentialLayout.tsx` already exports this exact function. Three copies of the same logic with no single source of truth.

**Fix applied:**
Removed local definitions from both files; added `import { formatDate } from './CredentialLayout'` to each.

---

### BUG-024 — `showSuccessToast` used for a validation error in `EventForm.tsx` ✅ FIXED

**File:** `apps/frontend/src/components/events/EventForm.tsx` (line 123)
**Severity:** 🔴 Critical
**Category:** UX / Toast Handling
**Status:** ✅ Fixed (this branch)

**Problem:**
When a user tries to navigate to a step they haven't completed yet, the app shows a **green success toast** saying "Please complete the current step first" — communicating a failure state with a success affordance.

```typescript
// ❌ Before
showSuccessToast('Please complete the current step first');
```

**Fix applied:**
```typescript
// ✅ After
showErrorToast('Please complete the current step first');
```

---

## 🟠 High Priority Bugs

---

### BUG-004 — Auth cookie missing `Secure` flag

**File:** `apps/frontend/src/services/api/api-client.ts` (~line 170)
**Severity:** 🟠 High
**Category:** Security
**Status:** ⏳ Open

**Problem:**
The auth token cookie is set without the `Secure` flag, meaning it can be transmitted over plain HTTP.

```typescript
// ❌ Current — transmitted over HTTP
document.cookie = `${TOKEN_KEY}=${accessToken}; path=/; max-age=604800; SameSite=Lax`;
```

**Fix:**
```typescript
// ✅ Add Secure flag
document.cookie = `${TOKEN_KEY}=${accessToken}; path=/; max-age=604800; SameSite=Lax; Secure`;
```

---

### BUG-005 — Predictable session ID generation

**File:** `apps/frontend/src/services/api/api-client.ts` (~line 167)
**Severity:** 🟠 High
**Category:** Security
**Status:** ⏳ Open

**Problem:**
`Date.now().toString()` generates a session ID based on the current timestamp in milliseconds. This is deterministic and trivially guessable.

```typescript
// ❌ Current — deterministic, guessable
const sessionId = Date.now().toString();
```

**Fix:**
```typescript
// ✅ Cryptographically random
const sessionId = crypto.randomUUID();
```

---

### BUG-006 — `skill.service.ts` does not use shared `buildUrl` utility

**File:** `apps/frontend/src/services/api/skill.service.ts` (~lines 35–40)
**Severity:** 🟠 High
**Category:** Code Consistency / Maintainability
**Status:** ⏳ Open

**Problem:**
Every other service uses the shared `buildUrl` helper to construct query strings. `skill.service.ts` manually constructs params with `URLSearchParams`.

```typescript
// ❌ Current — manual, inconsistent
const params = new URLSearchParams();
if (filters?.search) params.append('search', filters.search);
const url = `/skills?${params.toString()}`;
```

**Fix:**
```typescript
// ✅ Use the shared utility
import { buildUrl } from '@/lib/query-params';
const url = buildUrl('/skills', filters);
```

---

### BUG-007 — `useClickOutside` callback causes listener churn on every render

**File:** `apps/frontend/src/hooks/useClickOutside.ts` (~line 23)
**Severity:** 🟠 High
**Category:** React Hooks / Performance
**Status:** ⏳ Open

**Problem:**
The `callback` passed by the parent is in the `useEffect` dependency array without stabilization. If the parent passes an inline arrow function, it is a new reference on every render, causing the event listener to be removed and re-added on every render cycle.

**Fix — use a stable ref pattern:**
```typescript
export function useClickOutside<T extends HTMLElement>(
  ref: RefObject<T>,
  callback: (event: MouseEvent) => void
) {
  const callbackRef = useRef(callback);
  useLayoutEffect(() => { callbackRef.current = callback; });

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        callbackRef.current(e);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [ref]);
}
```

---

### BUG-008 — Unsafe error type cast in `useEvents` retry logic

**File:** `apps/frontend/src/hooks/useEvents.ts` (~lines 280–284)
**Severity:** 🟠 High
**Category:** TypeScript / Error Handling
**Status:** ⏳ Open

**Problem:**
Casting `error` to `{ status: number }` without a type guard silently returns `undefined` for `status` if the error shape differs, causing infinite retries on network errors.

```typescript
// ❌ Current — unsafe cast
retry: (_, error) => (error as { status: number }).status !== 404,
```

**Fix:**
```typescript
import { isAxiosError } from 'axios';

// ✅ Type-safe
retry: (_, error) => {
  if (isAxiosError(error)) return error.response?.status !== 404;
  return false;
},
```

---

### BUG-009 — No error monitoring in `ErrorBoundary`

**File:** `apps/frontend/src/components/ErrorBoundary.tsx` (~line 111)
**Severity:** 🟠 High
**Category:** Observability / Production Readiness
**Status:** ⏳ Open

**Problem:**
`componentDidCatch` uses `console.log` instead of `console.error`, and has a `TODO` comment noting that error monitoring (e.g., Sentry) is not integrated.

```typescript
// ❌ Current
componentDidCatch(error: Error, errorInfo: ErrorInfo) {
  console.log('ErrorBoundary caught:', error, errorInfo); // TODO: integrate Sentry
}
```

**Fix:**
```typescript
import * as Sentry from '@sentry/nextjs';

componentDidCatch(error: Error, errorInfo: ErrorInfo) {
  console.error('ErrorBoundary caught:', error, errorInfo);
  Sentry.captureException(error, { extra: { errorInfo } });
}
```

---

### BUG-027 — `header.tsx` active nav detection uses `pathname.includes()` causing false positives

**File:** `apps/frontend/src/components/layout/header.tsx` (~line 83)
**Severity:** 🟠 High
**Category:** UX / Navigation
**Status:** ⏳ Open

**Problem:**
`pathname.includes(item.href)` matches any route that *contains* the href as a substring. `/events` will be highlighted as active on `/events`, `/events/add`, and `/events/edit` — but `/designs` will falsely match on any future route containing the string `designs`.

```typescript
// ❌ Current — false positives
className={pathname.includes(item.href) ? 'selected-nav' : 'unselected-nav'}
```

**Fix:**
```typescript
// ✅ Exact match or prefix match
const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
className={isActive ? 'selected-nav' : 'unselected-nav'}
```

---

### BUG-028 — `header.tsx` mobile menu always highlights the first nav item regardless of pathname

**File:** `apps/frontend/src/components/layout/header.tsx` (~line 178)
**Severity:** 🟠 High
**Category:** UX / Navigation
**Status:** ⏳ Open

**Problem:**
The mobile nav uses `i === 0` (index check) to apply the active style, meaning Dashboard is always highlighted in the mobile menu regardless of the current page.

```typescript
// ❌ Current — always highlights Dashboard
className={`... ${i === 0 ? 'bg-gray-900 text-white' : 'text-gray-300 ...'}`}
```

**Fix:**
```typescript
// ✅ Mirror desktop logic
const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
className={`... ${isActive ? 'bg-gray-900 text-white' : 'text-gray-300 ...'}`}
```

---

## 🟡 Medium Priority Bugs

---

### BUG-010 — `useCrossTabLogout` bypasses shared token utilities

**File:** `apps/frontend/src/hooks/useCrossTabLogout.ts` (~line 91)
**Severity:** 🟡 Medium
**Category:** Code Consistency / Maintainability
**Status:** ⏳ Open

**Problem:**
Directly accesses `localStorage` for token keys instead of using `clearTokens()` from `api-client.ts`.

```typescript
// ❌ Current
localStorage.removeItem('accessToken');
localStorage.removeItem('refreshToken');
```

**Fix:**
```typescript
// ✅
import { clearTokens } from '@/services/api/api-client';
clearTokens();
```

---

### BUG-011 — `useImageUpload` exposes no loading state for remove operation

**File:** `apps/frontend/src/hooks/useImageUpload.ts`
**Severity:** 🟡 Medium
**Category:** UX / Hooks Design
**Status:** ⏳ Open

**Problem:**
The hook tracks `isUploading` but provides no `isRemoving` flag, creating a window where double-clicks can fire duplicate delete requests.

**Fix:**
```typescript
const [isUploading, setIsUploading] = useState(false);
const [isRemoving, setIsRemoving] = useState(false);

const handleRemove = async () => {
  setIsRemoving(true);
  try { await removeImage(); }
  finally { setIsRemoving(false); }
};

return { isUploading, isRemoving, handleUpload, handleRemove };
```

---

### BUG-012 — `window.location.href` hard-redirect loses React Query cache

**File:** `apps/frontend/src/services/api/api-client.ts` (~line 188)
**Severity:** 🟡 Medium (duplicate of BUG-002, additional consequence)
**Category:** Performance / UX
**Status:** ⏳ Open

**Fix:** Covered under BUG-002.

---

### BUG-013 — Triple-nested data extraction in `team.service.ts`

**File:** `apps/frontend/src/services/api/team.service.ts` (~line 132)
**Severity:** 🟡 Medium
**Category:** Code Quality / Fragility
**Status:** ⏳ Open

**Problem:**
`response.data.data.data` is a fragile extraction pattern. If the backend response shape changes at any nesting level, this silently returns `undefined`.

**Fix:**
```typescript
// lib/api-response.ts
export function extractList<T>(response: AxiosResponse<ApiListResponse<T>>): T[] {
  return response.data.data.data ?? [];
}

// ✅ In team.service.ts
return extractList<Role>(response);
```

---

### BUG-014 — `design/validate-image.ts` potential double `revokeObjectURL` call

**File:** `apps/frontend/src/lib/design/validate-image.ts` (~lines 20–25)
**Severity:** 🟡 Medium
**Category:** Memory Management
**Status:** ⏳ Open

**Fix:**
```typescript
// ✅ Revoke in a single finally block
return new Promise((resolve, reject) => {
  const url = URL.createObjectURL(file);
  const img = new Image();
  img.onload = () => resolve({ width: img.width, height: img.height });
  img.onerror = () => reject(new Error('Invalid image'));
  img.src = url;
}).finally(() => URL.revokeObjectURL(url));
```

---

### BUG-015 — `isInitialized` flag not persisted in Zustand store

**File:** `apps/frontend/src/store/auth.store.ts` (~line 74)
**Severity:** 🟡 Medium
**Category:** Auth / UX
**Status:** ⏳ Open

**Problem:**
On every page refresh, `isInitialized` resets to `false`, triggering an API call to validate the session even when a valid user is already in the persisted store.

**Fix:**
```typescript
// ✅ Short-circuit initialization if persisted user exists
initialize: async () => {
  const existingUser = get().user;
  if (existingUser) {
    set({ isInitialized: true });
    return;
  }
  // ...proceed with API validation
}
```

---

### BUG-025 — Zustand full-store subscription in `DashboardPage` ✅ FIXED

**File:** `apps/frontend/src/app/(dashboard)/dashboard/page.tsx` (line 19)
**Severity:** 🟡 Medium
**Category:** React / Performance
**Status:** ✅ Fixed (this branch)

**Problem:**
`const { user } = useAuthStore()` subscribes to the entire auth store. Any update to `isLoading`, `error`, or `isInitialized` causes the Dashboard to re-render unnecessarily.

```typescript
// ❌ Before — entire store subscription
const { user } = useAuthStore();
```

**Fix applied:**
```typescript
// ✅ After — targeted selector
const user = useUser();
```

---

### BUG-026 — `credentials/page.tsx` error detection uses raw `.message` instead of `getApiErrorMessage`

**File:** `apps/frontend/src/app/(dashboard)/credentials/page.tsx` (line 82)
**Severity:** 🟡 Medium
**Category:** Error Handling / Consistency
**Status:** ⏳ Open

**Problem:**
Parses `error?.message.includes('403')` directly on the raw error object. The established project pattern is `getApiErrorMessage(error)` from `@/lib/api-error` — as used correctly in `events/page.tsx`. This bypasses the error extraction utility and is fragile if the error shape changes.

```typescript
// ❌ Current
if (error?.message.includes('403')) {
```

**Fix:**
```typescript
// ✅
import { getApiErrorMessage } from '@/lib/api-error';
if (getApiErrorMessage(error).includes('403')) {
```

---

### BUG-029 — `EventSelector` re-implements `useClickOutside` manually

**File:** `apps/frontend/src/components/credentials/EventSelector.tsx` (lines 25–33)
**Severity:** 🟡 Medium
**Category:** DRY / Hooks
**Status:** ⏳ Open

**Problem:**
Manually attaches a `mousedown` listener for click-outside detection, duplicating the `useClickOutside` hook that already exists in the project (and is used in `credentials/page.tsx`).

```typescript
// ❌ Current — inline manual listener
useEffect(() => {
  const handleClickOutside = (e: MouseEvent) => { ... };
  document.addEventListener('mousedown', handleClickOutside);
  return () => document.removeEventListener('mousedown', handleClickOutside);
}, []);
```

**Fix:**
```typescript
// ✅ Use the existing hook
import { useClickOutside } from '@/hooks/useClickOutside';
const dropdownRef = useClickOutside<HTMLDivElement>(() => setIsOpen(false));
```

---

### BUG-030 — `EventForm.tsx` throws a raw `Error` inside an async callback

**File:** `apps/frontend/src/components/events/EventForm.tsx` (~line 177)
**Severity:** 🟡 Medium
**Category:** Error Handling
**Status:** ⏳ Open

**Problem:**
`handleStep0Submit` throws `new Error('Please select a design')` when no design is selected. This unhandled rejection is not caught by the global `MutationCache` (it is not a mutation), so it surfaces as an uncaught error in the console with no UI feedback to the user.

```typescript
// ❌ Current
if (!step0FormData.designUuid) {
  throw new Error('Please select a design');
}
```

**Fix:**
Use local error state and display it in the UI rather than throwing:
```typescript
const [designError, setDesignError] = useState<string | null>(null);

// In handleStep0Submit:
if (!step0FormData.designUuid) {
  setDesignError('Please select a design');
  return;
}
setDesignError(null);

// In JSX, below the design selector:
{designError && <p className="mt-1 text-sm text-red-600">{designError}</p>}
```

---

## 🔵 Low Priority Bugs

---

### BUG-016 — `ErrorBoundary` uses `console.log` instead of `console.error`

**File:** `apps/frontend/src/components/ErrorBoundary.tsx` (~line 111)
**Severity:** 🔵 Low
**Category:** Developer Experience
**Status:** ⏳ Open

```typescript
// ❌ Current
console.log('ErrorBoundary caught:', error, errorInfo);

// ✅ Fix
console.error('ErrorBoundary caught:', error, errorInfo);
```

---

### BUG-017 — `auth.service.ts` sets `sessionHash` to `undefined` instead of omitting it

**File:** `apps/frontend/src/services/api/auth.service.ts` (~line 252)
**Severity:** 🔵 Low
**Category:** TypeScript / API Correctness
**Status:** ⏳ Open

```typescript
// ❌ Current
const payload = { email, password, sessionHash: undefined };

// ✅ Fix
const payload = { email, password };
```

---

### BUG-018 — `design.service.ts` missing generic type on `getDesignById`

**File:** `apps/frontend/src/services/api/design.service.ts` (~line 22)
**Severity:** 🔵 Low
**Category:** TypeScript
**Status:** ⏳ Open

```typescript
// ❌ Current — implicit any return
async getDesignById(id: string) {
  const response = await apiClient.get(`/designs/${id}`);
  return response.data;
}

// ✅ Fix
async getDesignById(id: string): Promise<Design> {
  const response = await apiClient.get<ApiResponse<Design>>(`/designs/${id}`);
  return response.data.data;
}
```

---

### BUG-019 — Missing `generateMetadata` on public-facing pages

**File:** `apps/frontend/src/app/public/` (all public route pages)
**Severity:** 🔵 Low
**Category:** SEO
**Status:** ⏳ Open

**Fix:**
```typescript
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const pathway = await publicService.getPathway(params.orgSlug, params.pathwaySlug);
  return {
    title: `${pathway.name} | Quick Certify`,
    description: pathway.description,
    openGraph: {
      title: pathway.name,
      images: pathway.bannerUrl ? [pathway.bannerUrl] : [],
    },
  };
}
```

---

### BUG-020 — `form.types.ts` comment formatting typo

**File:** `apps/frontend/src/types/form.types.ts` (~line 60)
**Severity:** 🔵 Low
**Category:** Code Style
**Status:** ⏳ Open

```typescript
// ❌ Current
/** /** Field visibility config */

// ✅ Fix
/** Field visibility config */
```

---

### BUG-031 — `useEventFormInitialization.ts` accesses both `learning_link` and `learningLink`

**File:** `apps/frontend/src/hooks/useEventFormInitialization.ts` (line 70)
**Severity:** 🔵 Low
**Category:** TypeScript / Type Consistency
**Status:** ⏳ Open

**Problem:**
The hook reads `apiData.learning_link || apiData.learningLink` as a fallback, indicating a mismatch between the API response shape (snake_case) and the frontend `Event` type definition (likely camelCase). The correct fix is at the type/serialisation layer.

```typescript
// ❌ Current — double-access fallback masking a type issue
(apiData.learning_link as string) || (apiData.learningLink as string)
```

**Fix:**
Ensure the `Event` type matches the actual API response field name (`learning_link`) and remove the fallback. If camelCase is preferred, apply a response transformer in the axios interceptor or service layer.

---

### BUG-032 — `EventFormStep0.tsx` close button uses Unicode character instead of lucide icon

**File:** `apps/frontend/src/components/events/EventFormStep0.tsx` (line 136)
**Severity:** 🔵 Low
**Category:** UI Consistency
**Status:** ⏳ Open

**Problem:**
The design preview modal close button renders a raw Unicode `✕` character. The rest of the codebase uses `<X />` from `lucide-react` for close actions.

```tsx
// ❌ Current
<button ...>✕</button>

// ✅ Fix
import { X } from 'lucide-react';
<button ...><X className="w-4 h-4" /></button>
```

---

### BUG-033 — `file-dropzone.tsx` has redundant `placeholderSizeClasses` object

**File:** `apps/frontend/src/components/ui/file-dropzone.tsx` (lines 90–101)
**Severity:** 🔵 Low
**Category:** Dead Code / DRY
**Status:** ⏳ Open

**Problem:**
`imageSizeClasses` and `placeholderSizeClasses` are defined as two separate objects but map to the exact same values (`small: 'w-64 h-40'`, `large: 'w-full h-[160px]'`). `placeholderSizeClasses` is never used independently.

**Fix:**
Remove `placeholderSizeClasses` and use `imageSizeClasses` in its place.

---

## Summary Table

| ID | File | Severity | Category | Status |
|---|---|---|---|---|
| BUG-001 | `file.service.ts` | 🔴 Critical | API | ⏳ Open |
| BUG-002 | `api-client.ts` | 🔴 Critical | Navigation | ⏳ Open |
| BUG-003 | `next.config.js` / `env.ts` | 🔴 Critical | Config | ⏳ Open |
| BUG-021 | `header.tsx`, `headerNav.config.ts`, `EventForm.tsx`, public page | 🔴 Critical | Routes | ✅ Fixed (this branch) |
| BUG-022 | `events/page.tsx`, `CredentialDetailView.tsx` | 🔴 Critical | UX / React Query | ✅ Fixed (this branch) |
| BUG-023 | `CredentialCards.tsx`, `CredentialTable.tsx` | 🔴 Critical | DRY | ✅ Fixed (this branch) |
| BUG-024 | `EventForm.tsx` | 🔴 Critical | UX / Toast | ✅ Fixed (this branch) |
| BUG-004 | `api-client.ts` | 🟠 High | Security | ⏳ Open |
| BUG-005 | `api-client.ts` | 🟠 High | Security | ⏳ Open |
| BUG-006 | `skill.service.ts` | 🟠 High | Consistency | ⏳ Open |
| BUG-007 | `useClickOutside.ts` | 🟠 High | React Hooks | ⏳ Open |
| BUG-008 | `useEvents.ts` | 🟠 High | TypeScript | ⏳ Open |
| BUG-009 | `ErrorBoundary.tsx` | 🟠 High | Observability | ⏳ Open |
| BUG-027 | `header.tsx` | 🟠 High | UX / Navigation | ⏳ Open |
| BUG-028 | `header.tsx` | 🟠 High | UX / Navigation | ⏳ Open |
| BUG-010 | `useCrossTabLogout.ts` | 🟡 Medium | Consistency | ⏳ Open |
| BUG-011 | `useImageUpload.ts` | 🟡 Medium | UX | ⏳ Open |
| BUG-012 | `api-client.ts` | 🟡 Medium | Performance | ⏳ Open |
| BUG-013 | `team.service.ts` | 🟡 Medium | Fragility | ⏳ Open |
| BUG-014 | `validate-image.ts` | 🟡 Medium | Memory | ⏳ Open |
| BUG-015 | `auth.store.ts` | 🟡 Medium | Auth / UX | ⏳ Open |
| BUG-025 | `dashboard/page.tsx` | 🟡 Medium | React / Performance | ✅ Fixed (this branch) |
| BUG-026 | `credentials/page.tsx` | 🟡 Medium | Error Handling | ⏳ Open |
| BUG-029 | `EventSelector.tsx` | 🟡 Medium | DRY / Hooks | ⏳ Open |
| BUG-030 | `EventForm.tsx` | 🟡 Medium | Error Handling | ⏳ Open |
| BUG-016 | `ErrorBoundary.tsx` | 🔵 Low | DX | ⏳ Open |
| BUG-017 | `auth.service.ts` | 🔵 Low | TypeScript | ⏳ Open |
| BUG-018 | `design.service.ts` | 🔵 Low | TypeScript | ⏳ Open |
| BUG-019 | `app/public/` pages | 🔵 Low | SEO | ⏳ Open |
| BUG-020 | `form.types.ts` | 🔵 Low | Style | ⏳ Open |
| BUG-031 | `useEventFormInitialization.ts` | 🔵 Low | TypeScript | ⏳ Open |
| BUG-032 | `EventFormStep0.tsx` | 🔵 Low | UI Consistency | ⏳ Open |
| BUG-033 | `file-dropzone.tsx` | 🔵 Low | Dead Code | ⏳ Open |
| ROUTE-001 | `routes.ts` | 🔴 Critical | Routes | ✅ Fixed `501bcb0` |
| ROUTE-002 | `routes.ts` | 🔴 Critical | Routes | ✅ Fixed `501bcb0` |
| ROUTE-003 | `proxy.ts` | 🔴 Critical | Security | ✅ Fixed `501bcb0` |
| ROUTE-004 | `(dashboard)/settings/layout.tsx` | 🔴 Critical | Routes | ✅ Fixed `501bcb0` (deleted) |
| ROUTE-005 | `settings/*/layout.tsx`, `admin/*/layout.tsx` | 🔴 Critical | Security | ✅ Fixed `501bcb0` + `160d54d` |
| ROUTE-006 | `auth/invitation/page.tsx` | 🟠 High | Routes | ✅ Fixed `501bcb0` (deleted) |
| ROUTE-007 | `(dashboard)`, `events/`, `designs/` layouts | 🟠 High | DRY | ✅ Fixed `501bcb0` + `160d54d` |
| ROUTE-008 | `events/event-*` pages | 🟠 High | Dead Code | ✅ Fixed `501bcb0` (deleted) |
| ROUTE-009 | `events/`, `designs/` directories | 🟠 High | Architecture | ✅ Fixed `501bcb0` |
| ROUTE-010 | `routes.ts` | 🟡 Medium | Routes | ✅ Fixed `501bcb0` |
| ROUTE-011 | `(dashboard)/settings/layout.tsx` | 🟡 Medium | Dead Code | ✅ Fixed `501bcb0` (deleted) |
| ROUTE-012 | `auth/`, `admin/`, `settings/` outside route groups | 🟡 Medium | Architecture | ✅ Fixed `160d54d` |

---

*Code quality bugs: 7 Critical (4 fixed, 3 open) · 8 High (2 fixed, 6 open wait — let me recount*

**Code quality bugs (BUG-001 to BUG-033):**
- 🔴 Critical: 7 total — 4 fixed (BUG-021–024), 3 open (BUG-001–003)
- 🟠 High: 8 total — 0 fixed, 8 open (BUG-004–009, BUG-027–028)
- 🟡 Medium: 10 total — 2 fixed (BUG-025), 9 open (BUG-010–015, BUG-026, BUG-029–030)
- 🔵 Low: 8 total — 0 fixed, 8 open (BUG-016–020, BUG-031–033)

*Route bugs (ROUTE-001 to ROUTE-012): 12 total — **all 12 fixed** (`501bcb0` + `160d54d`)*

**Grand total: 45 bugs — 17 fixed, 28 remaining**
