# Implementation Plan — Clinic Booking System Frontend

---

## 1. Project Setup

### Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| Next.js | 16 (App Router) | Framework |
| TypeScript | 7 (strict) | Language |
| Tailwind CSS | 4 | Styling |
| shadcn/ui | Latest | Component library (Radix primitives) |
| TanStack Query | v6 | Server state, caching, mutations |
| React Hook Form | v7 | Form state management |
| Zod | v4 | Schema validation (mirrors backend) |
| date-fns | v4 | Date formatting and manipulation |
| sonner | Latest | Toast notifications |
| lucide-react | Latest | Icons |

### Init Steps (exact commands)

```bash
# 1. Create Next.js 16 project with TypeScript
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"

# 2. Install core dependencies
npm install @tanstack/react-query@v6 react-hook-form @hookform/resolvers zod date-fns sonner lucide-react

# 3. Initialize shadcn/ui
npx shadcn@latest init

# 4. Add shadcn/ui components (as needed per phase)
npx shadcn@latest add button input label card dialog sheet table badge avatar select calendar popover skeleton toast tabs
```

### TypeScript Configuration

```json
{
  "compilerOptions": {
    "strict": true,
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "preserve",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"]
}
```

### Tailwind Configuration

Extend with Stitch "Clinical Precision" design tokens:

- Primary: `#0056b3` (Trust Blue)
- Surface: `#f8f9ff`
- On Surface: `#0b1c30`
- On Surface Variant: `#424752`
- Outline: `#727784`
- Outline Variant: `#c2c6d4`
- Error: `#ba1a1a`
- Tertiary: `#2dd4bf`
- Inter font family
- 4px/8px/16px/24px/32px spacing scale

---

## 2. Folder Structure

```
src/frontend/
├── app/                              # Next.js App Router
│   ├── layout.tsx                    # Root layout: providers, fonts, metadata
│   ├── page.tsx                      # Landing page (public)
│   ├── (public)/                     # Public route group — no auth required
│   │   ├── layout.tsx                # Public layout (header + footer)
│   │   ├── doctors/
│   │   │   ├── page.tsx              # Doctor listing (RSC)
│   │   │   └── [id]/
│   │   │       └── page.tsx          # Doctor detail (RSC)
│   │   ├── clinics/
│   │   │   └── page.tsx              # Clinic listing (RSC)
│   │   └── specialties/
│   │       └── page.tsx              # Specialty listing (RSC)
│   ├── (auth)/                       # Auth route group — unauthenticated only
│   │   ├── layout.tsx                # Auth layout (centered card)
│   │   ├── login/
│   │   │   └── page.tsx              # Login page
│   │   └── register/
│   │       └── page.tsx              # Register page
│   ├── (dashboard)/                  # Authenticated route group
│   │   ├── layout.tsx                # Dashboard layout (sidebar + header)
│   │   ├── dashboard/
│   │   │   └── page.tsx              # Dashboard (role-based: patient/doctor)
│   │   ├── appointments/
│   │   │   ├── page.tsx              # My appointments list
│   │   │   └── [id]/
│   │   │       └── page.tsx          # Appointment detail
│   │   ├── book/
│   │   │   └── page.tsx              # Booking flow (multi-step)
│   │   ├── payments/
│   │   │   └── page.tsx              # Payment history
│   │   ├── reviews/
│   │   │   └── page.tsx              # Review history
│   │   ├── schedule/
│   │   │   └── page.tsx              # Doctor schedule view
│   │   └── profile/
│   │       └── page.tsx              # Edit profile
│   └── (admin)/                      # Admin route group
│       ├── layout.tsx                # Admin layout (admin sidebar)
│       ├── page.tsx                  # Admin dashboard
│       ├── doctors/
│       │   └── page.tsx              # Admin CRUD doctors
│       ├── clinics/
│       │   └── page.tsx              # Admin CRUD clinics
│       ├── specialties/
│       │   └── page.tsx              # Admin CRUD specialties
│       ├── users/
│       │   └── page.tsx              # Admin CRUD users
│       ├── appointments/
│       │   └── page.tsx              # Admin appointments
│       ├── schedules/
│       │   └── page.tsx              # Admin schedules + slots
│       ├── payments/
│       │   └── page.tsx              # Admin payments
│       └── reviews/
│           └── page.tsx              # Admin reviews
├── features/                         # Feature modules (mirror backend modules)
│   ├── auth/
│   │   ├── api/                      # use-login.ts, use-register.ts, use-refresh.ts, use-logout.ts
│   │   ├── components/               # LoginForm.tsx, RegisterForm.tsx
│   │   ├── hooks/                    # use-auth.ts
│   │   ├── schemas/                  # login-schema.ts, register-schema.ts
│   │   └── types/                    # auth-types.ts
│   ├── patients/
│   │   ├── api/                      # use-patient-profile.ts, use-update-profile.ts
│   │   ├── components/               # PatientProfileForm.tsx
│   │   └── schemas/                  # patient-schema.ts
│   ├── doctors/
│   │   ├── api/                      # use-doctors.ts, use-doctor.ts, use-create-doctor.ts, etc.
│   │   ├── components/               # DoctorCard.tsx, DoctorForm.tsx, DoctorList.tsx
│   │   └── schemas/                  # doctor-schema.ts
│   ├── clinics/
│   │   ├── api/                      # use-clinics.ts, use-create-clinic.ts, etc.
│   │   ├── components/               # ClinicCard.tsx, ClinicForm.tsx
│   │   └── schemas/
│   ├── specialties/
│   │   ├── api/
│   │   ├── components/               # SpecialtyForm.tsx
│   │   └── schemas/
│   ├── doctor-schedules/
│   │   ├── api/
│   │   ├── components/               # ScheduleForm.tsx, WeeklySchedule.tsx
│   │   └── schemas/
│   ├── appointment-slots/
│   │   ├── api/                      # use-available-slots.ts
│   │   ├── components/               # SlotGrid.tsx, DatePicker.tsx
│   │   └── schemas/
│   ├── appointments/
│   │   ├── api/                      # use-appointments.ts, use-book-appointment.ts, use-cancel-appointment.ts
│   │   ├── components/               # AppointmentCard.tsx, AppointmentList.tsx, CancelDialog.tsx
│   │   └── schemas/                  # appointment-schema.ts
│   ├── payments/
│   │   ├── api/                      # use-payments.ts, use-create-payment.ts
│   │   ├── components/               # PaymentForm.tsx, PaymentList.tsx
│   │   └── schemas/                  # payment-schema.ts
│   ├── reviews/
│   │   ├── api/                      # use-reviews.ts, use-create-review.ts
│   │   ├── components/               # ReviewForm.tsx, ReviewCard.tsx, StarRating.tsx
│   │   └── schemas/                  # review-schema.ts
│   └── users/                        # Admin only
│       ├── api/                      # use-users.ts, use-update-user.ts, use-delete-user.ts
│       ├── components/               # UserTable.tsx, UserEditDialog.tsx
│       └── schemas/                  # user-schema.ts
├── components/                       # Shared components
│   ├── ui/                           # shadcn/ui primitives (button, input, card, etc.)
│   ├── layout/                       # Sidebar.tsx, Header.tsx, Navbar.tsx, Footer.tsx
│   ├── data-display/                 # DataTable.tsx, StatusBadge.tsx, EmptyState.tsx
│   └── forms/                        # FormField.tsx
├── lib/                              # Shared utilities
│   ├── http/                         # API client, query key factory
│   ├── utils/                        # cn.ts, format.ts (date, currency)
│   └── constants/                    # permissions.ts (mirrors backend)
├── providers/                        # React context providers
│   ├── query-provider.tsx            # TanStack Query provider
│   └── auth-provider.tsx             # Auth context provider
├── services/                         # Business logic services
│   └── auth-service.ts              # Token management (refresh, validate, storage)
├── types/                            # Shared TypeScript types
│   ├── api.ts                        # ApiResponse<T>, PaginatedResponse<T>, PaginationMeta
│   └── records.ts                    # UserRecord, PatientRecord, DoctorRecord, etc.
└── middleware.ts                     # Next.js middleware for route protection
```

---

## 3. Authentication Architecture

### Constraint: No next-auth

Use a **custom auth system** that directly implements the backend's JWT + refresh token rotation.

### Token Storage

- **Access token**: Stored in memory (React state via AuthProvider). Never persisted to localStorage or cookies accessible to JavaScript.
- **Refresh token**: Stored in httpOnly cookie (set by the API client, not by JavaScript). This prevents XSS from stealing the refresh token.

### Auth Flow

```
1. Login
   POST /api/v1/auth/login
   Response: { data: { accessToken, refreshToken } }

2. Store access token in AuthProvider state (in-memory React state)
   Set refresh token as httpOnly cookie via server response
   (Note: The backend sets Set-Cookie or we handle client-side)

3. Every API request:
   Authorization: Bearer <accessToken>

4. Token refresh (401 interceptor):
   POST /api/v1/auth/refresh
   Body: { refreshToken }
   Response: { data: { accessToken, refreshToken } }
   Update in-memory accessToken
   Rotate refresh token cookie

5. Logout:
   POST /api/v1/auth/logout
   Clear in-memory state
   Clear refresh cookie
   Redirect to /login
```

### AuthProvider (`providers/auth-provider.tsx`)

```typescript
interface AuthState {
  user: AuthenticatedUser | null;  // { sub: string, role: UserRole }
  accessToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContext extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterDTO) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
}
```

### API Client (`lib/http/api-client.ts`)

- Base fetch wrapper that injects `Authorization: Bearer <token>` from AuthProvider
- On 401 response: attempt token refresh, retry original request
- On refresh failure: clear auth state, redirect to `/login`
- Parse response envelope: unwrap `.data` from `{ success, data, message, errors }`

### Route Protection (`middleware.ts`)

```typescript
// Next.js middleware runs on edge for every request
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes — no check
  if (isPublicRoute(pathname)) return NextResponse.next();

  // Auth routes (login/register) — redirect to dashboard if already authenticated
  if (isAuthRoute(pathname)) {
    const token = request.cookies.get("refresh_token");
    if (token) return NextResponse.redirect(new URL("/dashboard", request.url));
    return NextResponse.next();
  }

  // Protected routes — require valid token
  const token = request.cookies.get("refresh_token");
  if (!token) return NextResponse.redirect(new URL("/login", request.url));

  // Role-based routes
  const role = getRoleFromToken(token.value); // Decode JWT to get role
  if (pathname.startsWith("/admin") && role !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  if (pathname.startsWith("/schedule") && role !== "doctor") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}
```

### Token Refresh Strategy

```
401 Response from API
  → Interceptor checks if refresh is in progress (mutex)
  → If not: POST /auth/refresh with refresh token from cookie
  → If refresh succeeds: update accessToken in AuthProvider
  → Retry original request with new accessToken
  → If refresh fails (expired/revoked): clear auth, redirect /login
  → If refresh already in progress: queue the request, resolve after refresh
```

### Role Guards

- `AuthProvider` exposes `hasPermission(permission)` matching backend `RolePermissions`
- Components conditionally render based on role:
  - `isAdmin && <AdminLink />`
  - `hasPermission("manageDoctors") && <ManageButton />`
- Client-side guard component: `<RequireAuth role="admin"> <AdminPanel /> </RequireAuth>`

---

## 4. Design System: "Clinical Precision"

### Colors (Tailwind Config)

```typescript
// tailwind.config.ts
colors: {
  primary: {
    DEFAULT: "#0056b3",
    container: "#d7e2ff",
    on: "#ffffff",
    "on-container": "#001a40",
  },
  surface: {
    DEFAULT: "#f8f9ff",
    dim: "#cbdbf5",
    bright: "#f8f9ff",
    container: {
      lowest: "#ffffff",
      low: "#eff4ff",
      DEFAULT: "#e5eeff",
      high: "#dce9ff",
      highest: "#d3e4fe",
    },
  },
  "on-surface": {
    DEFAULT: "#0b1c30",
    variant: "#424752",
  },
  outline: {
    DEFAULT: "#727784",
    variant: "#c2c6d4",
  },
  tertiary: {
    DEFAULT: "#2dd4bf",
    container: "#006459",
  },
  error: {
    DEFAULT: "#ba1a1a",
    container: "#ffdad6",
  },
}
```

### Typography

```css
/* Inter font — loaded via next/font */
--font-display:  36px/44px  Inter 700  -0.02em
--font-headline-lg: 28px/36px  Inter 600  -0.01em
--font-headline-md: 20px/28px  Inter 600
--font-body-lg:    18px/28px  Inter 400
--font-body-md:    16px/24px  Inter 400
--font-body-sm:    14px/20px  Inter 400
--font-label-md:   14px/20px  Inter 600  0.05em
--font-label-sm:   12px/16px  Inter 500
```

### Spacing Rhythm

```typescript
spacing: {
  xs: "4px",    // base
  sm: "8px",    // 2×
  md: "16px",   // 4×
  lg: "24px",   // 6×
  xl: "32px",   // 8×
}
```

### Shapes

- Buttons, inputs, badges: `rounded-md` (4px)
- Cards, modals, dialogs: `rounded-lg` (8px)
- Status badges: `rounded-full` (pill)

### Elevation

- Cards: white bg + 1px `outline-variant` border + shadow-sm
- Modals: white bg + shadow-lg + 1px `outline` border
- No heavy shadows — tonal layering instead

### shadcn/ui Theme Override

```json
{
  "style": "default",
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "src/app/globals.css",
    "baseColor": "slate",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils/cn"
  },
  "rsc": true
}
```

Apply colors to CSS variables in `globals.css`:

```css
:root {
  --primary: 213 100% 35%;        /* #0056b3 */
  --primary-foreground: 0 0% 100%;
  --background: 228 100% 99%;     /* #f8f9ff */
  --foreground: 215 63% 12%;      /* #0b1c30 */
  --muted-foreground: 224 10% 38%; /* #424752 */
  --border: 222 8% 61%;           /* #727784 */
  --input: 222 8% 61%;
  --ring: 213 100% 35%;
  --radius: 0.25rem;
}
```

---

## 5. Implementation Order

### Phase 1: Foundation (Week 1)

**Goal:** Working app shell, routing, providers, shared components.

| Step | Task | Files |
|------|------|-------|
| 1.1 | Initialize Next.js 16 project with Tailwind | `package.json`, `tailwind.config.ts`, `tsconfig.json` |
| 1.2 | Install all dependencies | `npm install` |
| 1.3 | Initialize shadcn/ui, add base components | `components.json`, `globals.css`, `components/ui/*` |
| 1.4 | Configure Tailwind with Clinical Precision tokens | `tailwind.config.ts` colors, fonts, spacing |
| 1.5 | Load Inter font via `next/font` | `app/layout.tsx` |
| 1.6 | Create utility functions | `lib/utils/cn.ts`, `lib/utils/format.ts` |
| 1.7 | Create shared TypeScript types | `types/api.ts`, `types/records.ts` |
| 1.8 | Create API client with auth header injection | `lib/http/api-client.ts` |
| 1.9 | Create TanStack Query provider | `providers/query-provider.tsx` |
| 1.10 | Create root layout with providers | `app/layout.tsx` |

**Deliverable:** App starts, renders empty page with correct fonts and colors.

---

### Phase 2: Auth (Week 1-2)

**Goal:** Full authentication flow (login, register, refresh, logout, route protection).

| Step | Task | Files |
|------|------|-------|
| 2.1 | Create auth types and Zod schemas | `features/auth/types/*`, `features/auth/schemas/*` |
| 2.2 | Create auth API hooks | `features/auth/api/*` |
| 2.3 | Create auth service (token management) | `services/auth-service.ts` |
| 2.4 | Create AuthProvider context | `providers/auth-provider.tsx` |
| 2.5 | Create login form component | `features/auth/components/login-form.tsx` |
| 2.6 | Create register form component | `features/auth/components/register-form.tsx` |
| 2.7 | Create auth layout (centered card) | `app/(auth)/layout.tsx` |
| 2.8 | Create login page | `app/(auth)/login/page.tsx` |
| 2.9 | Create register page | `app/(auth)/register/page.tsx` |
| 2.10 | Create middleware for route protection | `middleware.ts` |
| 2.11 | Create RequireAuth component (role guard) | `features/auth/components/auth-guard.tsx` |

**Deliverable:** User can register, login, logout. Routes are protected. Tokens refresh automatically.

---

### Phase 3: API Client & Query Keys (Week 2)

**Goal:** Complete API layer for all 79 endpoints.

| Step | Task | Files |
|------|------|-------|
| 3.1 | Create query key factory | `lib/http/query-keys.ts` |
| 3.2 | Create permission constants | `lib/constants/permissions.ts` |
| 3.3 | Create all feature API hooks | `features/*/api/*` |
| 3.4 | Add pagination types and helpers | `types/pagination.ts` |

**Deliverable:** All backend endpoints have corresponding TanStack Query hooks.

---

### Phase 4: Layout & Navigation (Week 2)

**Goal:** App shell with sidebar, navbar, responsive layout.

| Step | Task | Files |
|------|------|-------|
| 4.1 | Create public layout (header, footer) | `app/(public)/layout.tsx` |
| 4.2 | Create dashboard layout (sidebar, header) | `app/(dashboard)/layout.tsx` |
| 4.3 | Create admin layout (admin sidebar) | `app/(admin)/layout.tsx` |
| 4.4 | Create sidebar component | `components/layout/sidebar.tsx` |
| 4.5 | Create header component | `components/layout/header.tsx` |
| 4.6 | Create navbar component | `components/layout/navbar.tsx` |
| 4.7 | Create footer component | `components/layout/footer.tsx` |
| 4.8 | Create shared EmptyState component | `components/data-display/empty-state.tsx` |
| 4.9 | Create shared DataTable component | `components/data-display/data-table.tsx` |
| 4.10 | Create shared StatusBadge component | `components/data-display/status-badge.tsx` |

**Deliverable:** All layouts render. Navigation works. Public/dashboard/admin routes render correct shell.

---

### Phase 5: Public Pages (Week 2-3)

**Goal:** Landing page, doctor listing, clinic/specialty listing.

| Step | Task | Files |
|------|------|-------|
| 5.1 | Landing page (hero, featured doctors, stats, CTA) | `app/page.tsx` |
| 5.2 | Doctor listing page (grid, search, filters) | `app/(public)/doctors/page.tsx` |
| 5.3 | Doctor card component | `features/doctors/components/doctor-card.tsx` |
| 5.4 | Doctor detail page (profile, schedule preview) | `app/(public)/doctors/[id]/page.tsx` |
| 5.5 | Clinic listing page | `app/(public)/clinics/page.tsx` |
| 5.6 | Specialty listing page | `app/(public)/specialties/page.tsx` |

**Deliverable:** Public pages are visible, SEO-optimized, Server Components for data.

---

### Phase 6: Patient Flow (Week 3-4)

**Goal:** Dashboard, booking flow, appointments, payments, reviews, profile.

| Step | Task | Files |
|------|------|-------|
| 6.1 | Patient dashboard (welcome, upcoming, quick actions) | `app/(dashboard)/dashboard/page.tsx` |
| 6.2 | Booking flow (step indicator, date picker, slots, confirm) | `app/(dashboard)/book/page.tsx` |
| 6.3 | Slot grid component | `features/appointment-slots/components/slot-grid.tsx` |
| 6.4 | Appointment list | `app/(dashboard)/appointments/page.tsx` |
| 6.5 | Appointment detail + cancel | `app/(dashboard)/appointments/[id]/page.tsx` |
| 6.6 | Payment history | `app/(dashboard)/payments/page.tsx` |
| 6.7 | Review history + create | `app/(dashboard)/reviews/page.tsx` |
| 6.8 | Profile edit | `app/(dashboard)/profile/page.tsx` |

**Deliverable:** Complete patient journey: register → browse → book → view → cancel → pay → review.

---

### Phase 7: Doctor Flow (Week 4)

**Goal:** Doctor dashboard, schedule view, appointment management.

| Step | Task | Files |
|------|------|-------|
| 7.1 | Doctor dashboard (today overview, stats) | `app/(dashboard)/dashboard/page.tsx` |
| 7.2 | Doctor appointments view | `app/(dashboard)/appointments/page.tsx` |
| 7.3 | Schedule view (read-only weekly calendar) | `app/(dashboard)/schedule/page.tsx` |

**Deliverable:** Doctor can view schedule, see appointments, cancel own appointments.

---

### Phase 8: Admin Panel (Week 4-6)

**Goal:** Full CRUD management for all resources.

| Step | Task | Files |
|------|------|-------|
| 8.1 | Admin dashboard (stat cards, recent activity) | `app/(admin)/page.tsx` |
| 8.2 | Doctor CRUD (DataTable + form dialog) | `app/(admin)/doctors/page.tsx` |
| 8.3 | Clinic CRUD | `app/(admin)/clinics/page.tsx` |
| 8.4 | Specialty CRUD | `app/(admin)/specialties/page.tsx` |
| 8.5 | User management (soft delete) | `app/(admin)/users/page.tsx` |
| 8.6 | Appointment management (status changes) | `app/(admin)/appointments/page.tsx` |
| 8.7 | Schedule + slot management | `app/(admin)/schedules/page.tsx` |
| 8.8 | Payment management | `app/(admin)/payments/page.tsx` |
| 8.9 | Review management | `app/(admin)/reviews/page.tsx` |

**Deliverable:** Admin can manage all resources with CRUD, filtering, pagination.

---

### Phase 9: Error States & Polish (Week 6)

| Step | Task |
|------|------|
| 9.1 | Add error boundaries per route segment |
| 9.2 | Add loading skeletons to all data-dependent screens |
| 9.3 | Add empty states to all list screens |
| 9.4 | Add toast notifications for all mutations |
| 9.5 | Add 404 pages |
| 9.6 | Verify responsive behavior (mobile/tablet/desktop) |

---

### Phase 10: Quality (Week 7)

| Step | Task |
|------|------|
| 10.1 | TypeScript strict mode — fix all errors |
| 10.2 | Accessibility audit — keyboard nav, screen readers, contrast |
| 10.3 | Bundle analysis — identify large dependencies |
| 10.4 | Performance audit — Lighthouse, Core Web Vitals |

---

## Additional Constraints

### No next-auth
- Custom AuthProvider with in-memory accessToken
- Refresh token in httpOnly cookie
- Token refresh interceptor in API client
- Middleware checks cookie for route protection

### No Fake Data
- All data comes from API responses
- Loading states use shadcn Skeleton components
- Empty states show meaningful messages + CTAs

### Backend Contracts Are Immutable
- Response envelope: `{ success, data, message, errors }`
- Pagination: `{ page, limit, total, totalPages }`
- Error format: Zod issues array with `code`, `message`, `path`
- Auth payload: `{ sub: uuid, role: string }`
- Permissions match `RolePermissions` exactly

### Every Screen Must Handle
- **Loading state**: Skeleton placeholders matching layout
- **Empty state**: Illustration + message + CTA
- **Error state**: Error message + retry action
- **Success state**: Data displayed + optional toast
- **Edge cases**: Long names, special characters, rapid clicks, network disconnection
