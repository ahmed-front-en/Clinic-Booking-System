# Frontend Architecture — Clinic Booking System

## Tech Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Framework** | Next.js 16 (App Router) | Server Components, file-based routing, API route colocation |
| **Language** | TypeScript 7 (strict) | Match backend |
| **Styling** | Tailwind CSS 4 | Utility-first, rapid UI, first-class Next.js support |
| **UI Library** | shadcn/ui + Radix Primitives | Accessible, unstyled, composable, tree-shakeable |
| **Forms** | React Hook Form + Zod resolver | Performant, shares validation logic with backend |
| **Server State** | TanStack Query v6 | Caching, pagination, optimistic updates, stale-while-revalidate |
| **HTTP Client** | fetch (via TanStack Query) | Native, edge-compatible, no extra bundle |
| **Auth** | Custom AuthProvider (React Context) | In-memory access token, httpOnly refresh cookie, 401 interceptor |
| **Date Handling** | date-fns | Lightweight, tree-shakeable, timezone-safe |
| **Toast/Notifications** | sonner | Lightweight toast library |

---

## App Router Strategy

```
src/frontend/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout (providers, fonts)
│   ├── page.tsx                  # Landing/home page
│   ├── (public)/                 # Public route group (no auth required)
│   │   ├── doctors/              # Doctor listing (RSC)
│   │   ├── doctors/[id]/         # Doctor detail (RSC)
│   │   ├── clinics/              # Clinic listing (RSC)
│   │   └── specialties/          # Specialty listing (RSC)
│   ├── (auth)/                   # Auth route group (unauthenticated only)
│   │   ├── login/
│   │   ├── register/
│   │   └── forgot-password/
│   ├── (dashboard)/              # Authenticated route group
│   │   ├── (patient)/            # Patient routes
│   │   │   ├── layout.tsx        # Patient layout (sidebar)
│   │   │   ├── appointments/
│   │   │   ├── book/
│   │   │   ├── payments/
│   │   │   └── reviews/
│   │   ├── (doctor)/             # Doctor routes
│   │   │   ├── layout.tsx
│   │   │   ├── schedule/
│   │   │   └── appointments/
│   │   └── (admin)/              # Admin routes
│   │       ├── layout.tsx
│   │       ├── doctors/
│   │       ├── clinics/
│   │       ├── specialties/
│   │       ├── users/
│   │       ├── schedules/
│   │       ├── slots/
│   │       ├── appointments/
│   │       ├── payments/
│   │       └── reviews/
│   └── error.tsx                 # Global error boundary
```

### Route Group Rules

| Group | Access | Middleware |
|-------|--------|-----------|
| `(public)` | Anyone | None |
| `(auth)` | Unauthenticated only | `redirect(/dashboard)` if logged in |
| `(dashboard)` | Authenticated | JWT check, redirect `/login` |
| `(patient)` | Role = `patient` | `authorize("patient")` |
| `(doctor)` | Role = `doctor` | `authorize("doctor")` |
| `(admin)` | Role = `admin` | `authorize("admin")` |

---

## Server Components vs Client Components

### Default to Server Components

| Use Server Component | Use Client Component |
|---------------------|---------------------|
| Static page layouts | Interactive forms |
| Data fetching (RSC) | User event handlers |
| SEO-important pages | `useState`/`useEffect`/`useContext` |
| Public doctor/clinic lists | TanStack Query hooks |
| Metadata generation | React Hook Form usage |
| Initial user data | toast/sonner triggers |

### Decision Rules

1. Every component starts as a Server Component
2. Add `"use client"` only when you need: hooks, event handlers, browser APIs, or context
3. Keep client components as leaf components — push data fetching up to Server Components
4. Extract interactive pieces into small client wrappers (e.g., `BookButton`, `AppointmentTable`)

---

## Feature-Based Folder Structure

```
src/frontend/
├── app/                          # App Router pages (thin — just composition)
├── components/                   # Shared components
│   ├── ui/                       # shadcn/ui primitives (button, input, card, etc.)
│   ├── layout/                   # Sidebar, Header, Navbar, Footer
│   ├── data-display/             # Table, DataTable, Badge, Avatar
│   ├── feedback/                 # Toast, Alert, ConfirmDialog
│   └── forms/                    # FormField, InputGroup, DatePicker
├── features/                     # Feature modules (mirrors backend modules)
│   ├── auth/
│   │   ├── api/                  # TanStack Query mutations + queries
│   │   ├── components/           # LoginForm, RegisterForm, AuthGuard
│   │   └── schemas/             # Zod schemas (mirror backend validation)
│   ├── patients/
│   │   ├── api/
│   │   ├── components/
│   │   └── schemas/
│   ├── doctors/
│   ├── clinics/
│   ├── specialties/
│   ├── doctor-schedules/
│   ├── appointment-slots/
│   ├── appointments/
│   ├── payments/
│   ├── reviews/
│   └── users/                    # Admin user management
├── lib/                          # Shared utilities
│   ├── http/                     # fetch wrapper, base config
│   │   ├── api-client.ts        # Base fetch with auth header injection
│   │   └── query-keys.ts        # TanStack Query key factory
│   ├── auth/
│   │   ├── auth-context.tsx      # Auth context provider
│   │   ├── use-auth.ts          # Auth hook
│   │   └── auth-guard.tsx       # Route protection
│   ├── hooks/                    # Shared hooks
│   │   ├── use-pagination.ts
│   │   └── use-debounce.ts
│   ├── config/
│   │   └── env.ts               # Client-safe env vars
│   ├── types/
│   │   └── api.ts               # API response types, record types
│   └── utils/
│       ├── cn.ts                # clsx + tailwind-merge helper
│       └── format.ts            # Date, currency formatters
```

---

## API Layer Architecture

### Base API Client

```
lib/http/api-client.ts
```

```typescript
// Responsibilities:
// - Base URL from env
// - Automatic Authorization header injection from AuthProvider (in-memory access token)
// - Response envelope unwrapping (.data)
// - Error normalization (throw AppError-like client error)
// - Content-Type: application/json
```

### TanStack Query Key Factory

```
lib/http/query-keys.ts
```

```typescript
export const queryKeys = {
  doctors: {
    all:    ["doctors"] as const,
    list:   (filters?: DoctorFilters) => ["doctors", "list", filters] as const,
    detail: (id: string) => ["doctors", "detail", id] as const,
  },
  clinics:       { all: ..., list: ..., detail: ... },
  specialties:   { all: ..., list: ..., detail: ... },
  patients:      { all: ..., me: ..., detail: ... },
  appointments:  { all: ..., mine: ..., detail: ... },
  // ...per module
};
```

### API Module Pattern

Each feature has an `api/` directory with query + mutation hooks:

```typescript
// features/doctors/api/use-doctors.ts
export function useDoctors(filters?: DoctorFilters) {
  return useQuery({
    queryKey: queryKeys.doctors.list(filters),
    queryFn: () => apiClient.get("/doctors", { params: filters }),
  });
}

export function useDoctor(id: string) {
  return useQuery({
    queryKey: queryKeys.doctors.detail(id),
    queryFn: () => apiClient.get(`/doctors/${id}`),
    enabled: !!id,
  });
}

export function useCreateDoctor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateDoctorDTO) => apiClient.post("/admin/doctors", data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.doctors.all }),
  });
}
```

---

## TanStack Query Strategy

### Default Config

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime:      30_000,     // 30s — avoid refetch on mount
      gcTime:         5 * 60_000, // 5min — keep in cache
      retry:          2,
      refetchOnWindowFocus: true,
    },
  },
});
```

### Per-Endpoint Stale Times

| Data Type | staleTime | Rationale |
|-----------|-----------|-----------|
| Doctors, Clinics, Specialties | 5 min | Rarely changes |
| Appointment Slots (available) | 30s | Can be booked by others |
| My Appointments | 30s | Status changes by admin/doctor |
| User Profile | 5 min | Rarely changes after registration |
| Admin lists (users, all appts) | 10s | Admin expects fresh data |

### Pagination Strategy

- Use `keepPreviousData: true` for list pages
- Prefetch next page when hovering over "next" button
- Use `placeholderData: keepPreviousData` for smooth transitions

### Mutation Strategy

- Optimistic updates for fast UIs (e.g., booking an appointment)
- Invalidate related queries on success
- Rollback on error with `onError` handler
- Show toast on success/failure

---

## Authentication Architecture

### Custom AuthProvider (No next-auth)

The authentication system uses a custom React Context provider with in-memory access token storage and httpOnly refresh cookie strategy.

```
Storage Strategy:
  Access token  → in-memory (React state) — lost on page refresh
  Refresh token → httpOnly cookie (set by server) — NOT accessible via JS
  Session       → /auth/me call on app load to hydrate AuthProvider
```

### Auth Flow

```
1. User submits login form → POST /auth/login
2. Server returns { accessToken, refreshToken }
   - accessToken stored in-memory via AuthProvider.setState
   - refreshToken stored in httpOnly cookie by backend (Set-Cookie header)
3. API client reads accessToken from AuthProvider context for Authorization header
4. When access token expires (15m):
   a. API client receives 401
   b. 401 interceptor calls POST /auth/refresh (cookie sent automatically)
   c. Server returns new { accessToken }
   d. Retry original request with new access token
   e. If refresh fails → clear user state → redirect /login
```

### Auth Context

```typescript
// providers/auth-provider.tsx
// Custom React Context, provides:
// - user (UserRecord | null)
// - accessToken (string | null)
// - isLoading (initial /me check)
// - login(email, password) — calls API, stores accessToken
// - logout() — calls API, clears state
// - hasPermission(perm: string) — matches RolePermissions
// - isAuthenticated
// - isAdmin / isDoctor / isPatient
```

### Route Protection

Middleware at `src/frontend/middleware.ts`:

```typescript
// Next.js middleware checks httpOnly cookie for presence of refresh token
// 1. Has refresh cookie? → check role from JWT payload (decoded server-side)
// 2. No cookie? → redirect to /login
// 3. Wrong role for route group? → redirect to appropriate dashboard
// Note: Full user state is hydrated client-side via AuthProvider
```

---

## Error Handling Strategy

### Architecture Layers

```
Layer 1: API Client (lib/http/api-client.ts)
  - Checks response.ok
  - Unwraps { success, data, message, errors }
  - Throws typed ApiError with statusCode, message, errors

Layer 2: TanStack Query (features/*/api/use-*.ts)
  - onError handlers show toast
  - Optimistic update rollback

Layer 3: Component (features/*/components/*.tsx)
  - useQuery/useMutation error state
  - Display inline form errors (Zod issues)
  - Show retry buttons

Layer 4: Route Segment (app/*/error.tsx)
  - Catch unexpected errors
  - Show error page with "Try Again"

Layer 5: Global (app/error.tsx, app/global-error.tsx)
  - Top-level error boundary
  - Log to monitoring service
```

### Toast Notifications

| Event | Toast |
|-------|-------|
| Mutation success | Success toast (auto-dismiss 3s) |
| Mutation error | Error toast with message |
| Auth error | Redirect to login |
| Network error | "Connection lost" toast |

### Backend Error Responses to Handle

| Backend Status | Client Handling |
|----------------|----------------|
| 400 Validation | Map Zod issues to form field errors |
| 401 Unauthorized | Redirect to login |
| 403 Forbidden | Show "Access denied" toast |
| 404 Not Found | Show "Resource not found" state |
| 409 Conflict | Show conflict message on form |
| 500 | Show "Something went wrong" toast |

---

## Form Validation Strategy

### Shared Zod Schemas

- Each feature has `schemas/` that mirrors the backend's Zod validation
- Same rules: email, password (8-128), UUID, date format, time format, enums

### React Hook Form + Zod Resolver

```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema } from "@/features/auth/schemas/register-schema";

// Schema matches backend validation exactly
const form = useForm({
  resolver: zodResolver(registerSchema),
});
```

### Error Display

- Zod issues from backend mapped to `form.setError()` for inline display
- Server-side validation errors shown above the form
- Loading state on submit button during mutation

---

## Component Architecture

### Component Hierarchy

```
Page (Server Component)
  └── Layout (Server Component)
        └── Feature Container (Client Component if interactive)
              ├── Data Table (Server Component, uses TanStack Query)
              │     └── Table Row Actions (Client Component)
              ├── Form (Client Component, React Hook Form)
              │     └── Form Fields (shadcn/ui)
              └── Empty State / Loading State / Error State
```

### Data Display Pattern

```typescript
// Server Component — fetches initial data
async function DoctorListPage() {
  const doctors = await apiClient.get("/doctors");
  return <DoctorListClient initialData={doctors} />;
}

// Client Component — handles pagination, search, refetch
function DoctorListClient({ initialData }) {
  const { data, isLoading } = useDoctors(filters, { initialData });
  if (isLoading) return <SkeletonTable />;
  if (!data?.length) return <EmptyState message="No doctors found" />;
  return <DataTable columns={doctorColumns} data={data} />;
}
```

### Shared UI Components (shadcn/ui)

| Component | Usage |
|-----------|-------|
| Button | Actions, form submit |
| Input | Text inputs |
| Select | Dropdowns (enums, filters) |
| Card | Doctor cards, clinic cards |
| Table | DataTables for admin |
| Dialog | Confirmations, forms |
| Sheet | Slide-over panels |
| Tabs | View switching |
| Badge | Status display |
| Skeleton | Loading placeholders |
| Toast | Notifications |

---

## State Management Decisions

| State Type | Solution | Rationale |
|-----------|----------|-----------|
| **Server State** | TanStack Query | Cache, sync, pagination, refetch — covers all API data |
| **Auth State** | AuthProvider (React Context) | In-memory access token, httpOnly refresh cookie, auto-refresh via 401 interceptor |
| **Form State** | React Hook Form | Isolated per form, no global state needed |
| **UI State** | Local `useState` | Tabs, modals, dropdowns — component-scoped |
| **Global UI State** | React Context | Theme, sidebar collapse, app-level settings |
| **URL State** | useSearchParams | Filters, pagination, search queries — shareable/bookmarkable |

### Why No Redux/Zustand

- 95% of state is server data (managed by TanStack Query)
- Remaining 5% is local UI state or URL state
- Redux/Zustand would add unnecessary complexity for this scale

---

## Performance Strategy

- **Server Components** for data-heavy pages (doctor lists, clinic lists)
- **React Suspense** + streaming for progressive rendering
- **Image optimization** with `next/image`
- **Route segment caching** for static public pages
- **Incremental Static Regeneration (ISR)** for doctor profiles if content is mostly static
- **Bundle analysis** via `@next/bundle-analyzer`
- **Dynamic imports** for admin panels (large component trees)

---

## Accessibility & SEO

- All shadcn/ui components are Radix-based with ARIA attributes
- Semantic HTML in layouts (`<nav>`, `<main>`, `<aside>`)
- `next-seo` or built-in `metadata` export for page titles/descriptions
- Skip-to-content link
- Keyboard navigation for data tables
- Color contrast meets WCAG AA
