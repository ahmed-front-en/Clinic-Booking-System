# HealthFlow Clinic Booking System — Frontend Architecture

**Derived from:** API Contract (`frontend/docs/api-contract.md`), Frontend Technical Specification (`frontend/docs/frontend-technical-specification.md`), Stitch "The Luminescent Architect" Design System

**Framework:** Next.js 16.2.11 (App Router) · React 19.2.4 · TypeScript 5  
**Styling:** Tailwind CSS 4 · shadcn/ui components · Stitch design tokens  
**Data:** TanStack Query v5 · Axios  
**Forms:** React Hook Form + Zod (via `@hookform/resolvers/zod`)  
**Design:** Dark mode · Inter (headline + body) · #6366F1 primary · ROUND_FOUR

---

## Table of Contents

1. [Folder Structure](#1-folder-structure)
2. [Route Groups](#2-route-groups)
3. [Layout Hierarchy](#3-layout-hierarchy)
4. [Feature Modules](#4-feature-modules)
5. [Shared UI Library](#5-shared-ui-library)
6. [API Layer Structure](#6-api-layer-structure)
7. [Query Layer](#7-query-layer)
8. [Custom Hooks](#8-custom-hooks)
9. [Providers](#9-providers)
10. [State Management Strategy](#10-state-management-strategy)
11. [Server Components vs Client Components Strategy](#11-server-components-vs-client-components-strategy)
12. [File Naming Convention](#12-file-naming-convention)
13. [Import Convention](#13-import-convention)
14. [Error Boundary Strategy](#14-error-boundary-strategy)
15. [Loading Strategy](#15-loading-strategy)
16. [Authentication Strategy](#16-authentication-strategy)
17. [Code Splitting Strategy](#17-code-splitting-strategy)
18. [Performance Strategy](#18-performance-strategy)
19. [Accessibility Strategy](#19-accessibility-strategy)
20. [Testing Strategy](#20-testing-strategy)

---

## 1. Folder Structure

```
frontend/
├── public/
│   └── images/
├── src/
│   ├── app/                          # Next.js App Router pages
│   │   ├── (public)/                 # Route group: landing, login, register
│   │   ├── (authenticated)/          # Route group: patient + doctor screens
│   │   └── (admin)/                  # Route group: admin screens
│   │
│   ├── components/                   # Shared UI components
│   │   ├── ui/                       # shadcn/ui primitives (button, input, dialog, etc.)
│   │   ├── layout/                   # Navbar, Sidebar, Footer, AppLayout, AdminLayout
│   │   ├── feedback/                 # Toast, ErrorBanner, Skeleton, EmptyState
│   │   ├── data/                     # DataTable, Pagination, SearchInput, FilterDropdown
│   │   ├── business/                 # AppointmentCard, DoctorCard, SlotPicker, WeeklyCalendar, StarRating, StatusBadge
│   │   └── guards/                   # AuthGuard, RoleGuard
│   │
│   ├── features/                     # Feature modules (colocated by domain)
│   │   ├── auth/
│   │   │   ├── api/                  # auth API functions
│   │   │   ├── hooks/                # useLogin, useRegister, useLogout, useAuthMe
│   │   │   ├── schemas/              # loginSchema, registerSchema
│   │   │   └── components/           # LoginForm, RegisterForm
│   │   ├── patients/
│   │   │   ├── api/
│   │   │   ├── hooks/                # usePatientProfile, useUpdateProfile
│   │   │   └── components/           # ProfileForm, ProfileSummaryCard
│   │   ├── doctors/
│   │   │   ├── api/
│   │   │   ├── hooks/                # useDoctorsList, useDoctorById
│   │   │   └── components/           # DoctorCard, DoctorSelect
│   │   ├── clinics/
│   │   │   ├── api/
│   │   │   ├── hooks/                # useClinicsList
│   │   │   └── components/           # ClinicSelector
│   │   ├── specialties/
│   │   │   ├── api/
│   │   │   ├── hooks/                # useSpecialtiesList
│   │   │   └── components/           # SpecialtySelector
│   │   ├── appointments/
│   │   │   ├── api/
│   │   │   ├── hooks/                # useMyAppointments, useBookAppointment, useCancelAppointment
│   │   │   └── components/           # AppointmentCard, AppointmentDetailModal, CancelButton
│   │   ├── slots/
│   │   │   ├── api/
│   │   │   ├── hooks/                # useAvailableSlots
│   │   │   └── components/           # SlotPicker
│   │   ├── schedules/
│   │   │   ├── api/
│   │   │   ├── hooks/                # useMySchedule, useDoctorSchedule
│   │   │   └── components/           # WeeklyCalendar, TimeBlock
│   │   ├── payments/
│   │   │   ├── api/
│   │   │   ├── hooks/                # useMyPayments, useCreatePayment
│   │   │   └── components/           # PaymentCard, PaymentForm
│   │   ├── reviews/
│   │   │   ├── api/
│   │   │   ├── hooks/                # useMyReviews, useCreateReview
│   │   │   └── components/           # ReviewCard, ReviewForm
│   │   ├── users/                    # Admin-only
│   │   │   ├── api/
│   │   │   ├── hooks/                # useUsersList, useUpdateUser, useDeleteUser
│   │   │   └── components/           # UserFormModal, UserDetailModal
│   │   └── admin/                    # Admin CRUD hub
│   │       ├── api/                  # Generic admin CRUD helpers
│   │       ├── hooks/                # useAdminMutation, useAdminList
│   │       └── components/           # FormModal (generic), ConfirmDialog
│   │
│   ├── hooks/                        # Global shared hooks
│   │   ├── useAuth.ts                # Auth context consumer
│   │   ├── useApiError.ts            # API error parser
│   │   ├── useDebounce.ts
│   │   ├── useMediaQuery.ts
│   │   └── usePagination.ts
│   │
│   ├── lib/                          # Core library config
│   │   ├── axios.ts                  # Axios instance + interceptors
│   │   ├── token-store.ts            # Module-level token holder
│   │   ├── query-client.ts           # TanStack QueryClient config
│   │   ├── query-keys.ts             # Query key factory
│   │   └── utils.ts                  # cn(), formatDate, etc.
│   │
│   ├── providers/                    # React context providers
│   │   ├── auth-provider.tsx
│   │   ├── toast-provider.tsx
│   │   ├── theme-provider.tsx
│   │   └── query-provider.tsx
│   │
│   ├── schemas/                      # Global Zod schemas (mirrored from backend)
│   │   ├── auth.ts                   # registerSchema, loginSchema
│   │   ├── patient.ts                # updatePatientSchema
│   │   ├── appointment.ts            # createAppointmentSchema, updateAppointmentSchema
│   │   ├── payment.ts                # createPaymentSchema, updatePaymentSchema
│   │   ├── review.ts                 # createReviewSchema, updateReviewSchema
│   │   ├── clinic.ts                 # createClinicSchema, updateClinicSchema
│   │   ├── specialty.ts              # createSpecialtySchema, updateSpecialtySchema
│   │   ├── doctor.ts                 # createDoctorSchema, updateDoctorSchema
│   │   ├── schedule.ts               # createDoctorScheduleSchema, updateDoctorScheduleSchema
│   │   ├── slot.ts                   # createAppointmentSlotSchema, updateAppointmentSlotSchema
│   │   └── user.ts                   # updateUserSchema
│   │
│   ├── types/                        # TypeScript type definitions
│   │   ├── api.ts                    # ApiResponse<T>, PaginatedResponse<T>, PaginationMeta, ApiError
│   │   ├── auth.ts                   # AuthTokens, AuthenticatedUser, LoginRequest, RegisterRequest
│   │   ├── models/                   # All backend DTOs
│   │   │   ├── user.ts               # UserPublic
│   │   │   ├── patient.ts            # PatientRecord, PatientCreateRequest, PatientUpdateRequest
│   │   │   ├── doctor.ts             # DoctorRecord, DoctorCreateRequest
│   │   │   ├── clinic.ts             # ClinicRecord, ClinicCreateRequest
│   │   │   ├── specialty.ts          # SpecialtyRecord
│   │   │   ├── schedule.ts           # DoctorScheduleRecord
│   │   │   ├── slot.ts              # AppointmentSlotRecord
│   │   │   ├── appointment.ts        # AppointmentRecord, CreateAppointmentRequest
│   │   │   ├── payment.ts            # PaymentRecord, CreatePaymentRequest
│   │   │   └── review.ts             # ReviewRecord, CreateReviewRequest
│   │   └── enums.ts                  # UserRole, SlotStatus, AppointmentStatus, PaymentMethod, PaymentStatus, SortOrder
│   │
│   ├── config/                       # Environment and app config
│   │   └── index.ts                  # API_BASE_URL, STALE_TIMES, PAGINATION_DEFAULTS
│   │
│   │   └── middleware.ts                 # Next.js middleware — non-auth concerns only (cors, headers, security). Does NOT perform auth checks (see §16).
│
├── docs/
├── tailwind.config.ts
├── next.config.ts
├── tsconfig.json
└── package.json
```

---

## 2. Route Groups

```
(public)         — Public routes (no auth required)
(authenticated)  — Patient + Doctor routes (auth required, role-conditional content)
(admin)          — Admin routes (auth required, admin role required)
```

### Why Patient and Doctor Are in One Group

The backend uses the **same URL paths** for patient and doctor endpoints (`/appointments/mine`, `/appointments/mine/:id`, `/reviews/mine`). Next.js route groups do not affect URL paths. Having separate `(patient)` and `(doctor)` groups with the same routes (`/dashboard`, `/appointments`, `/reviews`) would cause a build error. A single `(authenticated)` group resolves this — pages read the user's role from `useAuth()` and render role-appropriate sub-components.

### Route Group Assignment

| Route | Group | Role | File Path |
|-------|-------|------|-----------|
| `/` | `(public)` | None | `src/app/(public)/page.tsx` |
| `/login` | `(public)` | None | `src/app/(public)/login/page.tsx` |
| `/register` | `(public)` | None | `src/app/(public)/register/page.tsx` |
| `/dashboard` | `(authenticated)` | patient/doctor | `src/app/(authenticated)/dashboard/page.tsx` |
| `/appointments` | `(authenticated)` | patient/doctor | `src/app/(authenticated)/appointments/page.tsx` |
| `/book` | `(authenticated)` | patient | `src/app/(authenticated)/book/page.tsx` |
| `/payments` | `(authenticated)` | patient | `src/app/(authenticated)/payments/page.tsx` |
| `/reviews` | `(authenticated)` | patient/doctor | `src/app/(authenticated)/reviews/page.tsx` |
| `/profile` | `(authenticated)` | patient | `src/app/(authenticated)/profile/page.tsx` |
| `/schedule` | `(authenticated)` | doctor | `src/app/(authenticated)/schedule/page.tsx` |
| `/admin/dashboard` | `(admin)` | admin | `src/app/(admin)/admin/dashboard/page.tsx` |
| `/admin/users` | `(admin)` | admin | `src/app/(admin)/admin/users/page.tsx` |
| `/admin/clinics` | `(admin)` | admin | `src/app/(admin)/admin/clinics/page.tsx` |
| `/admin/specialties` | `(admin)` | admin | `src/app/(admin)/admin/specialties/page.tsx` |
| `/admin/doctors` | `(admin)` | admin | `src/app/(admin)/admin/doctors/page.tsx` |
| `/admin/doctor-schedules` | `(admin)` | admin | `src/app/(admin)/admin/doctor-schedules/page.tsx` |
| `/admin/appointment-slots` | `(admin)` | admin | `src/app/(admin)/admin/appointment-slots/page.tsx` |
| `/admin/appointments` | `(admin)` | admin | `src/app/(admin)/admin/appointments/page.tsx` |
| `/admin/payments` | `(admin)` | admin | `src/app/(admin)/admin/payments/page.tsx` |
| `/admin/reviews` | `(admin)` | admin | `src/app/(admin)/admin/reviews/page.tsx` |
| `/admin/patients` | `(admin)` | admin | `src/app/(admin)/admin/patients/page.tsx` |

### Route Group Layout Inheritance

```
(public)          →  layout.tsx: AuthLayout (no sidebar, centered form)
(authenticated)   →  layout.tsx: AppLayout (Navbar + role-based Sidebar)
(admin)           →  layout.tsx: AdminLayout (AdminNavbar + AdminSidebar)
```

The root `layout.tsx` provides Providers only (Theme, Auth, Query, Toast).

---

## 3. Layout Hierarchy

```
<html>                              — Root
  └── <body>
      └── <Providers>               — ThemeProvider, AuthProvider, QueryProvider, ToastProvider
          ├── (public)/layout.tsx   — AuthLayout (centered card, logo)
          │   ├── /login/page.tsx
          │   └── /register/page.tsx
          │
          ├── (authenticated)/layout.tsx  — AppLayout
          │   ├── <Navbar />             — Logo, user menu, notification bell
          │   ├── <RoleBasedSidebar />   — Renders nav links based on role
          │   └── <main>
          │       ├── /dashboard/page.tsx     — Renders PatientDashboard or DoctorDashboard
          │       ├── /appointments/page.tsx  — Renders PatientAppointments or DoctorAppointments
          │       ├── /book/page.tsx          — Patient only (RoleGuard)
          │       ├── /payments/page.tsx      — Patient only (RoleGuard)
          │       ├── /reviews/page.tsx       — Renders PatientReviews or DoctorReviews
          │       ├── /profile/page.tsx       — Patient only (RoleGuard)
          │       └── /schedule/page.tsx      — Doctor only (RoleGuard)
          │
          └── (admin)/layout.tsx    — AdminLayout
              ├── <AdminNavbar />   — Logo, user menu
              ├── <AdminSidebar />  — Dashboard, Users, Clinics, Specialties, Doctors, Schedules, Slots, Appointments, Payments, Reviews, Patients
              └── <main>
                  └── /admin/*/page.tsx
```

### AppLayout

A client component that reads `useAuth()` to determine the user's role and renders the appropriate sidebar. For shared routes (`/dashboard`, `/appointments`, `/reviews`), the page component detects the role and delegates to role-specific sub-components.

### AdminLayout

Same pattern but with admin-specific navigation. The `/admin` prefix is part of the URL path within the `(admin)` route group.

---

## 4. Feature Modules

Each feature module follows a consistent internal structure:

```
features/<domain>/
├── api/
│   └── <entity>.ts          — Raw Axios API functions (GET, POST, PATCH, DELETE)
├── hooks/
│   └── use<Entity>.ts       — TanStack Query hooks (queries + mutations)
├── components/
│   └── <Component>.tsx      — Feature-specific UI components
├── schemas/                 — (Optional) Feature-scoped Zod schemas, if not in global schemas/
└── types/                   — (Optional) Feature-scoped types, if not in global types/
```

### Domain Boundaries

| Feature Module | Owns | Consumes From |
|----------------|------|---------------|
| `auth` | Token storage, login/register/logout flows | — |
| `patients` | Patient profile CRUD | `auth` (current user) |
| `doctors` | Doctor listing (public + admin CRUD) | `clinics`, `specialties` |
| `clinics` | Clinic listing (public + admin CRUD) | — |
| `specialties` | Specialty listing (public + admin CRUD) | — |
| `appointments` | Appointment book/cancel/view | `slots`, `patients` |
| `slots` | Slot availability query | `doctors` |
| `schedules` | Doctor schedule view + admin CRUD | `doctors` |
| `payments` | Payment create/view history | `appointments` |
| `reviews` | Review create/view | `appointments` |
| `users` | Admin user CRUD | — |
| `admin` | Generic admin CRUD infrastructure | all entity modules |

### Module Dependency Rules

- Feature modules never import directly from other feature module's internal files (no `../appointments/api`).
- Instead, each feature module exposes its hooks via a barrel file: `features/<domain>/index.ts`.
- Cross-feature consumption goes through these barrel exports.
- The `auth` module is the sole exception — it provides `AuthContext` consumed at the provider level.

---

## 5. Shared UI Library

### shadcn/ui Components (installed in `src/components/ui/`)

These are the base primitives, customized with the Stitch design tokens:

```
src/components/ui/
├── button.tsx
├── input.tsx
├── label.tsx
├── dialog.tsx
├── select.tsx
├── command.tsx
├── popover.tsx
├── calendar.tsx
├── toast.tsx              — shadcn toast + toast-provider wrapper
├── skeleton.tsx
├── badge.tsx              — Used as StatusBadge base
├── card.tsx
├── table.tsx
├── tabs.tsx               — TabGroup
├── separator.tsx
├── dropdown-menu.tsx
├── avatar.tsx
├── tooltip.tsx
└── sheet.tsx              — Mobile sidebar
```

### Stitch Design Token Integration

The Stitch theme tokens are configured in `tailwind.config.ts`:

```typescript
// tailwind.config.ts
const stitchTokens = {
  background: "#0f131d",
  "surface-container-lowest": "#0a0e18",
  "surface-container-low": "#171b26",
  "surface-container": "#1c1f2a",
  "surface-container-high": "#262a35",
  "surface-container-highest": "#313540",
  "surface-bright": "#353944",
  "on-background": "#dfe2f1",
  "on-surface": "#dfe2f1",
  "on-surface-variant": "#c7c4d7",
  primary: "#6366F1",
  "primary-container": "#8083ff",
  "on-primary": "#1000a9",
  secondary: "#5de6ff",
  tertiary: "#cebdff",
  outline: "#908fa0",
  "outline-variant": "#464554",
  error: "#ffb4ab",
  success: "#4ade80",
};
```

### Business Components (`src/components/business/`)

| Component | Props | Description |
|-----------|-------|-------------|
| `DataTable<T>` | `columns, data, loading, pagination, onSort, onFilter` | Generic sortable/filterable table |
| `AppointmentCard` | `appointment, onCancel?, onPay?, onReview?, role` | Card with status badge + contextual actions |
| `DoctorCard` | `doctor, onSelect, selected` | Doctor profile card |
| `SlotPicker` | `slots, selectedSlot, onSelect, date` | Time grid of available slots |
| `WeeklyCalendar` | `schedules, onEdit?, onDelete?, editable` | Weekly grid (Sun–Sat) |
| `StepWizard` | `steps, currentStep, onNext, onBack` | Multi-step form container |
| `StarRating` | `rating, onChange?, readonly, size` | Interactive/read-only stars |
| `StatusBadge` | `status, variantMap` | Color-coded status pill |
| `ProfileSummaryCard` | `patient` | Patient summary card |
| `PaymentCard` | `payment, onPay?` | Payment details card |
| `ReviewCard` | `review` | Review display |
| `ConfirmDialog` | `open, title, message, onConfirm, onCancel, variant` | Confirmation modal |
| `FormModal` | `open, title, schema, defaultValues, onSubmit, onClose` | Generic create/edit modal |
| `EmptyState` | `icon, title, description, action?` | Empty placeholder |
| `ErrorBanner` | `message, onRetry?` | Error banner |
| `Skeleton` | `variant: "table" | "card" | "form" | "text"` | Loading placeholder |
| `AuthGuard` | `allowedRoles: UserRole[]` | Route protection HOC |
| `TimeBlock` | `startTime, endTime, status, onClick` | Calendar time block |
| `SearchInput` | `value, onChange, placeholder, debounceMs` | Debounced search |
| `FilterDropdown` | `options, value, onChange, label` | Single-select filter |

---

## 6. API Layer Structure

### Token Store (`src/lib/token-store.ts`)

A module-level singleton that holds the access token. React components never read or write this directly — the AuthProvider writes it, and the Axios interceptor reads it.

```typescript
let accessToken: string | null = null;
let refreshToken: string | null = null;

export function setAccessToken(token: string | null): void {
  accessToken = token;
}

export function getAccessToken(): string | null {
  return accessToken;
}

export function setRefreshToken(token: string | null): void {
  refreshToken = token;
}

export function getRefreshToken(): string | null {
  return refreshToken;
}

export function clearTokens(): void {
  accessToken = null;
  refreshToken = null;
}
```

### Axios Instance (`src/lib/axios.ts`)

```
AxiosInstance (baseURL: "/api/v1")
├── Request Interceptor
│   └── Reads accessToken from token-store (module-level variable, not React context)
│   └── Attaches Authorization: Bearer <token> header
│
│   Response Interceptor (success)
│   └── No unwrapping — passes through the full ApiResponse envelope.
│       API functions handle extraction of .data and .pagination themselves.
│
└── Response Interceptor (error)
    └── Status 401 + not a retry → attempt token refresh via POST /auth/refresh
        └── Success → update token-store + retry original request with new token
        └── Failure (refresh also 401) → clear token-store + localStorage, redirect to /login
    └── Status 403 → trigger toast "You don't have permission"
    └── Status 404 → trigger toast or redirect
    └── Status 409 → trigger info toast
    └── Status 400 → pass validation errors to caller (this is the backend's validation error status)
    └── Status 500 → trigger error toast
```

The interceptor does **not** unwrap the response envelope. It passes the full HTTP response through. API functions extract the `.data` field themselves. This preserves pagination metadata.

### API Function Pattern (`features/<domain>/api/<entity>.ts`)

```typescript
// features/appointments/api/appointments.ts
import { api } from "@/lib/axios";

export async function getMyAppointments(): Promise<AppointmentRecord[]> {
  const response = await api.get("/appointments/mine");
  return response.data.data;  // Unwrap ApiResponse envelope
}

export async function bookAppointment(slotId: string): Promise<AppointmentRecord> {
  const response = await api.post("/appointments", { slotId });
  return response.data.data;
}

export async function getMyAppointmentsPaginated(
  page: number,
  limit: number
): Promise<PaginatedResponse<AppointmentRecord>> {
  const response = await api.get("/appointments", { params: { page, limit } });
  return {
    data: response.data.data,
    pagination: response.data.pagination,
  };
}

export async function cancelMyAppointment(id: string): Promise<void> {
  await api.patch(`/appointments/mine/${id}`);
}
```

### Response Type Unwrapping

API functions are responsible for extracting the inner `.data` field from the `ApiResponse` envelope. This gives them full control over pagination metadata and error handling.

---

## 7. Query Layer

### QueryClient Configuration (`src/lib/query-client.ts`)

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,        // 30s default
      gcTime: 300_000,          // 5min garbage collection
      retry: 1,
      refetchOnWindowFocus: false,
      networkMode: "online",
    },
    mutations: {
      retry: 0,
    },
  },
});
```

### Query Key Factory (`src/lib/query-keys.ts`)

```typescript
export const queryKeys = {
  auth:        { me: ["auth", "me"] as const },
  patients:    { me: ["patients", "me"] as const, all: (params?: PaginationParams) => ["patients", "admin", params] as const, byId: (id: string) => ["patients", id] as const },
  doctors:     { all: ["doctors"] as const, byId: (id: string) => ["doctors", id] as const },
  clinics:     { all: ["clinics"] as const, byId: (id: string) => ["clinics", id] as const },
  specialties: { all: ["specialties"] as const, byId: (id: string) => ["specialties", id] as const },
  slots:       { available: (params: AvailableSlotsParams) => ["slots", "available", params] as const, byDoctor: (id: string) => ["slots", "doctor", id] as const, byDate: (date: string) => ["slots", "date", date] as const, admin: (params?: PaginationParams) => ["slots", "admin", params] as const },
  schedules:   { me: ["schedules", "me"] as const, all: ["schedules"] as const, byDoctor: (id: string) => ["schedules", "doctor", id] as const, byId: (id: string) => ["schedules", id] as const },
  appointments: { mine: ["appointments", "mine"] as const, all: ["appointments"] as const, byId: (id: string) => ["appointments", id] as const, byPatient: (id: string) => ["appointments", "patient", id] as const, byDoctor: (id: string) => ["appointments", "doctor", id] as const },
  payments:    { mine: ["payments", "mine"] as const, all: ["payments"] as const, byId: (id: string) => ["payments", id] as const, byAppointment: (id: string) => ["payments", "appointment", id] as const, admin: (params?: PaginationParams) => ["payments", "admin", params] as const },
  reviews:     { mine: ["reviews", "mine"] as const, all: ["reviews"] as const, byId: (id: string) => ["reviews", id] as const, byAppointment: (id: string) => ["reviews", "appointment", id] as const, admin: (params?: PaginationParams) => ["reviews", "admin", params] as const },
  users:       { all: (params?: UserFilters) => ["users", params] as const, byId: (id: string) => ["users", id] as const },
};
```

Note: The `doctors.all` key does **not** include filter parameters. The API contract for `GET /doctors` does not document query parameters for server-side filtering. If client-side filtering by clinic or specialty is needed, it is done in JavaScript after fetching the full list.

### Query Hook Pattern (`features/<domain>/hooks/use<Entity>.ts`)

```typescript
export function useMyAppointments() {
  return useQuery({
    queryKey: queryKeys.appointments.mine,
    queryFn: getMyAppointments,
    staleTime: 30_000,
  });
}

export function useBookAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: bookAppointment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["slots", "available"] });
    },
  });
}
```

### Cache Invalidation Map

| Mutation | Invalidates |
|----------|-------------|
| `bookAppointment` | `["appointments"]`, `["slots", "available"]` |
| `cancelMyAppointment` | `["appointments"]`, `["slots", "available"]` |
| `createPayment` | `["payments"]`, `["appointments"]` |
| `createReview` | `["reviews"]`, `["appointments"]` |
| `updateMyProfile` | `["patients", "me"]` |
| Admin CRUD (any entity) | The corresponding entity key prefix + `["users"]` if user-related |

### Stale-Time Allocation

| Data | staleTime | Notes |
|------|-----------|-------|
| Clinics | 5 min | Rarely changes |
| Specialties | 5 min | Rarely changes |
| Doctors | 2 min | Moderate churn |
| Available slots | 30 s | Highly volatile |
| My appointments | 30 s | Status can change |
| My schedule (doctor) | 5 min | Weekly recurring |
| My patient profile | Infinity | Static between edits |
| My payments | 1 min | Status changes |
| My reviews | 2 min | Moderate |
| Admin lists | 1 min | Needs freshness |

---

## 8. Custom Hooks

### Global Hooks (`src/hooks/`)

| Hook | Returns | Purpose |
|------|---------|---------|
| `useAuth()` | `{ user, login, register, logout, isAuthenticated, isLoading }` | Consumes AuthContext. Does **not** expose tokens to components. |
| `useApiError()` | `{ error, fieldErrors, handleError, clearError }` | Parses AxiosError into user-friendly format |
| `useDebounce<T>(value, ms)` | `debouncedValue` | Debounces a value |
| `useMediaQuery(query)` | `boolean` | Responsive breakpoint detection |
| `usePagination(totalPages)` | `{ page, setPage, next, prev, hasNext, hasPrev }` | Pagination state |

Note: `useAuth()` does **not** expose `tokens`. Components should never have direct access to tokens. Only the token-store module and the Axios interceptor handle tokens.

### Feature Hooks (per module in `features/<domain>/hooks/`)

Each feature module defines its own query + mutation hooks. Convention:

| Pattern | Example |
|---------|---------|
| `use<Entity>List` | `useClinicsList`, `useDoctorsList`, `useMyAppointments` |
| `use<Entity>ById` | `useClinicById`, `useDoctorById` |
| `useCreate<Entity>` | `useCreateClinic`, `useBookAppointment` |
| `useUpdate<Entity>` | `useUpdateClinic`, `useUpdateMyProfile` |
| `useDelete<Entity>` | `useDeleteClinic`, `useDeleteUser` |
| `use<Action><Entity>` | `useCancelAppointment`, `useCreatePayment`, `useCreateReview` |

### Hook Implementation Rules

1. Query hooks always use `queryKeys` factory for key consistency.
2. Mutation hooks always define `onSuccess` invalidation.
3. Mutation hooks optionally define `onError` to call `useApiError().handleError`.
4. Query hooks use `select` to transform API response shape if needed.
5. Paginated queries accept params object `{ page, limit, ...filters }`.
6. Hooks never directly access localStorage or sessionStorage — they delegate to the auth provider.

---

## 9. Providers

Provider composition in the root layout (`src/app/layout.tsx`):

```
<ThemeProvider>
  <QueryProvider>
    <AuthProvider>
      <ToastProvider>
        {children}
      </ToastProvider>
    </AuthProvider>
  </QueryProvider>
</ThemeProvider>
```

### ThemeProvider

- Reads theme preference from `localStorage` (default: dark).
- Sets `data-theme` attribute on `<html>`.
- Provides `useTheme()` hook for toggling.

### QueryProvider

- Creates a single `QueryClient` instance (stable across renders).
- Enables React Query Devtools in development.
- Sets `networkMode: "online"` to respect offline status.

### AuthProvider

- On mount: checks `localStorage` for refresh token, calls `POST /auth/refresh` to restore session.
- Stores access token in `lib/token-store.ts` (module-level variable, not React state) for the Axios interceptor.
- Stores refresh token in `localStorage` (as permitted by the API Contract §1: "Client must store both tokens securely (e.g., localStorage...)").
- Exposes `useAuth()` hook with `login`, `register`, `logout`, `user`, `isAuthenticated`, `isLoading`.
- `useAuth()` does **not** expose raw tokens to components.
- On 401 refresh failure: clears tokens, sets `user` to null.
- Prefetches `GET /auth/me` on auth state restoration.

### ToastProvider

- shadcn/ui toast provider with context.
- Exposes `toast()` function with `success`, `error`, `info`, `warning` variants.
- Auto-dismiss after 5 seconds.
- Stack up to 5 toasts, oldest dismissed first.

---

## 10. State Management Strategy

### State Ownership Matrix

| State Type | Owner Layer | Storage | Persisted? |
|---|---|---|---|
| Auth tokens | TokenStore (module-level) | `src/lib/token-store.ts` module variable | No (memory only) |
| Refresh token | AuthProvider | `localStorage` | Yes |
| Auth user | AuthProvider (React state) | `useState` | No (refetched) |
| Server data | TanStack Query cache | Global QueryClient | No |
| Form state | React Hook Form (local) | Component-local `useForm` | No |
| UI state (modals, drawers) | Local `useState` | Per component | No |
| Sidebar collapse | Local state | Per layout | Optional localStorage |
| Booking wizard step | Local state | Component-local | No |
| Table filters/sort | URL search params | `useSearchParams` | Yes (URL) |
| Pagination page | URL search params | `useSearchParams` | Yes (URL) |
| Theme preference | ThemeProvider | `localStorage` | Yes |
| Toast queue | ToastProvider | Context state | No |

### Rules

1. **No global state library** — TanStack Query for server state, Context for auth/toast, URL params for shareable UI state, local state for everything else.
2. **URL as source of truth** for pagination, filters, and search — enables shareable/bookmarkable URLs.
3. **Form state stays in React Hook Form** — never synced to global state. On submit, extract values and pass to mutation.
4. **Auth tokens are never stored in React state** — the module-level token-store ensures the Axios interceptor can read them synchronously without React re-render overhead.

---

## 11. Server Components vs Client Components Strategy

### Default: Server Components

Next.js 16 App Router renders all pages as Server Components by default. Client Components are opt-in via the `"use client"` directive.

### Server Component Boundaries

| Use Server Component When | Use Client Component When |
|---------------------------|---------------------------|
| Static content (landing page, hero sections) | Interactive UI (forms, buttons, modals) |
| SEO-sensitive content | Stateful components (context consumers, controlled inputs) |
| Data that doesn't need real-time updates | TanStack Query hooks (`useQuery`, `useMutation`) |
| Layouts that don't require interactivity | Event handlers (onClick, onChange, onFocus) |
| Metadata generation | Browser API access (localStorage, navigator) |
| Initial page-level data fetching with `async` component | Animations, drag-and-drop, scroll listeners |

### Client Component Extraction Pattern

```
page.tsx (Server Component)
├── <PageHeader />                   — Server Component (static)
├── <AppointmentListWrapper>         — Client Component boundary
│   ├── uses useMyAppointments()
│   └── renders interactive AppointmentCard list
├── <CancelDialog />                 — Client Component (modal state)
└── <ErrorBanner />                  — Client Component (dismiss state)
```

### Data Fetching Pattern

- **Server Components** fetch initial data directly using `fetch()` with `next: { revalidate }` for public, cached data (clinics list, specialties list).
- **Client Components** use TanStack Query hooks for authenticated, real-time, or user-specific data.
- For pages with mixed public/private data, the Server Component fetches public data, and the Client Component wrapper fetches user-specific data.

| Screen | Server Fetch | Client Fetch |
|--------|-------------|--------------|
| Landing (`/`) | None (static) | None |
| Login/Register | None | Auth mutations |
| Patient Dashboard | None | Appointments, patient profile |
| Book Appointment | Clinics, Specialties (SSR) | Doctors, Available slots |
| Doctor Dashboard | None | Appointments, schedule |
| Admin list pages | None (authenticated) | Paginated entity lists |

---

## 12. File Naming Convention

### Core Conventions

| Entity | Convention | Examples |
|--------|-----------|---------|
| Pages | `page.tsx` | `login/page.tsx`, `admin/users/page.tsx` |
| Layouts | `layout.tsx` | `(authenticated)/layout.tsx`, `(admin)/layout.tsx` |
| Loading UI | `loading.tsx` | `appointments/loading.tsx` |
| Error UI | `error.tsx` | `appointments/error.tsx` |
| Not Found | `not-found.tsx` | `admin/users/not-found.tsx` |
| API functions | `<entity>.ts` | `appointments.ts`, `clinics.ts` |
| Query hooks | `use<Entity><Action>.ts` | `useMyAppointments.ts`, `useBookAppointment.ts` |
| Zod schemas | `<entity>.ts` | `appointment.ts`, `patient.ts` |
| Types | `<entity>.ts` | `appointment.ts`, `patient.ts` |
| React components | `<ComponentName>.tsx` | `AppointmentCard.tsx`, `SlotPicker.tsx` |
| Providers | `<name>-provider.tsx` | `auth-provider.tsx`, `toast-provider.tsx` |
| Barrel exports | `index.ts` | `features/auth/index.ts` |

### File Name Rules

- **Components:** PascalCase, suffixed with `.tsx`. `Button.tsx`, `DataTable.tsx`, `AppointmentCard.tsx`.
- **Hooks:** camelCase, prefixed with `use`, suffixed with `.ts`. `useAuth.ts`, `useMyAppointments.ts`.
- **API functions:** camelCase, suffixed with `.ts`. `appointments.ts`, `clinics.ts`.
- **Schemas:** camelCase, suffixed with `.ts`. `auth.ts`, `appointment.ts`.
- **Types:** camelCase, suffixed with `.ts`. `appointment.ts`, `payment.ts`.
- **Utilities:** camelCase, `.ts` extension. `utils.ts`, `query-keys.ts`.
- **Config:** camelCase, `.ts` extension. `index.ts` in `config/`.
- **Providers:** kebab-case, `.tsx` extension. `auth-provider.tsx`, `toast-provider.tsx`.

### Directory Index Files

Each feature module has an `index.ts` barrel file:

```typescript
// features/auth/index.ts
export * from "./api/auth";
export * from "./hooks/useLogin";
export * from "./hooks/useRegister";
export * from "./hooks/useLogout";
export * from "./hooks/useAuthMe";
export * from "./components/LoginForm";
export * from "./components/RegisterForm";
```

---

## 13. Import Convention

### Absolute Imports

All imports use the `@/` alias mapped to `src/` in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Import Order

1. React / Next.js
2. Third-party libraries (TanStack Query, Axios, React Hook Form, Zod, shadcn/ui)
3. Internal lib/config (`@/lib/*`, `@/config/*`, `@/types/*`, `@/schemas/*`)
4. Feature module imports (`@/features/auth/*`)
5. Component imports (`@/components/ui/*`, `@/components/business/*`)
6. Hooks (`@/hooks/*`)
7. Relative imports (only within the same feature module)

### Import Rules

- Feature modules import from other feature modules via their barrel `index.ts` only.
- Components import from `@/components/ui/*` and `@/components/business/*`.
- Pages import from `@/features/<domain>/hooks/*` for data, and `@/components/*` for UI.
- No deep imports like `../../features/auth/hooks/useAuth`.
- Types are imported from `@/types/*`.
- Schemas are imported from `@/schemas/*`.

### Example

```typescript
// src/app/(authenticated)/appointments/page.tsx
import { Suspense } from "react";
import { useMyAppointments, useCancelAppointment } from "@/features/appointments";
import { AppointmentCard } from "@/components/business/AppointmentCard";
import { ErrorBanner, Skeleton } from "@/components/feedback";
import { StatusBadge } from "@/components/business/StatusBadge";
import { useAuth } from "@/hooks/useAuth";
```

---

## 14. Error Boundary Strategy

### Layer 1: Global Error Boundary (`src/app/error.tsx`)

- Catches unhandled React errors at the root level.
- Renders a "Something went wrong" page with a "Try Again" button.
- Logs error details to console (extendable to error reporting service).
- Does NOT reset auth state — user remains logged in.

### Layer 2: Route Group Error Boundaries

Each route group has its own `error.tsx`:

- `(public)/error.tsx` — Simple error page with link to home.
- `(authenticated)/error.tsx` — Error page with sidebar still visible, retry button.
- `(admin)/error.tsx` — Same pattern.

### Layer 3: Feature-Specific Error Boundaries

Wrapped around individual feature sections within a page:

```typescript
<ErrorBoundary fallback={<ErrorBanner message="Failed to load appointments" onRetry={refetch} />}>
  <AppointmentList />
</ErrorBoundary>
```

### Layer 4: API Error Handling (per mutation/query)

- `useApiError()` hook parses Axios errors and returns structured error info.
- TanStack Query `onError` callbacks invoke `useApiError().handleError`.
- Validation errors (400) are mapped to form field errors in React Hook Form. HTTP 400 is the backend's standard validation error status.
- Auth errors (401) are handled by the Axios interceptor globally.
- Permission errors (403) show a toast.
- Not-found errors (404) in admin detail views redirect to the list page with a toast.
- Conflict errors (409) show an information toast.
- Server errors (500) show a generic toast.

### Network Offline

- TanStack Query `networkMode: "online"` pauses all queries when offline.
- A global `OnlineStatusProvider` listens to `navigator.onLine` and `online`/`offline` events.
- An offline banner is rendered at the top of the page when offline.
- Mutations are queued (or blocked) during offline — user is informed via banner.

---

## 15. Loading Strategy

### App Router Native Loading

Next.js App Router provides built-in loading states via `loading.tsx` files:

```
src/app/(authenticated)/appointments/loading.tsx  — Skeleton list page
src/app/(authenticated)/book/loading.tsx          — Skeleton step wizard
src/app/(admin)/admin/users/loading.tsx           — Skeleton table
```

### Skeleton Variants

| Variant | Usage | Shape |
|---------|-------|-------|
| `skeleton="card"` | AppointmentCard, DoctorCard | 300×180px rectangle with 3 text lines |
| `skeleton="table"` | DataTable rows | 5 rows × 5 columns of lines |
| `skeleton="form"` | Profile form, Login form | 4 stacked input-like lines + button |
| `skeleton="text"` | Inline text replacement | Single line, 60% width |
| `skeleton="calendar"` | WeeklyCalendar | Grid of 7×8 cells |

### Per-Component Loading States

Every data-fetching component follows this state machine:

```typescript
// Pattern used in every data component
if (isLoading) return <Skeleton variant="card" />;
if (isError) return <ErrorBanner message={error.message} onRetry={refetch} />;
if (!data?.length) return <EmptyState title="No appointments" action={{ label: "Book now", href: "/book" }} />;
return <DataList data={data} />;
```

### Transition Loading

- Route transitions use Next.js `useTransition` for non-blocking navigation.
- The `StepWizard` in the booking flow shows a spinner per step as clinic/doctor/slot data loads.
- Admin CRUD tables show skeleton rows when `useQuery` is loading next pages.

---

## 16. Authentication Strategy

### Contract Constraints

The API Contract (§1) defines the authentication contract:

1. Tokens are returned as strings in the response body. **Not** as HTTP-only cookies.
2. Client must store tokens securely (e.g., localStorage).
3. All authenticated requests use `Authorization: Bearer <accessToken>` header.
4. Token refresh: `POST /auth/refresh` with `{ refreshToken }` in body.
5. Logout: `POST /auth/logout` with `{ refreshToken }` in body + Bearer header.
6. The backend issues no cookies. There is no session cookie, no auth cookie, no HttpOnly cookie for tokens.

**Consequence for route protection:** Next.js middleware runs on the Edge runtime. The Edge runtime cannot access `localStorage` or JavaScript memory variables. Since the backend does not issue any cookie, the middleware has no mechanism to verify authentication. **All route protection must be client-side.** This is an accepted limitation of the JWT-in-response-body pattern.

### Token Flow

```
Register / Login
  → POST /auth/register or POST /auth/login
  → Receive { accessToken, refreshToken }
  → Write accessToken to token-store (module-level variable)
  → Write refreshToken to localStorage
  → Set AuthContext.user from GET /auth/me
  → Redirect to /dashboard

Page Load (existing session)
  → AuthProvider checks localStorage for refreshToken
    → If present: POST /auth/refresh
      → Success: update token-store + localStorage, fetch GET /auth/me
      → Failure (401): clear token-store + localStorage, set user to null
    → If absent: set user to null (unauthenticated client-side)

401 During API Call
  → Axios response interceptor catches 401
  → If not already retried:
    → Read refreshToken from token-store
    → POST /auth/refresh
    → Success: update token-store + localStorage, retry original request
    → Failure: clear tokens, redirect to /login
  → If already retried: reject with 401 (no more refresh attempts)

Logout
  → POST /auth/logout { refreshToken }
  → Clear accessToken from token-store
  → Clear refreshToken from localStorage
  → Set AuthContext.user to null
  → Redirect to /login
```

### Route Protection Strategy

Since the middleware cannot perform auth checks (no cookie from backend, no localStorage/JS memory access in Edge runtime), protection uses **two client-side layers**:

#### Layer 1: Layout-Level Auth Guard

Each route group layout wraps its pages with `AuthGuard`:

| Route Group | Behavior |
|---|---|
| `(public)` | No guard — open to all |
| `(authenticated)` | `AuthGuard` checks `isAuthenticated` — redirects to `/login` if not |
| `(admin)` | `AuthGuard` checks `isAuthenticated && role === "admin"` — redirects to `/dashboard` if not |

The layout renders nothing (or a spinner) while auth state is loading. Once the state resolves, it either renders children or redirects.

#### Layer 2: Role-Specific Page Guards

Within the `(authenticated)` group, pages that are role-specific wrap their content:

```typescript
// /book — patient only
export default function BookAppointmentPage() {
  const { user } = useAuth();
  if (user?.role !== "patient") return <Redirect to="/dashboard" />;
  return <BookAppointmentFlow />;
}

// /schedule — doctor only
export default function SchedulePage() {
  const { user } = useAuth();
  if (user?.role !== "doctor") return <Redirect to="/dashboard" />;
  return <DoctorSchedule />;
}
```

#### The `AuthGuard` Component

```typescript
<AuthGuard allowedRoles={["patient"]}>
  <BookAppointmentFlow />
</AuthGuard>
```

It reads `useAuth()` and:
- While loading (`isLoading === true`): renders nothing (prevents flash of guarded content before auth resolves).
- If not authenticated: renders `<Redirect to="/login" />`.
- If authenticated but role not in `allowedRoles`: renders `<Redirect to="/dashboard" />`.
- If authenticated and role matches: renders children.

#### Known Limitation: Flash of Unguarded Shell

Because protection is entirely client-side, when a user navigates directly to a protected URL:
1. The server renders the layout shell (Server Component) immediately.
2. Client-side hydration begins, `AuthProvider` mounts, `useAuth()` returns `isLoading: true`.
3. `AuthGuard` renders nothing (or a spinner).
4. Auth state resolves → redirect to `/login`.

This means there is a brief moment where the layout shell is visible before the guard redirects. This is visually acceptable because:
- The shell has no sensitive data — only the layout chrome (sidebar, navbar).
- The guard renders nothing during loading, so content never flashes.
- On subsequent SPA navigations, auth state is already resolved, so the redirect is instant.

This pattern matches how production apps like Vercel, Linear, and Stripe handle JWT auth without middleware-protected routes.

### Token Storage Security

- Access token: JavaScript module-level variable (`lib/token-store.ts`). Not accessible via XSS that reads localStorage.
- Refresh token: `localStorage`. Explicitly permitted by API Contract §1: "Client must store both tokens securely (e.g., localStorage...)". Server-side rotation invalidates old tokens on each refresh.
- No HTTP-only cookies (API returns tokens in response body per contract §1).
- Logout revokes the refresh token server-side.
- Components never have access to raw tokens via `useAuth()`.

---

## 17. Code Splitting Strategy

### Automatic Splitting (Next.js App Router)

- Each route file (`page.tsx`) is automatically code-split into its own chunk.
- Layouts are shared across their route group — not duplicated.
- Loading UI (`loading.tsx`) is included in the same chunk as the page.

### Dynamic Imports (`next/dynamic`)

Heavy components loaded on demand:

```typescript
// Booking flow — SlotPicker component (calendar grid)
const SlotPicker = dynamic(() => import("@/components/business/SlotPicker"), {
  loading: () => <Skeleton variant="calendar" />,
  ssr: false,
});

// Admin — DataTable (large due to sorting/filtering logic)
const DataTable = dynamic(() => import("@/components/data/DataTable"), {
  loading: () => <Skeleton variant="table" />,
});
```

### Dynamic Import Candidates

| Component | Reason | Load Trigger |
|-----------|--------|-------------|
| `SlotPicker` | Large calendar/time grid library | After doctor/date selected in booking flow |
| `DataTable` | Complex sorting/filtering logic | On admin list page mount |
| `WeeklyCalendar` | Calendar rendering library | On schedule page mount |
| `StarRating` | Interactive star rating | On review form open |
| `ReviewForm` | Text editor with character count | On "Write Review" button click |
| `PaymentForm` | Payment method selection | On "Pay Now" button click |

### Component-Level Splitting

- Modals and dialogs are lazy-loaded: `const ConfirmDialog = dynamic(...)`.
- Form components inside modals are lazy: `const ClinicFormModal = dynamic(...)`.
- Admin CRUD modals are loaded only when the user clicks "Create" or "Edit".

### Route-Level Splitting

The three route groups `(public)`, `(authenticated)`, `(admin)` are automatically split by Next.js. Admin routes are the largest — they load only when the admin navigates to them.

---

## 18. Performance Strategy

### Rendering Optimization

| Technique | Application |
|-----------|-------------|
| Server Components | Public pages (landing), static layout shell |
| `React.memo` | DataTable rows, AppointmentCard, DoctorCard (list items) |
| `useMemo` | Computed filter/sort results, formatted dates |
| `useCallback` | Event handlers passed to list item components |
| `Suspense` boundaries | Independent data sections within a page |

### Data Loading

| Technique | Application |
|-----------|-------------|
| Parallel queries | Booking flow: fetch clinics + specialties simultaneously |
| Prefetching on hover | Prefetch clinics/specialties on "Book" CTA hover |
| Prefetching on mount | Admin list pages: prefetch page 1 |
| Stale-while-revalidate | All data with configured staleTime |
| Optimistic updates | Appointment cancellation, profile update, status changes |
| `gcTime` management | 30 min for reference data (clinics, specialties), 5 min for dynamic data |

### Bundle Optimization

| Technique | Application |
|-----------|-------------|
| Dynamic imports | Calendar, DataTable, modals |
| Tree-shaking | Import only used icons (lucide-react) |
| `next/image` | All images (hero, doctor photos) with lazy loading |
| Font optimization | Inter font loaded via `next/font` |
| CSS optimization | Tailwind CSS v4 JIT compilation, purge unused styles |

### Image Strategy

- All images use `<Image>` from `next/image` with explicit `width`/`height`.
- Hero images use `priority` for LCP optimization.
- Doctor profile images use `lazy` loading.
- Placeholder blur data URIs for images above the fold.

### Network

- TanStack Query `staleTime` reduces redundant requests.
- Axios interceptor reuses connections (keep-alive by default).
- Pagination limit defaults to 20 (max 100) per API contract.

### Rendering Lifecycle

1. **Server Component** renders static shell (layout, nav, sidebar).
2. Client Component boundary mounts, TanStack Query fires.
3. **Loading state** (skeleton) renders immediately.
4. **Cache hit** (within staleTime): instant render from cache.
5. **Cache miss**: show skeleton → fetch → render data.
6. **Background refetch** (after staleTime): show stale data → fetch → update.

---

## 19. Accessibility Strategy

### Standards

- Target **WCAG 2.2 AA** compliance.
- All interactive elements must be keyboard accessible.
- Color contrast ratios meet AA minimum (4.5:1 for text, 3:1 for large text).

### Design System Compliance with Stitch Theme

The Stitch dark theme tokens already meet contrast requirements:

| Token Pair | Contrast Ratio | WCAG Level |
|------------|---------------|------------|
| `on-surface` (#dfe2f1) on `surface-container` (#1c1f2a) | ~11.5:1 | AAA |
| `on-surface-variant` (#c7c4d7) on `surface` (#0f131d) | ~8.2:1 | AAA |
| `primary` (#c0c1ff) on `surface` (#0f131d) | ~8.1:1 | AAA |
| `secondary` (#5de6ff) on `surface` (#0f131d) | ~7.9:1 | AAA |
| `on-error` (#690005) on `error` (#ffb4ab) | ~5.1:1 | AA |
| `outline` (#908fa0) on `surface` (#0f131d) | ~5.5:1 | AA |

### Component-Level Accessibility

| Component | ARIA | Keyboard |
|-----------|------|----------|
| Button | `role="button"`, `aria-disabled` | Enter/Space |
| Input | `aria-invalid`, `aria-describedby` | Tab, Enter |
| Dialog | `role="dialog"`, `aria-modal`, `aria-labelledby` | Escape to close, Tab trap |
| Select | `role="listbox"`, `aria-expanded` | Arrow keys, Enter |
| DataTable | `role="table"`, `aria-sort` on headers | Tab, Shift+Tab |
| Tabs | `role="tablist"`, `role="tab"`, `aria-selected` | Arrow keys |
| Toast | `role="alert"`, `aria-live="polite"` | Auto-focused if interactive |
| Modal | Focus trap, `aria-hidden` on background | Tab cycle within modal |
| StarRating | `role="radiogroup"`, `aria-label` | Arrow keys to change rating |
| SlotPicker | `role="grid"`, `aria-label` per slot | Arrow keys, Enter to select |

### Form Accessibility

- Every form field has an associated `<label>` (not just `aria-label`).
- Error messages use `aria-describedby` linking to the field.
- Required fields are marked with `required` attribute and `aria-required="true"`.
- Form submission shows a loading state on the submit button (`aria-busy="true"`).
- Success/failure announcements use `aria-live="polite"` region.

### Focus Management

- Page navigation sets focus to `<h1>` at the top of the main content area.
- Modal opens: focus moves to first focusable element.
- Modal closes: focus returns to the trigger element.
- Form submission errors: focus moves to the first field with an error.
- Route changes: `<main>` element receives focus via a focus-trap skip link.

### Reduced Motion

- Respects `prefers-reduced-motion` for all animations and transitions.
- Skeleton loading animations are disabled when reduced motion is preferred.
- Page transitions use `opacity` transitions only (no transform animations) when reduced motion is active.

### Screen Reader Announcements

- TanStack Query loading/error/success states announce via `aria-live` region.
- Optimistic updates announce the expected change.
- Toast notifications use `role="alert"`.

---

## 20. Testing Strategy

### Testing Layers

| Layer | Tool | Scope | Location |
|-------|------|-------|----------|
| Unit (logic) | Vitest | Hooks, utils, schemas, API functions | Co-located: `*.test.ts` |
| Component | Vitest + Testing Library | Component rendering, user interactions | Co-located: `*.test.tsx` |
| Integration | Vitest + MSW | Feature flows (auth → booking) | `__tests__/integration/` |
| E2E | Playwright | Critical user journeys | `e2e/` |
| Visual | Storybook + Chromatic | Component visual regression | `.storybook/` |

### Unit Testing (Vitest)

**Test targets:**
- Zod schemas: valid/invalid inputs, error messages, edge cases.
- Query key factory: key shape correctness.
- Utility functions (`formatDate`, `cn`, `formatCurrency`).
- API function wrappers (mocked Axios).
- Custom hooks (mocked TanStack Query + Axios).

**File naming:** `*.test.ts` co-located with source.

**Hook testing pattern:**
```typescript
// features/appointments/hooks/useMyAppointments.test.ts
import { renderHook, waitFor } from "@testing-library/react";
import { createWrapper } from "@/test-utils/query-wrapper";
import { useMyAppointments } from "./useMyAppointments";

it("returns appointments on success", async () => {
  const { result } = renderHook(() => useMyAppointments(), { wrapper: createWrapper() });
  await waitFor(() => expect(result.current.isSuccess).toBe(true));
  expect(result.current.data).toHaveLength(2);
});
```

### Component Testing (Testing Library)

**Test targets:**
- Business components (AppointmentCard, SlotPicker, DataTable).
- Guards (AuthGuard, RoleGuard).
- Forms (LoginForm, ProfileForm, ReviewForm).
- Feedback components (ErrorBanner, EmptyState, Skeleton).

**File naming:** `ComponentName.test.tsx` co-located.

**Pattern:**
```typescript
// AppointmentCard.test.tsx
it("renders appointment details and cancel button", () => { ... });
it("calls onCancel when cancel is clicked", () => { ... });
it("disables cancel button for completed appointments", () => { ... });
it("shows correct status badge color", () => { ... });
```

### Integration Testing (MSW)

**Test targets:**
- Complete user flows within a single page.
- Auth flow: register → redirect → dashboard shows data.
- Booking flow: select clinic → specialty → doctor → slot → confirm.
- Admin CRUD: list → create → edit → delete.

**File naming:** `*.integration.test.ts` in `__tests__/integration/`.

**MSW handlers cover all API endpoints from the contract.**

### E2E Testing (Playwright)

**Critical paths:**
1. Unauthenticated user → visit landing → register → see dashboard.
2. Patient → book appointment → see in appointments list.
3. Patient → cancel appointment → status updates.
4. Patient → create payment → see in payments list.
5. Patient → create review → see in reviews list.
6. Doctor → login → see appointments → cancel one.
7. Admin → login → CRUD users → verify table updates.
8. Admin → create clinic → verify it appears in public clinics.
9. Authentication edge: expired token → auto-refresh → request succeeds.
10. Authentication edge: refresh token expired → redirect to login.

**File naming:** `*.spec.ts` in `e2e/`.

### Visual Regression (Storybook + Chromatic)

**Components in Storybook:**
- All business components (AppointmentCard, SlotPicker, WeeklyCalendar, etc.).
- All layout components (Navbar, Sidebar, AdminSidebar).
- All feedback components (Toast, ErrorBanner, EmptyState).
- Each with multiple states: default, loading, empty, error, active, disabled.

### Test Utilities (`src/test-utils/`)

```typescript
// test-utils/query-wrapper.tsx — Wraps components with QueryClient + AuthProvider
// test-utils/msw-handlers.ts — MSW handlers for all API endpoints
// test-utils/render-with-providers.tsx — Custom render with all providers
// test-utils/mock-data.ts — Factory functions for test data (clinic, doctor, appointment, etc.)
```

### Testing Configuration

- `vitest.config.ts` — Project root.
- `playwright.config.ts` — Project root.
- MSW integrated in both Vitest (unit/integration) and Playwright (E2E mocking).

### Coverage Targets

| Layer | Minimum |
|-------|---------|
| Zod schemas | 100% |
| Utility functions | 100% |
| Custom hooks | 90% |
| Business components | 80% |
| Page components | 70% |
| E2E critical paths | 100% of defined paths |