# Production Checklist — Clinic Booking System Frontend

---

## Security

### Authentication

- [ ] Access token (15m) stored in-memory (React state) — lost on page refresh, re-hydrated via `/auth/me`
- [ ] Refresh token stored in httpOnly cookie (set by backend `Set-Cookie` header)
- [ ] Refresh token rotation implemented — old token revoked on every refresh (backend handles)
- [ ] Automatic token refresh via 401 interceptor in API client — queues concurrent requests during refresh
- [ ] On refresh failure → clear AuthProvider state, redirect to `/login`
- [ ] `middleware.ts` protects all `/dashboard`, `/admin`, `/appointments` routes
- [ ] Login rate limiting — client-side throttle (3 attempts, 30s cooldown)
- [ ] Session timeout after inactivity (configurable, e.g., 24h → force re-login)

### Authorization

- [ ] Route guards check both authentication AND role (patient/doctor/admin)
- [ ] API client never logs or exposes tokens in console
- [ ] Admin routes check `MANAGE_*` permissions via backend (backend is source of truth)
- [ ] UI hides elements the user doesn't have permission for (defense in depth)
- [ ] `/me` and `/mine` endpoints used for self-service (backend enforces ownership)
- [ ] No sensitive role/permission logic solely in client-side code

### Data Protection

- [ ] All API calls use HTTPS in production
- [ ] `Authorization` header never leaks via referrer headers
- [ ] Token stored in httpOnly cookie — not accessible via `document.cookie` or `localStorage`
- [ ] Zod schemas on client mirror backend validation (defense in depth — never trust client)
- [ ] Input sanitization for all user text inputs (XSS prevention)
- [ ] Content Security Policy (CSP) headers set on responses
- [ ] `next/image` remote patterns whitelist for doctor photos (future)
- [ ] No secrets in client bundle — `NEXT_PUBLIC_*` only for public values (API base URL, etc.)

### Common Vulnerabilities

- [ ] CSRF protection via httpOnly cookie (SameSite=Lax) and backend validation
- [ ] XSS prevention — React auto-escapes, avoid `dangerouslySetInnerHTML`
- [ ] Clickjacking — `X-Frame-Options: DENY` or `Content-Security-Policy: frame-ancestors 'none'`
- [ ] Open redirect — validate `callbackUrl` against whitelist
- [ ] No `eval()` or dynamic `require()`/`import()` with user input

---

## Performance

### Rendering Strategy

- [ ] Public pages (doctor listing, clinic listing) = Server Components with ISR (revalidate: 300)
- [ ] Doctor detail pages = Server Components with ISR (revalidate: 300)
- [ ] Dashboard pages = RSC shell with client sub-components for live data
- [ ] Admin management pages = Client Components (high interactivity)
- [ ] Critical CSS inlined via Next.js built-in optimization
- [ ] Route segment configures `dynamic`, `revalidate`, `fetchCache` appropriately

### Caching

- [ ] TanStack Query `staleTime` configured per data type (5min for doctors, 30s for slots)
- [ ] TanStack Query `gcTime` set to 5min for all queries
- [ ] `keepPreviousData` enabled for paginated lists
- [ ] Prefetch next page on hover/intersection for smooth pagination
- [ ] Optimistic updates for appointment booking (immediate UI response)
- [ ] `queryClient.invalidateQueries` scoped to specific keys (not `.invalidateAll()`)
- [ ] Static assets (images, fonts) cached via CDN with immutable `Cache-Control`

### Bundle Optimization

- [ ] Dynamic imports for: admin panels, form dialogs, heavy chart libraries
- [ ] `next/dynamic` with `ssr: false` for client-only components (date pickers, charts)
- [ ] Bundle analyzer run and reviewed before production build
- [ ] Lodash-style imports avoided (use native or tree-shakeable alternatives)
- [ ] `@next/bundle-analyzer` used to identify large dependencies
- [ ] shadcn/ui components imported individually (not as a barrel)
- [ ] Icons imported individually (lucide-react tree-shaken by default)

### Image Optimization

- [ ] All images use `next/image` with explicit `width`, `height`, `placeholder="blur"`
- [ ] Remote images configured in `next.config.js` `remotePatterns`
- [ ] Icons as SVGs (inline or sprite)
- [ ] No unoptimized PNGs > 100KB
- [ ] WebP/AVIF format with `next/image` automatic format negotiation

---

## Quality

### Testing

- [ ] Unit tests for all API client functions (features/*/api/*.ts)
- [ ] Unit tests for all Zod schemas (features/*/schemas/*.ts)
- [ ] Component tests for: DataTable, forms, auth flow (LoginForm, RegisterForm)
- [ ] Component tests for: error states, loading states, empty states
- [ ] Integration tests for: booking flow, admin CRUD flows
- [ ] E2E tests (Playwright) for: registration → login → book appointment → cancel → review
- [ ] E2E tests for: admin login → doctor CRUD → appointment management
- [ ] E2E tests for: auth guard redirects (unauthenticated → login)
- [ ] E2E tests for: role-based route access (patient cannot access /admin)
- [ ] Test coverage threshold: > 80% for features/*/api/, features/*/schemas/
- [ ] MSW (Mock Service Worker) for API mocking in tests

### Accessibility

- [ ] All forms have proper `<label>` elements linked to inputs
- [ ] Error messages associated with inputs via `aria-describedby`
- [ ] Data tables use proper `<table>`, `<th>`, `scope` attributes
- [ ] Interactive elements have visible focus indicators
- [ ] Color contrast meets WCAG AA (4.5:1 for normal text, 3:1 for large)
- [ ] All images have meaningful `alt` text
- [ ] Keyboard navigation works for all interactive components
- [ ] Skip-to-content link present
- [ ] Screen reader announcements for dynamic content (toast, loading)
- [ ] Role-based UI changes announced (e.g., "Admin panel loaded")
- [ ] Axe-core or Lighthouse CI in CI pipeline

### SEO

- [ ] All public pages have unique `<title>` and `<meta name="description">`
- [ ] Open Graph tags for public pages (`og:title`, `og:description`, `og:image`)
- [ ] Canonical URLs for all pages
- [ ] Sitemap generated (`app/sitemap.ts`)
- [ ] `robots.txt` allows public pages, disallows `/admin`, `/dashboard`, `/appointments`
- [ ] Semantic HTML structure (`<main>`, `<nav>`, `<article>`, `<section>`)
- [ ] Structured data (JSON-LD) for doctors, clinics (future)
- [ ] Server Components for SEO-critical public pages
- [ ] No client-side rendering for searchable content

### Error Handling

- [ ] Global error boundary (`app/error.tsx`) with "Try Again" button
- [ ] Per-segment error boundaries for admin screens (isolated failures)
- [ ] `notFound()` called for 404s from API (e.g., doctor detail)
- [ ] TanStack Query `onError` shows toast for all mutations
- [ ] Network error detection: retry with exponential backoff (TanStack Query default: 3 retries)
- [ ] Form submission errors map Zod issues to specific fields
- [ ] 401 → clear session + redirect `/login`
- [ ] 403 → toast "You don't have permission" + redirect to appropriate page
- [ ] 409 → user-friendly conflict message (e.g., "This slot was just taken")
- [ ] 500 → generic "Something went wrong" toast + log to monitoring

---

## Deployment

### Environment Variables

```env
# Required
NEXT_PUBLIC_API_URL=https://api.clinic-booking.com/api/v1

# Optional with defaults
NEXT_PUBLIC_APP_NAME=Clinic Booking
NEXT_PUBLIC_CONTACT_EMAIL=support@clinic-booking.com
NEXT_PUBLIC_DEFAULT_PAGE_SIZE=20
```

- [ ] `NEXT_PUBLIC_API_URL` points to production backend
- [ ] `NEXT_PUBLIC_*` variables are safe to expose to client
- [ ] No secret keys in `NEXT_PUBLIC_*` variables
- [ ] All env vars documented in `.env.example`

### CI/CD Pipeline (GitHub Actions)

- [ ] CI runs on every PR: `npm run typecheck`, `npm run lint`, `npm run test`
- [ ] CI runs on push to `main`: typecheck + lint + test + build
- [ ] Preview deployments for every PR (Vercel/Cloudflare Pages)
- [ ] Production deployment on merge to `main` (with approval gate)
- [ ] E2E tests run against preview deployment
- [ ] Lighthouse CI runs on preview for performance/accessibility regression
- [ ] Bundle size diff reported on PRs

### Build Configuration

- [ ] `next.config.ts` configured:
  - [ ] `output: "standalone"` for Docker/container deployment
  - [ ] `images.remotePatterns` whitelist
  - [ ] `headers` for CSP, HSTS, X-Frame-Options
  - [ ] `redirects` for old/typo routes
- [ ] TypeScript strict mode enabled (mirrors backend)
- [ ] ESLint configured with `@typescript-eslint` strict rules
- [ ] `npm run build` passes without errors or warnings
- [ ] Build output size reviewed (< 500KB initial JS per page)

### Monitoring & Observability

- [ ] Error monitoring (Sentry) configured for both client and server
- [ ] Performance monitoring (Web Vitals) tracked
- [ ] API response times logged
- [ ] Authentication failures logged (rate limit monitoring)
- [ ] Health check endpoint mirrored from backend for monitoring

### Production Readiness

- [ ] All console.log/console.debug removed or replaced with logger
- [ ] `NODE_ENV=production` set on production server
- [ ] Rate limiting on login form (client + backend)
- [ ] Graceful shutdown handling
- [ ] Backend API URL configurable per environment (dev, staging, prod)
- [ ] Feature flags for staged rollout (future)
- [ ] Maintenance mode page (future)

---

## Pre-Launch Verification

### Functional Testing

- [ ] Full patient journey: register → browse → book → cancel → review
- [ ] Full admin journey: login → create doctor → manage appointments → manage users
- [ ] Error scenarios: invalid login, slot conflict, permission denied, 404
- [ ] Empty states: no doctors, no appointments, no data
- [ ] Edge cases: very long names, special characters, rapid double-clicks
- [ ] Mobile responsiveness: all screens tested at 320px, 768px, 1024px, 1440px

### Performance Validation

- [ ] Lighthouse score > 90 for all categories on desktop
- [ ] Lighthouse score > 80 for all categories on mobile
- [ ] First Contentful Paint (FCP) < 1.5s
- [ ] Largest Contentful Paint (LCP) < 2.5s
- [ ] First Input Delay (FID) < 100ms
- [ ] Cumulative Layout Shift (CLS) < 0.1
- [ ] Initial JS bundle < 150KB per page
- [ ] Lighthouse CI gates on PRs

### Security Validation

- [ ] OWASP Top 10 reviewed for frontend attack surface
- [ ] No secrets in client bundle (checked via `npm run build` + inspect)
- [ ] CSP headers set and valid
- [ ] No open redirects with `callbackUrl`
- [ ] SQL injection not applicable (REST API)
- [ ] XSS vectors reviewed (all user input rendered via React)

---

## Post-Launch

- [ ] Error monitoring alert thresholds configured
- [ ] Performance baseline established
- [ ] Accessibility monitoring scheduled (weekly Lighthouse CI)
- [ ] Dependency update strategy: Dependabot/Renovate configured
- [ ] Backup and rollback plan documented
