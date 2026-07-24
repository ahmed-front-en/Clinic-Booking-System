# Implementation Status — Phase 0 Audit

---

## 1. Current Project State

### Repository Status

| Layer | Status |
|-------|--------|
| Backend (Express 5 + TS + PostgreSQL) | **Complete** — 79 endpoints, 11 modules, 5 migrations, JWT auth |
| Frontend Code | **In Progress** — Next.js 16 scaffold at `/workspace/frontend/` |
| Frontend Documentation | **7 documents** — 3,746 lines across API spec, architecture, plan, flows, screens, stitch map, production checklist |
| Stitch Designs | **18 screens** — 6 desktop (1280px) + 6 mobile refined (390px) + 1 tablet (768px) + 5 legacy variants |
| Design System | **Complete** — "Clinical Precision": Trust Blue `#0056b3`, Inter, light mode, Material Design 3 color system |

### Documentation Inventory

| Document | Lines | Status |
|----------|-------|--------|
| `API_SPECIFICATION.md` | 932 | ✅ Covers all 79 endpoints, types, permissions |
| `FRONTEND_ARCHITECTURE.md` | 526 | ⚠️ Contains outdated auth strategy (next-auth) |
| `IMPLEMENTATION_PLAN.md` | 643 | ✅ Updated with custom auth, no next-auth |
| `USER_FLOWS.md` | 522 | ⚠️ Contains outdated auth references (next-auth) |
| `SCREEN_IMPLEMENTATION_PLAN.md` | 539 | ✅ Maps all 27 screens |
| `STITCH_IMPLEMENTATION_MAP.md` | 336 | ✅ Design tokens, 6 screens mapped, 52 endpoints verified |
| `PRODUCTION_CHECKLIST.md` | 248 | ⚠️ Contains outdated auth references (next-auth) |

---

## 2. Confirmed Architecture Decisions

These decisions are locked in across all documents and the backend:

### Stack

| Decision | Value | Source |
|----------|-------|--------|
| Framework | Next.js 16 App Router | All docs |
| Language | TypeScript strict | All docs |
| Styling | Tailwind CSS | All docs |
| UI Library | shadcn/ui (Radix primitives) | All docs |
| Server State | TanStack Query v6 | All docs |
| Forms | React Hook Form + Zod resolver | All docs |
| Validation | Zod (mirrors backend) | All docs |
| Dates | date-fns | All docs |
| Toasts | sonner | All docs |
| Icons | lucide-react | All docs |

### Authentication (Custom — No next-auth)

| Decision | Value |
|----------|-------|
| Auth Provider | Custom React Context + Provider |
| Access Token | In-memory (React state) |
| Refresh Token | httpOnly cookie |
| Token Refresh | Automatic on 401 via API client interceptor |
| Refresh Mutex | Queue requests during refresh |
| Route Protection | Next.js `middleware.ts` |
| Role Guard | `hasPermission()` from AuthProvider |

### Design System (Stitch "Clinical Precision")

| Token | Value |
|-------|-------|
| Primary | `#0056b3` (Trust Blue) |
| Surface | `#f8f9ff` |
| On Surface | `#0b1c30` |
| On Surface Variant | `#424752` |
| Outline | `#727784` |
| Outline Variant | `#c2c6d4` |
| Error | `#ba1a1a` |
| Tertiary | `#2dd4bf` |
| Font | Inter (all typography) |
| Roundness | 4px (inputs/buttons), 8px (cards), pill (badges) |
| Spacing | 8px rhythm (xs=4, sm=8, md=16, lg=24, xl=32) |
| Elevation | White + 1px border (no heavy shadows) |
| Grid | 12-col desktop / 4-col mobile |
| Card Layout | White bg, 1px border, 8px radius |

### Folder Structure

```
src/frontend/
├── app/              # Next.js App Router (route groups)
├── features/         # Per-module: api/, components/, hooks/, schemas/, types/
├── components/       # Shared: ui/, layout/, data-display/, forms/
├── lib/              # http/, utils/, constants/
├── providers/        # query-provider.tsx, auth-provider.tsx
├── services/         # auth-service.ts
├── types/            # api.ts, records.ts
└── middleware.ts     # Route protection
```

### Screen Count

| Role | Screens | Source |
|------|---------|--------|
| Public | 6 | SCREEN_IMPLEMENTATION_PLAN.md |
| Auth | 2 | SCREEN_IMPLEMENTATION_PLAN.md |
| Patient | 7 | SCREEN_IMPLEMENTATION_PLAN.md |
| Doctor | 3 | SCREEN_IMPLEMENTATION_PLAN.md |
| Admin | 9 | SCREEN_IMPLEMENTATION_PLAN.md |
| **Total** | **27** | |

### Stitch Design Coverage

| Screen | Desktop Stitch | Mobile Stitch | Status |
|--------|---------------|---------------|--------|
| Landing Page | ✅ `e83b...` | ✅ `1b47...` | Mapped |
| Login / Register | ✅ `1911...` | ✅ `c257...` | Mapped |
| Patient Dashboard | ✅ `0c48...` | ✅ `1157...` | Mapped |
| Doctor Dashboard | ✅ `e128...` | ✅ `3333...` | Mapped |
| Booking Flow | ✅ `900e...` | ✅ `b4f5...` | Mapped |
| Admin Panel | ✅ `2e3e...` | ✅ `d644...` | Mapped |
| Doctor Listing | ❌ Not in Stitch | ❌ Not in Stitch | Needs implementation |
| Doctor Detail | ❌ Not in Stitch | ❌ Not in Stitch | Needs implementation |
| Clinic Listing | ❌ Not in Stitch | ❌ Not in Stitch | Needs implementation |
| Specialty Listing | ❌ Not in Stitch | ❌ Not in Stitch | Needs implementation |
| Appointments List | ❌ Not in Stitch | ❌ Not in Stitch | Needs implementation |
| Appointment Detail | ❌ Not in Stitch | ❌ Not in Stitch | Needs implementation |
| Patient Payments | ❌ Not in Stitch | ❌ Not in Stitch | Needs implementation |
| Patient Reviews | ❌ Not in Stitch | ❌ Not in Stitch | Needs implementation |
| Patient Profile | ❌ Not in Stitch | ❌ Not in Stitch | Needs implementation |
| Doctor Schedule | ❌ Not in Stitch | ❌ Not in Stitch | Needs implementation |

---

## 3. Risks

### Critical

| # | Risk | Impact | Mitigation |
|---|------|--------|------------|
| R1 | **No backend seed data script** — Frontend cannot develop against real data without the backend running. | Blocks all data-dependent screens. | Create a seed script that calls the API to populate doctors, clinics, specialties, schedules, and slots. Or use the existing SQL migrations and manual seeding. |
| R2 | **Multiple documents reference next-auth** — `FRONTEND_ARCHITECTURE.md`, `USER_FLOWS.md`, `PRODUCTION_CHECKLIST.md` all describe next-auth patterns. The `IMPLEMENTATION_PLAN.md` correctly uses custom auth. | Confusion during implementation if developers reference outdated docs. | Must update all 3 documents to remove next-auth references before Phase 1. |
| R3 | **No `/doctors` search/filter query params confirmed** — The backend's `GET /doctors` route controller may not support `?search=`, `?clinicId=`, or `?specialtyId=` query parameters. The API spec doesn't list them. | Filter UI will not work if backend doesn't support filtering. | Verify by reading the doctor controller. If unsupported, implement client-side filtering or add query params to the backend (but cannot change backend contracts per rules). Fallback: client-side filter after fetching all. |

### High

| # | Risk | Impact | Mitigation |
|---|------|--------|------------|
| R4 | **`consultationFee` is a string from API** — PostgreSQL NUMERIC serializes as string in JSON. | Form validation and display must handle string-to-number conversion. | Parse with `parseFloat()` in format utilities. Zod schema must accept `z.union([z.string(), z.number()])` or transform. |
| R5 | **Admin dashboard stats not confirmed** — The backend may not have aggregated endpoints for dashboard stats (total doctors, patients, appointments, revenue). | Admin dashboard cards may need multiple API calls. | Use TanStack Query `useQueries` to parallel-fetch and aggregate client-side. |
| R6 | **No pagination metadata on all list endpoints** — Some backend list endpoints may not return the `{ page, limit, total, totalPages }` pagination envelope. | Paginated tables will break. | Verify each list endpoint. Fallback: default to single-page and add pagination later. |
| R7 | **Consultation fee field data type** — API returns `"150.00"` (string) but form sends `Number (>= 0)` for create/update. | Form submission will send number but display will show string. | Transform between string and number in API client layer. |

### Medium

| # | Risk | Impact | Mitigation |
|---|------|--------|------------|
| R8 | **Route name collision** — Both `/doctor-schedules` and `/admin/doctor-schedules` mount the same router. The `/me` endpoint on the admin mount could cause confusion. | Admin may accidentally access `/me` scoped endpoint. | Middleware role check prevents non-doctors from accessing `/me`. Verify admin cannot call `/doctor-schedules/me`. |
| R9 | **Patient ID vs User ID** — JWT `sub` is the user UUID. Patient endpoints like `/appointments/mine` use the patient ID (derived from user ID). The backend service layer resolves this. | Frontend must understand the distinction. | AuthProvider exposes user ID from JWT. API layer passes `user.sub` as needed. Backend handles resolution. |
| R10 | **Mobile bottom tab bar design not in Stitch** — Mobile variants show reduced layouts but no specific bottom tab bar design. | Mobile navigation implementation needs design extrapolation. | Use standard mobile bottom tab pattern from shadcn/ui + design system tokens. |
| R11 | **Doctor detail page has no dedicated Stitch screen** — The booking flow assumes doctor ID is known, but there's no standalone doctor profile screen. | Must design based on API data model and design system tokens. | Follow card layout patterns from Patient Dashboard. Use DoctorCard expanded layout. |
| R12 | **Stitch screens may not cover all admin sub-pages** — "Admin Panel" is a single screen. Sub-pages (doctors, clinics, users, etc.) follow the same DataTable pattern but aren't individually designed. | Consistency across admin pages relies on the DataTable component. | Build a reusable DataTable with configurable columns, filters, and actions. |

### Low

| # | Risk | Impact | Mitigation |
|---|------|--------|------------|
| R13 | **Notifications module is unimplemented on backend** — Table exists, no routes or logic. | No notification features in v1. | Document as future scope. Remove from MVP. |
| R14 | **`VITE_API_URL` in API spec** — References Vite convention, not Next.js. | Minor confusion during env setup. | Use `NEXT_PUBLIC_API_URL` in Next.js. Update API_SPECIFICATION.md. |
| R15 | **No error boundary or 404 page designs in Stitch** | Generic error pages need design. | Use shadcn/ui default error patterns styled with design tokens. |

---

## 4. Missing Information

### Confirmed Missing

| Item | Needed For | Action |
|------|-----------|--------|
| **Backend running instance / seed data** | Developing and testing all screens | Create a `seed-data.sql` or Node.js seed script that populates the database via the API. Must include: 2 clinics, 3 specialties, 3 doctors, weekly schedules, appointment slots, 1 admin user. |
| **Exact query param support on `GET /doctors`** | Search/filter UI on doctor listing | Read `src/modules/doctors/doctor.controller.ts` and `doctor.service.ts` to verify. If not supported, plan for client-side filter. |
| **Exact query param support on `GET /admin/users`** | Admin user filter UI | Verify backend controller supports `role`, `isVerified`, `search`, `page`, `limit` params. |
| **Admin dashboard stats aggregation** | Admin dashboard stat cards | Verify if any admin endpoint returns counts. If not, plan to use separate `GET` calls and aggregate. |
| **Doctor photo/avatar field** | Doctor cards display | Backend `doctors` table has no photo URL field. Will use initials-based avatar. |

### Not Needed (Clarified)

| Item | Reason |
|------|--------|
| Notifications | Backend module is placeholder. Not in MVP scope. |
| Forgot password | No backend endpoint exists. Not in MVP scope. |
| Email verification | Backend has `isVerified` field but no flow. Not in MVP scope. |
| Real-time updates | No WebSocket/SSE backend. Poll via TanStack Query. |

---

## 5. Phase Execution Checklist

### Phase 1: Foundation (Week 1)

- [ ] 1.1 Initialize Next.js 16 project with TypeScript
- [ ] 1.2 Install all dependencies (TanStack Query, RHF, Zod, date-fns, sonner, lucide)
- [ ] 1.3 Initialize shadcn/ui with "Clinical Precision" theme
- [ ] 1.4 Add base shadcn/ui components (button, input, card, table, dialog, sheet, badge, avatar, select, calendar, popover, skeleton, toast, tabs)
- [ ] 1.5 Configure Tailwind with design tokens (colors, fonts, spacing, radius)
- [ ] 1.6 Load Inter font via `next/font`
- [ ] 1.7 Create utility functions: `cn.ts`, `format.ts` (date, currency)
- [ ] 1.8 Create TypeScript types: `types/api.ts`, `types/records.ts`
- [ ] 1.9 Create API client: `lib/http/api-client.ts` (auth injection, 401 retry, response unwrap)
- [ ] 1.10 Create TanStack Query provider: `providers/query-provider.tsx`
- [ ] 1.11 Create root layout with providers: `app/layout.tsx`
- [ ] 1.12 Verify: `npm run dev` starts, renders blank page with correct fonts and colors

### Phase 2: Auth (Week 1-2)

- [ ] 2.1 Create auth types and Zod schemas
- [ ] 2.2 Create auth API hooks (login, register, refresh, logout, me)
- [ ] 2.3 Create auth service (token management, refresh logic)
- [ ] 2.4 Create AuthProvider context (in-memory accessToken, httpOnly cookie for refresh)
- [ ] 2.5 Create `useAuth` hook
- [ ] 2.6 Create login form component
- [ ] 2.7 Create register form component
- [ ] 2.8 Create auth layout (centered card pattern from Stitch)
- [ ] 2.9 Create login page
- [ ] 2.10 Create register page
- [ ] 2.11 Create middleware for route protection
- [ ] 2.12 Create RequireAuth / role guard component
- [ ] 2.13 **Verification**: Register → Login → refresh → logout → route protection → role guard

### Phase 3: API Layer (Week 2)

- [ ] 3.1 Create query key factory: `lib/http/query-keys.ts`
- [ ] 3.2 Create permission constants (mirror backend RolePermissions)
- [ ] 3.3 Create all feature API hooks (queries + mutations for all 11 modules)
- [ ] 3.4 Add pagination types and helpers
- [ ] 3.5 **Verification**: All 79 endpoints have typed hooks

### Phase 4: Layout (Week 2)

- [ ] 4.1 Create public layout (navbar + footer from Stitch Landing Page)
- [ ] 4.2 Create sidebar component (from Stitch Patient/Admin Dashboard)
- [ ] 4.3 Create dashboard layout (sidebar + header + main content)
- [ ] 4.4 Create admin layout (admin-specific sidebar from Stitch)
- [ ] 4.5 Create shared EmptyState component
- [ ] 4.6 Create shared DataTable component (from Stitch Admin Panel)
- [ ] 4.7 Create shared StatusBadge component (from Stitch design system)
- [ ] 4.8 Create shared stat card component (from Stitch Admin Dashboard)
- [ ] 4.9 **Verification**: Navigate all route groups, layouts render correctly

### Phase 5: Public Pages (Week 2-3)

- [ ] 5.1 Landing page — hero, search, featured doctors, stats, how it works, footer
- [ ] 5.2 Doctor listing — grid, search, filters (clinic, specialty), pagination
- [ ] 5.3 Doctor detail — profile, schedule preview, book CTA
- [ ] 5.4 Clinic listing — grid/cards
- [ ] 5.5 Specialty listing — grid/cards
- [ ] 5.6 **Verification**: All public pages render, SEO metadata set, responsive

### Phase 6: Patient Flow (Week 3-4)

- [ ] 6.1 Patient dashboard — welcome, upcoming appointments, quick actions
- [ ] 6.2 Booking flow — step indicator, date picker, slot grid, confirm
- [ ] 6.3 Appointments list — tabs (upcoming/past/cancelled), status badges, cancel
- [ ] 6.4 Appointment detail — full info, payment, review, cancel actions
- [ ] 6.5 Payment history — list with status
- [ ] 6.6 Review history — list, create review form (star rating)
- [ ] 6.7 Profile — view and edit (name, phone, gender, birth date)
- [ ] 6.8 **Verification**: Complete patient journey end-to-end

### Phase 7: Doctor Flow (Week 4)

- [ ] 7.1 Doctor dashboard — today overview, stats, upcoming appointments
- [ ] 7.2 Doctor appointments — filterable list, cancel action
- [ ] 7.3 Doctor schedule — weekly calendar view (read-only)
- [ ] 7.4 **Verification**: Doctor login → view schedule → view appointments → cancel

### Phase 8: Admin Panel (Week 4-6)

- [ ] 8.1 Admin dashboard — stat cards, recent appointments, quick actions
- [ ] 8.2 Doctor CRUD — DataTable + create/edit dialog + delete confirm
- [ ] 8.3 Clinic CRUD — DataTable + form
- [ ] 8.4 Specialty CRUD — DataTable + form
- [ ] 8.5 User management — DataTable + edit dialog + soft delete
- [ ] 8.6 Appointment management — DataTable + status change + filter
- [ ] 8.7 Schedule + slot management — DataTable + create forms
- [ ] 8.8 Payment management — DataTable + status update
- [ ] 8.9 Review management — DataTable + edit/delete
- [ ] 8.10 **Verification**: Full admin CRUD on all resources

### Phase 9: Error States & Polish (Week 6)

- [ ] 9.1 Error boundaries per route segment
- [ ] 9.2 Loading skeletons for all data-dependent screens
- [ ] 9.3 Empty states for all list screens
- [ ] 9.4 Toast notifications for all mutations
- [ ] 9.5 404 pages
- [ ] 9.6 Responsive behavior (mobile 390px, tablet 768px, desktop 1280px)

### Phase 10: Quality (Week 7)

- [ ] 10.1 TypeScript strict — fix all errors
- [ ] 10.2 Accessibility — keyboard nav, screen readers, color contrast
- [ ] 10.3 Bundle analysis — identify large dependencies
- [ ] 10.4 Performance audit — Lighthouse, Core Web Vitals

---

## 6. Document Cleanup Required (Before Phase 1)

The following documents contain outdated next-auth references and must be updated:

| Document | Lines to Fix | Fix |
|----------|-------------|-----|
| `FRONTEND_ARCHITECTURE.md` | 14, 261-307, 331-355, 493 | Replace next-auth with custom AuthProvider |
| `USER_FLOWS.md` | 7, 19, 48, 53, 349, 350 | Replace "next-auth stores" with "AuthProvider stores" |
| `PRODUCTION_CHECKLIST.md` | 9, 10, 12, 40, 152-154 | Replace next-auth checklist items with custom auth equivalents |

Other minor fixes:
- `API_SPECIFICATION.md`: Line 3 — `VITE_API_URL` → `NEXT_PUBLIC_API_URL`

---

## 7. First Implementation Step Recommendation

### Step 0: Document Cleanup

Before any code is written, update the 3 documents that reference next-auth to use custom auth. This prevents confusion during implementation.

### Step 1: Next.js Initialization

```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
```

Work in the existing `/workspace` directory which already has `package.json`, `tsconfig.json`, etc. from the backend. This means we need to either:
- **(Recommended)** Initialize Next.js in `src/frontend/` as a standalone project with its own `package.json`, or
- Merge the frontend into the existing monorepo structure

**Recommendation**: Initialize Next.js in `src/frontend/` as a separate package so the frontend and backend can be developed and deployed independently.

### Authorization to Begin

Before starting Phase 1, confirm:

1. ✅ Backend is complete and running (with seed data)
2. ✅ All documents are audited and updated
3. ✅ Stitch designs are accessible for reference
4. ✅ Architecture decisions are approved
5. ✅ Folder structure is finalized
