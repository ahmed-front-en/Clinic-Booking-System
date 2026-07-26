# HealthFlow Clinic Booking System — Frontend Implementation Plan

**Generated from:** API Contract (`api-contract.md`), Frontend Technical Specification (`frontend-technical-specification.md`), Frontend Architecture (`frontend-architecture.md`)  
**Stack:** Next.js 16.2.11 · React 19.2.4 · TypeScript 5 · Tailwind CSS 4 · shadcn/ui · TanStack Query v5 · Axios · React Hook Form · Zod  
**Design:** Stitch "The Luminescent Architect" (Dark · Inter · #6366F1 primary · ROUND_FOUR)  
**Date:** 2026-07-25

---

## Sprint Dependency Graph

```
Sprint 0  (Bootstrap)
   │
Sprint 1  (Foundation Types & Config)
   │
Sprint 2  (Providers & Global Hooks)
   │
Sprint 3  (UI Primitives — shadcn/ui)
   │
   ├──────────────────────────────────────────┐
   │                                          │
Sprint 4  (Layout System & Route Groups)      │
   │                                          │
   ├──────────┬───────────────────┐           │
   │          │                   │           │
Sprint 5  Sprint 6  Sprint 7  Sprint 8        │
(Shared    (Auth &   (Patient  (Booking       │
Business    Public    Core)     Flow)          │
Components  Pages)                             │
   │          │        │         │             │
   ├──────────┴────────┼─────────┤             │
   │                   │         │             │
   │            Sprint 9         │             │
   │            (Patient         │             │
   │             Payments         │             │
   │             & Reviews)       │             │
   │                   │         │             │
   ├───────────────────┴─────────┘             │
   │                                           │
Sprint 10 (Doctor Features)                    │
   │                                           │
Sprint 11 (Admin Features — all 10 CRUDs)      │
   │                                           │
Sprint 12 (Performance & Polish)               │
   │                                           │
Sprint 13 (Testing)                             │
   │                                           │
Sprint 14 (Final QA & Production)              │
   │                                           │
   └───────────────────────────────────────────┘
```

---

## Sprint 0: Project Bootstrap & Development Environment

**Goal:** Initialize the Next.js project, install all dependencies, configure build tools, and establish the folder structure. Every subsequent sprint depends on this.

**Deliverables:** Running Next.js dev server, linter passing, folder scaffold in place.

**Risks:** Version compatibility between Next.js 16, React 19, Tailwind 4, and shadcn/ui. All peer dependencies must match.

**Exit Criteria:** `npm run dev` starts without errors. `npm run lint` passes on empty scaffold. Folder tree matches `frontend-architecture.md`.

| ID | Title | Goal | Dependencies | Files to Create/Modify | Expected Output | Acceptance Criteria | Complexity |
|----|-------|------|--------------|----------------------|-----------------|---------------------|------------|
| S0.1 | Initialize Next.js 16 project | Scaffold the Next.js app with TypeScript | None | `frontend/` (entire project) | `npm run dev` serves a blank page at localhost | `npx next --version` shows 16.2.11 | Low |
| S0.2 | Install all production dependencies | Add React 19, Tailwind 4, shadcn/ui, TanStack Query, Axios, React Hook Form, Zod, lucide-react | S0.1 | `frontend/package.json` | `package.json` contains all dependencies at correct versions | `npm ls` confirms each package | Medium |
| S0.3 | Install all dev dependencies | Add ESLint 9, TypeScript 5, PostCSS, Playwright, Vitest, Storybook, MSW | S0.1 | `frontend/package.json` | `package.json` contains all devDependencies | `npx tsc --version` shows 5.x; `npx eslint --version` shows 9.x | Low |
| S0.4 | Configure TypeScript | Set `@/*` path alias to `src/`, enable strict mode | S0.1 | `tsconfig.json` | Path alias works; strict mode enabled; JSX: preserve | `npx tsc --noEmit` passes on empty files | Low |
| S0.5 | Configure Tailwind CSS v4 | Wire up Tailwind with PostCSS, install `@tailwindcss/postcss` | S0.2, S0.4 | `tailwind.config.ts`, `postcss.config.mjs`, `src/app/globals.css` | Tailwind classes work in dev server | Adding `className="text-red-500"` renders red text | Low |
| S0.6 | Integrate Stitch design tokens | Map all Stitch color tokens to Tailwind theme extend | S0.5 | `tailwind.config.ts` | All Stitch colors available as Tailwind classes (e.g., `bg-surface-container`) | `bg-surface-container` renders `#1c1f2a` | Low |
| S0.7 | Configure ESLint | Add Next.js ESLint config, import order rule | S0.3 | `eslint.config.mjs` | `npm run lint` passes | Linter catches unused imports | Low |
| S0.8 | Create full folder structure | Create all directories from `frontend-architecture.md §1` | S0.1 | All directories under `src/` | Folder tree matches architecture doc exactly | `ls src/app` shows `(public)`, `(authenticated)`, `(admin)` | Low |
| S0.9 | Create `.env.local` and config | Add `NEXT_PUBLIC_API_URL` env var | S0.1 | `.env.local`, `.env.example` | API URL accessible at build-time | `process.env.NEXT_PUBLIC_API_URL` returns the URL | Low |
| S0.10 | Initialize shadcn/ui | Run `npx shadcn@latest init` with dark mode, CSS variables | S0.2, S0.5 | `components.json`, `src/lib/utils.ts`, `src/components/ui/` | shadcn/ui CLI creates base config | `npx shadcn@latest add button` creates button.tsx | Low |

---

## Sprint 1: Foundation — Types, Schemas, and Core Library

**Goal:** Define every TypeScript type, Zod schema, and core library module. This sprint produces zero UI — it is the type and infrastructure foundation every other sprint imports from.

**Deliverables:** All `src/types/`, `src/schemas/`, `src/lib/`, `src/config/` files complete.

**Risks:** Types must exactly match the API Contract response shapes. Any mismatch cascades to all consuming code.

**Exit Criteria:** `npx tsc --noEmit` passes. All types and schemas are importable.

| ID | Title | Goal | Dependencies | Files to Create/Modify | Expected Output | Acceptance Criteria | Complexity |
|----|-------|------|--------------|----------------------|-----------------|---------------------|------------|
| S1.1 | Define API envelope types | Create `ApiResponse<T>`, `PaginatedResponse<T>`, `PaginationMeta`, `ApiError`, `ValidationError` | S0.4 | `src/types/api.ts` | Types match contract §2, §3 formats | `ApiResponse<{id: string}>` compiles | Low |
| S1.2 | Define auth types | Create `AuthTokens`, `AuthenticatedUser`, `LoginRequest`, `RegisterRequest`, `RefreshRequest` | S0.4 | `src/types/auth.ts` | Types match contract §10 and §13.1–13.5 | All auth endpoint request/response types compile | Low |
| S1.3 | Define all model types | Create types for: User, Patient, Doctor, Clinic, Specialty, Schedule, Slot, Appointment, Payment, Review | S0.4 | `src/types/models/*.ts` (10 files) | Each model matches its contract DTO exactly | `UserPublic`, `PatientRecord`, etc. compile | Medium |
| S1.4 | Define enums | Create `UserRole`, `SlotStatus`, `AppointmentStatus`, `PaymentMethod`, `PaymentStatus`, `SortOrder` | S0.4 | `src/types/enums.ts` | Every enum in contract §4 is present | `UserRole.PATIENT` resolves to `"patient"` | Low |
| S1.5 | Define all Zod schemas | Create schemas for auth, patient, appointment, payment, review, clinic, specialty, doctor, schedule, slot, user | S0.4 | `src/schemas/*.ts` (11 files) | Each schema enforces contract §12 validation rules | Zod schema rejects invalid inputs exactly as backend would | Medium |
| S1.6 | Implement token store | Create module-level token holder with get/set/clear functions | S0.4 | `src/lib/token-store.ts` | Access token readable by Axios interceptor synchronously | `getAccessToken()` returns token set by `setAccessToken()` | Low |
| S1.7 | Implement Axios instance | Create Axios instance with baseURL, request interceptor (attach Bearer token), response interceptor (401 refresh, error mapping) | S1.6 | `src/lib/axios.ts` | Authenticated requests include `Authorization: Bearer` header; 401 triggers token refresh | Interceptor reads from token-store; refresh retries original request | Medium |
| S1.8 | Configure QueryClient | Create TanStack Query client with default staleTime, gcTime, retry, networkMode | S0.2 | `src/lib/query-client.ts` | QueryClient matches §7 stale times | `new QueryClient(defaultOptions)` matches architecture doc | Low |
| S1.9 | Implement query key factory | Create `queryKeys` object with all entity keys | S1.1 | `src/lib/query-keys.ts` | Factory matches architecture doc §7 exactly | `queryKeys.appointments.mine` = `["appointments", "mine"]` | Low |
| S1.10 | Implement utility functions | Create `cn()` (clsx+twMerge), `formatDate()`, `formatCurrency()`, `formatTime()` | S0.5 | `src/lib/utils.ts` | Utility functions usable across all components | `cn("px-4", "px-2")` returns `"px-2"` | Low |
| S1.11 | Create config constants | Define `API_BASE_URL`, `STALE_TIMES`, `PAGINATION_DEFAULTS` | S0.9 | `src/config/index.ts` | Centralized constants for all feature modules | `PAGINATION_DEFAULTS.limit` = 20 | Low |

---

## Sprint 2: Providers and Global Hooks

**Goal:** Implement the React context providers and global custom hooks that every page and component depends on.

**Deliverables:** Four providers (Theme, Query, Auth, Toast) and five global hooks.

**Risks:** AuthProvider must exactly match the contract's token storage rules — no cookies, no invented mechanisms. Incorrect auth implementation breaks all protected routes.

**Exit Criteria:** All providers compose correctly in root layout. `useAuth()` returns correct state for authenticated/unauthenticated users.

| ID | Title | Goal | Dependencies | Files to Create/Modify | Expected Output | Acceptance Criteria | Complexity |  
|----|-------|------|--------------|----------------------|-----------------|---------------------|------------|
| S2.1 | Implement ThemeProvider | Read theme from localStorage, set `data-theme` attribute, expose `useTheme()` | S0.1 | `src/providers/theme-provider.tsx` | Dark mode default; toggle persists to localStorage | Theme toggle updates `data-theme` on `<html>` | Low |
| S2.2 | Implement QueryProvider | Create stable QueryClient, enable devtools in dev, set networkMode | S1.8 | `src/providers/query-provider.tsx` | All TanStack Query hooks work inside provider | `useQuery()` in any child component works | Low | 
| S2.3 | Implement AuthProvider | On mount: restore session via `/auth/refresh`, store access token in token-store, refresh token in localStorage, expose `useAuth()` | S1.6, S1.7, S0.2 | `src/providers/auth-provider.tsx` | Auth state restores on page load; login/register/logout work; no cookies used | `useAuth().isAuthenticated` is true after login | High |
| S2.4 | Implement ToastProvider | shadcn/ui toast context with `success`, `error`, `info`, `warning` variants, auto-dismiss 5s, stack max 5 | S3.9 | `src/providers/toast-provider.tsx` | Any component can call `toast()` | `toast({ type: "success", message: "Done" })` shows toast | Low |
| S2.5 | Implement useAuth hook | Consumer hook for AuthContext; returns `{ user, login, register, logout, isAuthenticated, isLoading }` | S2.3 | `src/hooks/useAuth.ts` | Components access auth state without raw tokens | `useAuth().user.role` returns role string | Low |
| S2.6 | Implement useApiError hook | Parse AxiosError: 400→fieldErrors, 401→auth redirect, 403→toast, 404→toast, 409→toast, 500→toast | S1.7 | `src/hooks/useApiError.ts` | Structured error handling for all API errors | `handleError(axiosError)` triggers correct app behavior per status | Medium |
| S2.7 | Implement useDebounce hook | Generic debounce hook with configurable delay | S0.1 | `src/hooks/useDebounce.ts` | Debounces value changes | `useDebounce("search", 300)` updates after 300ms | Low |
| S2.8 | Implement useMediaQuery hook | Reactive CSS media query hook | S0.1 | `src/hooks/useMediaQuery.ts` | Returns true/false for breakpoints | `useMediaQuery("(min-width: 768px)")` matches Tailwind `md` | Low |
| S2.9 | Implement usePagination hook | Pagination state: page, setPage, next, prev, hasNext, hasPrev | S0.1 | `src/hooks/usePagination.ts` | Syncs page state with URL search params | `usePagination(10)` returns `{ page: 1, next: fn, prev: fn }` | Low |

---

## Sprint 3: UI Primitives (shadcn/ui)

**Goal:** Install and customize all shadcn/ui primitives with the Stitch design system tokens. These are the building blocks for every screen.

**Deliverables:** ~20 reusable UI primitives in `src/components/ui/`.

**Risks:** Stitch dark theme tokens must be correctly mapped to shadcn/ui CSS variables. Wrong colors cascade everywhere.

**Exit Criteria:** Each component renders correctly with Stitch dark theme. `npx tsc --noEmit` and `npm run lint` pass.

| ID | Title | Goal | Dependencies | Files to Create/Modify | Expected Output | Acceptance Criteria | Complexity |
|----|-------|------|--------------|----------------------|-----------------|---------------------|------------|
| S3.1 | Add Button primitive | shadcn/ui button with Stitch gradient variant, all sizes/variants | S0.10 | `src/components/ui/button.tsx` | Button renders with Stitch `primary` gradient background | Button supports default, secondary, ghost, destructive variants | Low |
| S3.2 | Add Input primitive | shadcn/ui input with Stitch surface-container-low background | S0.10 | `src/components/ui/input.tsx` | Input renders with Stitch dark field styling | Focus state uses `secondary` (cyan) glow | Low |
| S3.3 | Add Dialog, Select, Command, Popover primitives | Modal dialog, select dropdown, command palette, popover | S0.10 | 4 files in `src/components/ui/` | All interactive overlays with Stitch glassmorphism | Dialog uses `surface-container-highest` at 60% + backdrop-blur | Medium |
| S3.4 | Add Calendar & Popover for DatePicker | Calendar grid component (used in profile form, slot creation) | S0.10 | `src/components/ui/calendar.tsx` | Calendar renders month grid with navigation | Date selection works; Stitch colors applied | Medium |
| S3.5 | Add Table, Badge, Card, Tabs primitives | Data display primitives | S0.10 | 4 files in `src/components/ui/` | Table renders with Stitch surface layers | Badge uses Stitch error/success colors | Low |
| S3.6 | Add Toast primitive | Toast component for notifications | S0.10 | `src/components/ui/toast.tsx` | Toast renders with Stitch surface-container-high | Supports success, error, info, warning variants | Low |
| S3.7 | Add Skeleton primitive | Loading placeholder with Stitch background | S0.10 | `src/components/ui/skeleton.tsx` | Skeleton renders with Stitch surface-container | Animated pulse uses Stitch surface-bright | Low |
| S3.8 | Add Avatar, DropdownMenu, Tooltip primitives | User avatar, context menu, tooltip | S0.10 | 3 files in `src/components/ui/` | All render with Stitch styling | DropdownMenu uses ghost border outline-variant at 15% | Low |
| S3.9 | Add Sheet primitive | Mobile sidebar drawer | S0.10 | `src/components/ui/sheet.tsx` | Sheet slides in from left on mobile | Uses Stitch glassmorphism (blur, surface) | Low |
| S3.10 | Add Separator, Label primitives | Divider and form label | S0.10 | 2 files in `src/components/ui/` | Separator uses outline-variant at 15% opacity | Label uses on-surface-variant color | Low |

---

## Sprint 4: Layout System and Route Groups

**Goal:** Build the three route groups with their layouts, navigation, error boundaries, and loading states. This is the structural skeleton of the application.

**Deliverables:** All `layout.tsx` files, `error.tsx` files, `loading.tsx` files, and navigation components.

**Risks:** AuthGuard in AppLayout/AdminLayout must handle the `isLoading` state correctly to prevent flash of unguarded content.

**Exit Criteria:** Navigating to `/login` shows AuthLayout. Navigating to `/dashboard` (authenticated) shows AppLayout with sidebar. `/admin/*` routes show AdminLayout.

| ID | Title | Goal | Dependencies | Files to Create/Modify | Expected Output | Acceptance Criteria | Complexity |
|----|-------|------|--------------|----------------------|-----------------|---------------------|------------|
| S4.1 | Implement root layout | Compose all providers, set metadata, import globals.css | S2.1–S2.4 | `src/app/layout.tsx` | All providers wrap children; dark mode applies globally | `<html>` has `data-theme="dark"` | Low |
| S4.2 | Implement Navbar | Top navigation bar with logo, user menu (avatar + dropdown), role-based links | S3.1, S3.8 | `src/components/layout/Navbar.tsx` | Navbar shows logo left, user menu right | Unauthenticated shows login CTA; authenticated shows avatar menu | Medium |
| S4.3 | Implement RoleBasedSidebar | Side navigation that renders different links based on user role | S2.5, S3.9 | `src/components/layout/RoleBasedSidebar.tsx` | Patient sees: Dashboard, Appointments, Book, Payments, Reviews, Profile. Doctor sees: Dashboard, Appointments, Schedule, Reviews | Sidebar links match role exactly per spec §3 | Medium |
| S4.4 | Implement AppLayout | Layout for `(authenticated)` group with Navbar + Sidebar + AuthGuard | S4.2, S4.3 | `src/app/(authenticated)/layout.tsx` | Wraps pages with Navbar, Sidebar, `<main>` | AuthGuard redirects to `/login` when unauthenticated | Medium |
| S4.5 | Implement AdminSidebar | Side navigation with all admin CRUD links | S3.1 | `src/components/layout/AdminSidebar.tsx` | Links: Dashboard, Users, Clinics, Specialties, Doctors, Schedules, Slots, Appointments, Payments, Reviews, Patients | Each link matches spec §3 route map | Low |
| S4.6 | Implement AdminNavbar | Top navigation for admin with logo and user menu | S4.2 | `src/components/layout/AdminNavbar.tsx` | Admin-specific top bar | Same pattern as Navbar but admin-branded | Low |
| S4.7 | Implement AdminLayout | Layout for `(admin)` group with AdminNavbar + AdminSidebar + AuthGuard (admin role) | S4.5, S4.6 | `src/app/(admin)/layout.tsx` | Wraps admin pages with admin navigation | AuthGuard rejects non-admin users | Medium |
| S4.8 | Implement AuthLayout | Centered card layout for login/register pages | S3.1 | `src/app/(public)/layout.tsx` | Centered, no sidebar, logo at top | AuthLayout renders LoginForm in center | Low |
| S4.9 | Implement Footer | Simple footer for public pages | S0.1 | `src/components/layout/Footer.tsx` | Footer with copyright | Renders at bottom of public pages | Low |
| S4.10 | Implement global error boundary | Catch-all error page with retry button | S0.1 | `src/app/error.tsx` | "Something went wrong" with retry | Clicking retry re-renders the page | Low |
| S4.11 | Implement route group error boundaries | Per-group error.tsx for public, authenticated, admin | S4.10 | 3 files: `(public)/error.tsx`, `(authenticated)/error.tsx`, `(admin)/error.tsx` | Group-specific error pages | Authenticated error shows sidebar; public error does not | Low |
| S4.12 | Implement loading skeletons | loading.tsx per route group with Skeleton variants | S3.7 | 3 files: `(authenticated)/loading.tsx`, `(admin)/loading.tsx` + feature-specific loading.tsx | Skeleton placeholders for list/form/table pages | Loading page matches target page layout shape | Low |

---

## Sprint 5: Shared Business Components

**Goal:** Build all reusable business components that are consumed by multiple screens. These components encapsulate domain-specific UI patterns.

**Deliverables:** ~18 reusable components in `src/components/business/`, `src/components/data/`, `src/components/feedback/`, `src/components/guards/`.

**Risks:** DataTable generics must be flexible enough for all 10 admin entity types.

**Exit Criteria:** Every component renders in Storybook with mock data. `npx tsc --noEmit` passes.

| ID | Title | Goal | Dependencies | Files to Create/Modify | Expected Output | Acceptance Criteria | Complexity |
|----|-------|------|--------------|----------------------|-----------------|---------------------|------------|
| S5.1 | Implement StatusBadge | Color-coded pill for appointment/payment status | S3.5 | `src/components/business/StatusBadge.tsx` | Badge renders correct color per status (scheduled=bAnd, confirmed, completed=green, cancelled=red, no_show=gray) | `StatusBadge status="completed"` shows green pill | Low |
| S5.2 | Implement StarRating | Interactive/read-only star rating (1-5) | S3.1 | `src/components/business/StarRating.tsx` | Stars highlight on hover (interactive) or display rating (readonly) | Keyboard arrow keys change rating | Medium |
| S5.3 | Implement Skeleton variants | Multi-shape skeleton (card, table, form, text, calendar) | S3.7 | `src/components/feedback/Skeleton.tsx` | `<Skeleton variant="card" />` renders 300×180px placeholder | Each variant matches expected layout | Low |
| S5.4 | Implement EmptyState | Empty placeholder with icon, title, description, optional CTA button | S3.1 | `src/components/feedback/EmptyState.tsx` | "No appointments yet — Book now" with action button | CTA button navigates to correct route | Low |
| S5.5 | Implement ErrorBanner | Dismissible error banner with retry button | S3.1 | `src/components/feedback/ErrorBanner.tsx` | Error message + "Try Again" button | Retry calls onRetry callback | Low |
| S5.6 | Implement ConfirmDialog | Confirmation modal with danger/success variants | S3.3 | `src/components/business/ConfirmDialog.tsx` | "Are you sure?" with Cancel/Confirm buttons | Confirm triggers onConfirm; Escape closes | Medium |
| S5.7 | Implement FormModal | Generic create/edit modal with Zod validation, loading state | S3.3, S1.5 | `src/components/business/FormModal.tsx` | Modal with form fields, submit, cancel | Form validates with Zod before submit | High |
| S5.8 | Implement DataTable | Generic sortable/filterable table with pagination | S3.5 | `src/components/data/DataTable.tsx` | Table renders columns from config, supports sorting, row selection | Clicking column header sorts data | High |
| S5.9 | Implement Pagination | Page navigation: prev, page numbers, next | S3.1 | `src/components/data/Pagination.tsx` | "Prev 1 2 3 ... 10 Next" | Clicking page updates URL and fires onChange | Low |
| S5.10 | Implement SearchInput | Debounced search input with icon | S3.2 | `src/components/data/SearchInput.tsx` | Search input that debounces onChange | `useDebounce` fires after 300ms of inactivity | Low |
| S5.11 | Implement FilterDropdown | Single-select filter dropdown | S3.3 | `src/components/data/FilterDropdown.tsx` | Dropdown with options, current value, onChange | Selecting option updates filter | Low |
| S5.12 | Implement AuthGuard | Client-side route guard — renders nothing while loading, redirects if unauthenticated/wrong role | S2.5, S3.1 | `src/components/guards/AuthGuard.tsx` | Wraps protected content | Unauthenticated → redirect to /login; wrong role → redirect to /dashboard | Medium |
| S5.13 | Implement StepWizard | Multi-step form container with progress indicator, next/back navigation | S3.1 | `src/components/business/StepWizard.tsx` | Step indicator + content area + Next/Back buttons | Current step validated before advancing | Medium |

---

## Sprint 6: Authentication and Public Pages

**Goal:** Build the auth feature module, login page, register page, and landing page. This is the entry point for all users.

**Deliverables:** Auth API functions, auth hooks, auth forms, 3 pages. All users can register and log in.

**Risks:** Token refresh interceptor must handle concurrent 401s correctly (multiple requests failing simultaneously). `_retry` flag prevents infinite loops.

**Exit Criteria:** User can register, log in, see tokens stored in memory + localStorage, navigate to dashboard on success.

| ID | Title | Goal | Dependencies | Files to Create/Modify | Expected Output | Acceptance Criteria | Complexity |
|----|-------|------|--------------|----------------------|-----------------|---------------------|------------|
| S6.1 | Implement auth API functions | `register()`, `login()`, `refresh()`, `logout()`, `getMe()` | S1.7 | `src/features/auth/api/auth.ts` | Each function calls correct endpoint and unwraps response | `login(email, password)` returns `AuthTokens` | Medium |
| S6.2 | Implement auth hooks | `useLogin`, `useRegister`, `useLogout`, `useAuthMe` | S6.1, S2.3, S1.9 | `src/features/auth/hooks/*.ts` (4 files) | Mutations call API, update token-store, update AuthContext | `useLogin()` on success sets auth state and redirects | High |
| S6.3 | Implement LoginForm | Email + password form with Zod validation, submit loading, error display | S3.1, S3.2, S1.5 | `src/features/auth/components/LoginForm.tsx` | Form validates email format, password min 1 chars | Invalid email shows inline error; 401 shows "Invalid credentials" | Medium |
| S6.4 | Implement RegisterForm | Email + password + fullName + confirmPassword form with Zod validation | S3.1, S3.2, S1.5 | `src/features/auth/components/RegisterForm.tsx` | Form validates all fields, confirm password must match | 409 shows "Email already registered" | Medium |
| S6.5 | Build Login page | `/login` page with LoginForm, redirect param support | S6.3, S4.8 | `src/app/(public)/login/page.tsx` | Login form rendered in AuthLayout | Successful login redirects to `?redirect=` or `/dashboard` | Low |
| S6.6 | Build Register page | `/register` page with RegisterForm | S6.4, S4.8 | `src/app/(public)/register/page.tsx` | Register form rendered in AuthLayout | Successful register redirects to `/dashboard` | Low |
| S6.7 | Build Landing page | `/` page with hero, features section, CTA buttons, Navbar + Footer | S4.2, S4.9, S3.1 | `src/app/(public)/page.tsx`, `src/components/business/HeroSection.tsx` | Hero with headline, subtext, "Get Started" and "Login" CTAs | CTA buttons navigate to /register and /login | Medium |
| S6.8 | Create auth barrel export | `features/auth/index.ts` with all exports | S6.1–S6.4 | `src/features/auth/index.ts` | Other features import from `@/features/auth` | `import { useLogin } from "@/features/auth"` works | Low |

---

## Sprint 7: Patient Core Features

**Goal:** Build the patient feature module, patient dashboard, appointments page, and profile page. These are the most frequently used patient screens.

**Deliverables:** Patient, clinics, specialties, doctors, slots, appointments feature modules. 3 pages.

**Risks:** Doctor list has no server-side filtering per contract — client-side filtering by clinic/specialty must be implemented after fetching all doctors.

**Exit Criteria:** Patient can view dashboard with upcoming appointments, view appointment list, view and edit profile.

| ID | Title | Goal | Dependencies | Files to Create/Modify | Expected Output | Acceptance Criteria | Complexity |
|----|-------|------|--------------|----------------------|-----------------|---------------------|------------|
| S7.1 | Implement patient API + hooks | `getMyProfile()`, `updateMyProfile()`, `usePatientProfile`, `useUpdateProfile` | S1.7, S1.9 | `src/features/patients/api/patients.ts`, `src/features/patients/hooks/*.ts` | Profile data fetches from `/patients/me` | `usePatientProfile()` returns patient record | Medium |
| S7.2 | Implement clinics API + hooks | `getClinics()`, `useClinicsList` | S1.7, S1.9 | `src/features/clinics/api/clinics.ts`, `src/features/clinics/hooks/useClinicsList.ts` | Clinics list fetches from `/clinics` | `useClinicsList()` returns clinic array | Low |
| S7.3 | Implement specialties API + hooks | `getSpecialties()`, `useSpecialtiesList` | S1.7, S1.9 | `src/features/specialties/api/specialties.ts`, `src/features/specialties/hooks/useSpecialtiesList.ts` | Specialties list fetches from `/specialties` | `useSpecialtiesList()` returns specialty array | Low |
| S7.4 | Implement doctors API + hooks | `getDoctors()`, `useDoctorsList` (no server filters — client-side filtering) | S1.7, S1.9 | `src/features/doctors/api/doctors.ts`, `src/features/doctors/hooks/useDoctorsList.ts` | Doctors list fetches from `/doctors` | Client-side filter by clinicId/specialtyId works | Medium |
| S7.5 | Implement slots API + hooks | `getAvailableSlots(doctorId, date)`, `useAvailableSlots` | S1.7, S1.9 | `src/features/slots/api/slots.ts`, `src/features/slots/hooks/useAvailableSlots.ts` | Available slots fetch from `/appointment-slots/available` | Query includes doctorId and date params | Low |
| S7.6 | Implement appointment API + hooks (patient) | `getMyAppointments()`, `bookAppointment(slotId)`, `cancelMyAppointment(id)` | S1.7, S1.9 | `src/features/appointments/api/appointments.ts`, `src/features/appointments/hooks/*.ts` | Appointment CRUD functions | `useBookAppointment()` invalidates `["appointments"]` and `["slots", "available"]` | Medium |
| S7.7 | Implement AppointmentCard | Card component for appointment display with status badge, actions per role | S5.1, S3.5, S3.1 | `src/components/business/AppointmentCard.tsx` | Card shows doctor, date, time, status badge, Cancel button | Cancel button shows ConfirmDialog | Medium |
| S7.8 | Implement ProfileSummaryCard | Card showing patient name, phone, gender, birthDate | S3.5 | `src/components/business/ProfileSummaryCard.tsx` | Summary card for dashboard profile section | Shows all 4 fields or null states | Low |
| S7.9 | Build Patient Dashboard | `/dashboard` page: upcoming appointments + profile summary | S7.1, S7.6, S7.8, S4.4 | `src/app/(authenticated)/dashboard/page.tsx` | Dashboard shows appointment list and profile card | Empty state shows "Book your first appointment" with CTA | Medium |
| S7.10 | Build Patient Appointments page | `/appointments` page: full list grouped by Upcoming/Past, cancel action | S7.6, S7.7, S5.4, S5.5, S3.5 | `src/app/(authenticated)/appointments/page.tsx` | Tab group: Upcoming | Past; cancel via ConfirmDialog | Cancel updates appointment optimistically | Medium |
| S7.11 | Implement ProfileForm | FullName, phone, gender (select), birthDate (date picker) form | S3.1, S3.2, S3.4, S1.5 | `src/components/business/ProfileForm.tsx` | Form pre-filled with current values, validates with Zod | Save calls `updateMyProfile()` with optimistic update | Medium |
| S7.12 | Build Patient Profile page | `/profile` page: view/edit patient profile | S7.1, S7.11, S4.4 | `src/app/(authenticated)/profile/page.tsx` | Profile form with loading skeleton, success toast | Updated fields reflect immediately (optimistic) | Low |

---

## Sprint 8: Booking Flow

**Goal:** Build the multi-step booking wizard. This is the most complex user flow — 5 API calls across 4 steps.

**Deliverables:** Book Appointment page with StepWizard, all selectors. Patient can book a complete appointment end-to-end.

**Risks:** Slot availability is highly volatile (30s staleTime). Multiple patients could race for the same slot. The POST /appointments will reject with 409 if the slot is already booked. The UI must handle this gracefully.

**Exit Criteria:** Patient selects clinic → specialty → doctor → date → slot → confirms → appointment created → redirected to appointments page.

| ID | Title | Goal | Dependencies | Files to Create/Modify | Expected Output | Acceptance Criteria | Complexity |
|----|-------|------|--------------|----------------------|-----------------|---------------------|------------|
| S8.1 | Implement ClinicSelector | Clinic selection component (fetches and displays clinic list) | S7.2, S3.3 | `src/components/business/ClinicSelector.tsx` | Dropdown or card list of clinics | Selecting clinic updates booking state | Low |
| S8.2 | Implement SpecialtySelector | Specialty selection component | S7.3, S3.3 | `src/components/business/SpecialtySelector.tsx` | Dropdown or card list of specialties | Selecting specialty updates booking state | Low |
| S8.3 | Implement DoctorCard + DoctorSelect | Doctor card with name, clinic, specialty, fee; selectable | S7.4, S3.5 | `src/components/business/DoctorCard.tsx` | Card shows doctor info; selected state highlighted | Selecting doctor enables slot step | Medium |
| S8.4 | Implement SlotPicker | Time grid of available slots for a doctor+date | S7.5 | `src/components/business/SlotPicker.tsx` | Grid of time blocks; empty state for no slots | Clicking slot selects it; confirm button enabled | High |
| S8.5 | Build Book Appointment page | Multi-step wizard: Clinic → Specialty → Doctor → Date → Slot → Confirm | S5.13, S8.1–S8.4, S7.6 | `src/app/(authenticated)/book/page.tsx` | StepWizard with 4 steps, loading per step, error per step | Complete flow: select → confirm → appointment created | High |
| S8.6 | Implement AppointmentConfirmation | Confirmation screen after successful booking | S7.7, S3.1 | `src/components/business/AppointmentConfirmation.tsx` | Shows appointment details + "View Appointments" CTA | "View Appointments" navigates to `/appointments` | Low |
| S8.7 | Handle 409 slot-already-booked | Catch 409 on POST /appointments, show error toast, refetch slots | S7.6, S2.6 | Update booking page | "This slot was just booked by someone else" toast | Slots refetch automatically | Medium |

---

## Sprint 9: Patient Payments and Reviews

**Goal:** Build the payments and reviews feature modules with their pages.

**Deliverables:** Payments feature module, reviews feature module, 2 pages.

**Risks:** Reviews can only be created for completed appointments. The UI must only show "Write Review" on completed appointments that don't already have a review.

**Exit Criteria:** Patient can view payments, create payment. Patient can view reviews, create review for completed appointment.

| ID | Title | Goal | Dependencies | Files to Create/Modify | Expected Output | Acceptance Criteria | Complexity |
|----|-------|------|--------------|----------------------|-----------------|---------------------|------------|
| S9.1 | Implement payments API + hooks | `getMyPayments()`, `createPayment(data)`, `useMyPayments`, `useCreatePayment` | S1.7, S1.9 | `src/features/payments/api/payments.ts`, `src/features/payments/hooks/*.ts` | Payment endpoints wired | `useCreatePayment()` invalidates `["payments"]` and `["appointments"]` | Medium |
| S9.2 | Implement PaymentCard | Payment card with amount, method, status badge, "Pay Now" button | S5.1, S3.5, S3.1 | `src/components/business/PaymentCard.tsx` | Card shows payment details | "Pay Now" only on pending payments | Low |
| S9.3 | Implement PaymentForm | Form: appointmentId (hidden), amount, method (select), transactionReference (optional) | S3.1, S3.2, S3.3, S1.5 | `src/components/business/PaymentForm.tsx` | Form validates amount > 0, method required | Submit calls `createPayment()` | Medium |
| S9.4 | Build Payments page | `/payments` page: list of payments with Pay Now action | S9.1, S9.2, S9.3 | `src/app/(authenticated)/payments/page.tsx` | Payment history list + Pay Now modal | Pay Now opens PaymentForm modal | Medium |
| S9.5 | Implement reviews API + hooks | `getMyReviews()`, `createReview(data)`, `useMyReviews`, `useCreateReview` | S1.7, S1.9 | `src/features/reviews/api/reviews.ts`, `src/features/reviews/hooks/*.ts` | Review endpoints wired | `useCreateReview()` invalidates `["reviews"]` and `["appointments"]` | Medium |
| S9.6 | Implement ReviewCard | Review display with star rating + comment | S5.2, S3.5 | `src/components/business/ReviewCard.tsx` | Card shows rating stars + comment text | Readonly stars match rating value | Low |
| S9.7 | Implement ReviewForm | Form: rating (star picker), comment (optional, max 500) | S5.2, S3.2, S1.5 | `src/components/business/ReviewForm.tsx` | Star rating interactive + textarea | Submit calls `createReview()` | Medium |
| S9.8 | Build Reviews page | `/reviews` page: existing reviews + "Write Review" on completed appointments without reviews | S9.5–S9.7, S7.6 | `src/app/(authenticated)/reviews/page.tsx` | Review list + "Write Review" CTA | CTA only appears for completed appointments without reviews | Medium |

---

## Sprint 10: Doctor Features

**Goal:** Build the doctor-specific pages: dashboard, appointments, schedule, and reviews. These share the `(authenticated)` route group with patient screens.

**Deliverables:** Doctor Dashboard, Doctor Appointments, Doctor Schedule, Doctor Reviews pages.

**Risks:** Shared routes (`/dashboard`, `/appointments`, `/reviews`) must render doctor content when the logged-in user has role `doctor`. The page components must check `useAuth().user.role`.

**Exit Criteria:** Doctor logs in → sees doctor dashboard with today's appointments and schedule. Can view appointments, cancel them, view schedule, view reviews.

| ID | Title | Goal | Dependencies | Files to Create/Modify | Expected Output | Acceptance Criteria | Complexity |
|----|-------|------|--------------|----------------------|-----------------|---------------------|------------|
| S10.1 | Implement schedule API + hooks (doctor) | `getMySchedule()`, `useMySchedule` | S1.7, S1.9 | `src/features/schedules/api/schedules.ts`, `src/features/schedules/hooks/useMySchedule.ts` | Schedule fetches from `/doctor-schedules/me` | `useMySchedule()` returns schedule entries | Low |
| S10.2 | Implement WeeklyCalendar | Weekly grid (Sun–Sat) showing time blocks per day | S3.1 | `src/components/business/WeeklyCalendar.tsx` | Grid with weekday columns, time block rows | Each schedule entry renders as a TimeBlock | High |
| S10.3 | Implement TimeBlock | Single time range block (e.g., "09:00 – 17:00") | S3.1 | `src/components/business/TimeBlock.tsx` | Colored block with start-end time | Block shows correct time range | Low |
| S10.4 | Build Doctor Dashboard (conditional in `/dashboard`) | Today's appointments + weekly schedule summary | S7.6, S10.1, S7.7, S10.2 | Update `src/app/(authenticated)/dashboard/page.tsx` | Doctor sees today's appointments + schedule summary | Role check renders doctor content inside shared page | Medium |
| S10.5 | Build Doctor Appointments (conditional in `/appointments`) | Full appointment list with patient names, cancel action | S7.6, S7.7 | Update `src/app/(authenticated)/appointments/page.tsx` | Doctor sees patient appointments with cancel | Cancel updates optimistically | Medium |
| S10.6 | Build Doctor Schedule page | `/schedule` page with WeeklyCalendar | S10.1–S10.3 | `src/app/(authenticated)/schedule/page.tsx` | Full weekly view of recurring schedule | Empty state: "No schedule defined — contact admin" | Low |
| S10.7 | Build Doctor Reviews (conditional in `/reviews`) | Reviews left for the doctor's appointments | S9.5, S9.6 | Update `src/app/(authenticated)/reviews/page.tsx` | Doctor sees reviews for their patients | Role check renders doctor review list | Medium |

---

## Sprint 11: Admin Features (All 10 CRUD Screens)

**Goal:** Build all admin CRUD screens. Each screen follows the same pattern: paginated DataTable, Create/Edit FormModal, Delete ConfirmDialog.

**Deliverables:** Admin Dashboard + 10 CRUD screens. Admin user can manage all entities.

**Risks:** Admin screens are the largest surface area. The generic `FormModal` + `DataTable` pattern must be flexible enough to handle all entity types. Domain-specific form fields (e.g., WeeklyCalendar for schedules) require custom components.

**Exit Criteria:** Admin can list, create, edit, and soft-delete every entity. Pagination, search (users), and filters (users) work.

| ID | Title | Goal | Dependencies | Files to Create/Modify | Expected Output | Acceptance Criteria | Complexity |
|----|-------|------|--------------|----------------------|-----------------|---------------------|------------|
| S11.1 | Build Admin Dashboard | `/admin/dashboard` — navigation cards for each CRUD section | S4.7 | `src/app/(admin)/admin/dashboard/page.tsx` | Cards linking to each admin screen | Each card navigates to correct route | Low |
| S11.2 | Build Admin Users | CRUD: DataTable + UserFormModal (email, role, isVerified) + confirm delete | S5.8, S5.6, S5.7, S5.9–S5.11, S1.9 | `src/app/(admin)/admin/users/page.tsx`, `src/features/users/*` | Paginated table with search, filter by role/isVerified | Soft delete sets deletedAt; PATCH updates user | High |
| S11.3 | Build Admin Clinics | CRUD: DataTable + ClinicFormModal (name, phone, address, city, description) | S5.8, S5.6, S5.7, S1.9 | `src/app/(admin)/admin/clinics/page.tsx`, `src/features/clinics/api/clinics-admin.ts` | Table of clinics with create/edit/delete | Hard delete fails 409 if doctors reference clinic | High |
| S11.4 | Build Admin Specialties | CRUD: DataTable + SpecialtyFormModal (name only) | S5.8, S5.6, S5.7, S1.9 | `src/app/(admin)/admin/specialties/page.tsx`, `src/features/specialties/api/specialties-admin.ts` | Table of specialties with create/edit/delete | Hard delete fails 409 if doctors reference specialty | Medium |
| S11.5 | Build Admin Doctors | CRUD: DataTable + DoctorFormModal (userId, clinicId, specialtyId selects, fee, bio, experienceYears) | S11.2–S11.4 | `src/app/(admin)/admin/doctors/page.tsx`, `src/features/doctors/api/doctors-admin.ts` | Table of doctors with clinic/specialty/fee | Create references existing clinic + specialty + user | High |
| S11.6 | Build Admin Doctor Schedules | CRUD: WeeklyCalendar + ScheduleFormModal (doctorId select, weekday, startTime, endTime, slotDuration) | S10.2, S5.8, S5.6, S5.7 | `src/app/(admin)/admin/doctor-schedules/page.tsx`, `src/features/schedules/api/schedules-admin.ts` | Weekly calendar view per doctor | endTime must be > startTime; duplicate weekday+startTime returns 409 | High |
| S11.7 | Build Admin Appointment Slots | CRUD: DataTable + SlotFormModal (doctorId, scheduleId, slotDate, startTime, endTime, status) | S5.8, S5.6, S5.7 | `src/app/(admin)/admin/appointment-slots/page.tsx`, `src/features/slots/api/slots-admin.ts` | Table of slots with date/time/status | Duplicate doctor+date+startTime returns 409 | High |
| S11.8 | Build Admin Appointments | View/Update: DataTable with status badge, AppointmentDetailModal, status change | S5.8, S5.6, S7.7, S5.1 | `src/app/(admin)/admin/appointments/page.tsx`, `src/appointments/api/appointments-admin.ts` | Table of all appointments, filter by patient/doctor | PATCH updates status or notes | High |
| S11.9 | Build Admin Payments | View/Update: DataTable + PaymentFormModal, status change | S5.8, S5.6, S9.3 | `src/app/(admin)/admin/payments/page.tsx`, `src/features/payments/api/payments-admin.ts` | Table of all payments | Admin can mark paid/failed/refunded | Medium |
| S11.10 | Build Admin Reviews | View/Delete: DataTable + ReviewDetailModal, moderation | S5.8, S5.6, S9.6 | `src/app/(admin)/admin/reviews/page.tsx`, `src/features/reviews/api/reviews-admin.ts` | Table of all reviews | Admin can update rating/comment or delete | Medium |
| S11.11 | Build Admin Patients | CRUD: DataTable + PatientFormModal (userId, fullName, phone, gender, birthDate) | S5.8, S5.6, S5.7, S7.1 | `src/app/(admin)/admin/patients/page.tsx`, `src/features/patients/api/patients-admin.ts` | Table of patient profiles | Create references existing user; fullName required | Medium |

---

## Sprint 12: Performance Optimization and Polish

**Goal:** Optimize bundle size, rendering performance, and loading states. No new features.

**Deliverables:** Dynamic imports implemented, memoization applied, prefetching added, performance audit complete.

**Risks:** Premature optimization. Only apply patterns that have measurable impact.

**Exit Criteria:** Lighthouse performance score > 90. No unnecessary re-renders in component tree.

| ID | Title | Goal | Dependencies | Files to Create/Modify | Expected Output | Acceptance Criteria | Complexity |
|----|-------|------|--------------|----------------------|-----------------|---------------------|------------|
| S12.1 | Implement dynamic imports | Add `next/dynamic` for SlotPicker, DataTable, WeeklyCalendar, ReviewForm, PaymentForm, modals | S8.4, S5.8, S10.2, S9.7, S9.3 | Update page files consuming heavy components | Heavy components load only when needed | SlotPicker not in initial bundle | Medium |
| S12.2 | Apply React.memo | Memoize DataTable rows, AppointmentCard, DoctorCard, list items | S7.7, S8.3, S5.8 | Update component files | Components only re-render when props change | verify with React DevTools profiler | Medium |
| S12.3 | Apply useMemo/useCallback | Memoize computed values (filtered doctors, sorted appointments) and callbacks | All page and component files | Update relevant files | Expensive computations cached | useCallback prevents child re-renders | Medium |
| S12.4 | Implement prefetching | Add `queryClient.prefetchQuery` for hover triggers and page-mounted prefetches | S7.2, S7.3, S7.4, S7.6 | Update dashboard, booking, admin list pages | Clinics/specialties prefetch on "Book" CTA hover | Network tab shows prefetch on hover | Medium |
| S12.5 | Implement optimistic updates | Cancel appointment, profile update, admin toggle isVerified, admin delete clinic | S7.6, S7.1, S11.2 | Update relevant mutation hooks | UI updates instantly; reverts on error | verify rollback on API error | High |
| S12.6 | Optimize images | Add `next/image` with priority/lazy, blur placeholders, explicit dimensions | S6.7, S8.3 | Landing page, DoctorCard | Images load with proper optimization | LCP under 2.5s | Low |
| S12.7 | Font optimization | Load Inter via `next/font` with `display: swap` | S0.1 | `src/app/layout.tsx` | Inter loads with swap strategy | No layout shift from font loading | Low |
| S12.8 | Audit code splitting | Verify route groups split correctly, no large shared chunks | All page files | Review build output | Admin routes do not include patient components | `next build` output shows separate chunks per route group | Low |

---

## Sprint 13: Testing

**Goal:** Achieve the coverage targets defined in the architecture doc.

**Deliverables:** Unit tests, component tests, integration tests, E2E tests, Storybook stories.

**Risks:** MSW handlers must exactly match the API Contract — any discrepancy causes false test failures.

**Exit Criteria:** Coverage meets targets: schemas 100%, utils 100%, hooks 90%, business components 80%, pages 70%.

| ID | Title | Goal | Dependencies | Files to Create/Modify | Expected Output | Acceptance Criteria | Complexity |
|----|-------|------|--------------|----------------------|-----------------|---------------------|------------|
| S13.1 | Configure test environment | Set up Vitest, Testing Library, MSW, Playwright, Storybook | S0.3 | `vitest.config.ts`, `playwright.config.ts`, `.storybook/` | All test frameworks run | `npx vitest run` passes; `npx playwright test` runs | Medium |
| S13.2 | Set up test utilities | Create `test-utils/query-wrapper.tsx`, `msw-handlers.ts`, `render-with-providers.tsx`, `mock-data.ts` | S13.1 | `src/test-utils/*.ts` (4 files) | MSW handlers match all contract endpoints | All API endpoints have mock handlers | High |
| S13.3 | Test Zod schemas | Validate every schema with valid/invalid inputs | S1.5 | Co-located `*.test.ts` for each schema file | Each schema rejects invalid data with correct error messages | 100% coverage for all schemas | Medium |
| S13.4 | Test utility functions | Test `cn`, `formatDate`, `formatCurrency`, `formatTime` | S1.10 | `src/lib/utils.test.ts` | All edge cases handled | 100% coverage | Low |
| S13.5 | Test custom hooks | Test useAuth, useApiError, useDebounce, useMediaQuery, usePagination | S2.5–S2.9 | Co-located `*.test.ts` for each hook | Hooks return correct values in mocked context | 90% coverage | Medium |
| S13.6 | Test API functions | Test every API function with mocked Axios | S6.1, S7.1–S7.6, S9.1, S9.5, S10.1 | Co-located `*.test.ts` for each API file | Functions return unwrapped data | 90% coverage | Medium |
| S13.7 | Test business components | Component tests for DataTable, AppointmentCard, DoctorCard, SlotPicker, StarRating, StatusBadge, AuthGuard | S5.1–S5.13 | Co-located `*.test.tsx` for each component | Components render all states (loading, empty, error, success) | 80% coverage | High |
| S13.8 | Test guards | AuthGuard tests: authenticated, unauthenticated, wrong role, loading state | S5.12 | `src/components/guards/AuthGuard.test.tsx` | Guard redirects correctly in each scenario | All 4 auth states tested | Medium |
| S13.9 | Test form components | LoginForm, RegisterForm, ProfileForm, ReviewForm, PaymentForm | S6.3–S6.4, S7.11, S9.7, S9.3 | Co-located `*.test.tsx` | Forms validate and submit correctly | Validation errors display inline | Medium |
| S13.10 | Integration tests | Auth flow (register → dashboard), Booking flow (select → confirm) | All feature modules | `__tests__/integration/*.integration.test.ts` | Complete user flows succeed with MSW | End-to-end flow without network | High |
| S13.11 | E2E tests | 10 critical paths: register, book, cancel, payment, review, doctor cancel, admin CRUD, auth edge cases | All pages | `e2e/*.spec.ts` | Playwright tests pass against dev server | All critical paths covered | High |
| S13.12 | Storybook setup | Stories for all business components + layouts + feedback components | S5.1–S5.13, S4.2–S4.9 | `src/**/*.stories.tsx` (co-located) | Every component has stories for all states | Each story shows component in default/loading/empty/error state | Medium |

---

## Sprint 14: Final QA and Production Readiness

**Goal:** Final review, accessibility audit, security check, production build verification.

**Deliverables:** Production build passing, Lighthouse scores documented, a11y audit complete.

**Risks:** Last-minute issues found during QA must be triaged by severity. Critical issues block release.

**Exit Criteria:** `npm run build` passes. Lighthouse > 90 on all categories. No critical a11y violations.

| ID | Title | Goal | Dependencies | Files to Create/Modify | Expected Output | Acceptance Criteria | Complexity |
|----|-------|------|--------------|----------------------|-----------------|---------------------|------------|
| S14.1 | Accessibility audit | Run axe DevTools, fix violations, verify keyboard navigation, focus management, screen reader support | All components | Update components with a11y fixes | WCAG 2.2 AA compliant | No critical/serious violations | Medium |
| S14.2 | Keyboard navigation audit | Verify Tab order, focus trapping in modals, Escape to close, arrow keys in Select/Calendar | S3.3, S3.4, S5.6, S5.7 | Update interactive components | Every interactive element reachable by keyboard | Tab order follows visual order | Medium |
| S14.3 | Screen reader audit | Verify aria-labels, aria-describedby, role attributes, live regions | All components | Update components with ARIA fixes | Screen reader announces content correctly | Loading/error/success states announced | Medium |
| S14.4 | Security review | Verify token storage (no XSS exposure), no raw token leakage, logout clears all state | S1.6, S1.7, S2.3 | Review token-store, axios, auth-provider | No security vulnerabilities | Tokens not accessible from components | Medium |
| S14.5 | Mobile responsiveness audit | Verify layouts at 375px, 768px, 1024px, 1440px | All layout components | Update responsive styles | No layout breakage at any breakpoint | Sidebar collapses to Sheet on mobile | Medium |
| S14.6 | Production build verification | Run `next build`, verify no errors, check bundle sizes | All files | None (build output review) | Build succeeds; chunk sizes within limits | `next build` exit code 0 | Low |
| S14.7 | Cross-browser testing | Verify in Chrome, Firefox, Safari, Edge | All pages | None (manual QA) | All features work in all browsers | No JS errors in console | Low |
| S14.8 | README and documentation | Update README with setup instructions, environment variables, architecture links | All docs | `README.md` | Developer can clone and run project from README | Instructions include every step | Low |

---

## Milestone Roadmap

```
Sprint 0   │ Bootstrap & Dev Env          │ Week 1
           │                               │
Sprint 1   │ Foundation Types & Core Lib   │ Week 2
           │                               │
Sprint 2   │ Providers & Global Hooks      │ Week 2
           │                               │
Sprint 3   │ UI Primitives (shadcn/ui)     │ Week 3
           │                               │
Sprint 4   │ Layout System & Route Groups  │ Week 3
           │                               │
Sprint 5   │ Shared Business Components    │ Week 4
           │                               │
Sprint 6   │ Auth & Public Pages           │ Week 4-5
           │                               │
           ├── MILESTONE 1 ────────────────┤
           │   Working auth + landing      │
           │   Login/register flows        │
           │   All layouts render          │
           │   All shared components built │
           │                               │
Sprint 7   │ Patient Core Features         │ Week 5-6
           │                               │
Sprint 8   │ Booking Flow                  │ Week 6-7
           │                               │
Sprint 9   │ Patient Payments & Reviews    │ Week 7
           │                               │
           ├── MILESTONE 2 ────────────────┤
           │   Complete patient journey    │
           │   Book → Pay → Review         │
           │   Dashboard + Profile         │
           │                               │
Sprint 10  │ Doctor Features               │ Week 8
           │                               │
Sprint 11  │ Admin Features (all CRUD)     │ Week 9-11
           │                               │
           ├── MILESTONE 3 ────────────────┤
           │   All roles working           │
           │   Patient + Doctor + Admin    │
           │   All CRUD screens complete   │
           │                               │
Sprint 12  │ Performance Optimization      │ Week 12
           │                               │
Sprint 13  │ Testing                       │ Week 13-14
           │                               │
Sprint 14  │ Final QA & Production         │ Week 15
           │                               │
           ├── MILESTONE 4 ────────────────┤
           │   Production ready            │
           │   All tests passing           │
           │   Lighthouse > 90             │
           │   WCAG 2.2 AA compliant       │
           │                               │
```

## Sprint Dependency Summary

```
Sprint 0 │── No deps (bootstrap)
Sprint 1 │── Sprint 0
Sprint 2 │── Sprint 1
Sprint 3 │── Sprint 0
Sprint 4 │── Sprint 2, Sprint 3
Sprint 5 │── Sprint 3
Sprint 6 │── Sprint 1, Sprint 2, Sprint 3, Sprint 4
Sprint 7 │── Sprint 1, Sprint 5, Sprint 6
Sprint 8 │── Sprint 5, Sprint 7
Sprint 9 │── Sprint 5, Sprint 7
Sprint 10│── Sprint 5, Sprint 7, Sprint 9
Sprint 11│── Sprint 1, Sprint 4, Sprint 5, Sprint 7, Sprint 10
Sprint 12│── Sprint 4–Sprint 11
Sprint 13│── Sprint 4–Sprint 11
Sprint 14│── Sprint 12, Sprint 13
```

## Total Task Summary

| Sprint | Tasks | Low | Medium | High | Key Deliverables |
|--------|-------|-----|--------|------|------------------|
| 0 | 10 | 9 | 1 | 0 | Project scaffold, all deps, folder tree |
| 1 | 11 | 6 | 4 | 1 | All types, schemas, lib modules |
| 2 | 9 | 6 | 2 | 1 | All providers, all global hooks |
| 3 | 10 | 7 | 3 | 0 | 20 shadcn/ui primitives with Stitch theme |
| 4 | 12 | 5 | 4 | 3 | All layouts, nav, error boundaries, loading |
| 5 | 13 | 7 | 4 | 2 | StatusBadge, DataTable, AuthGuard, FormModal, etc. |
| 6 | 8 | 3 | 3 | 2 | Login, Register, Landing pages; auth hooks |
| 7 | 12 | 4 | 5 | 3 | Patient Dashboard, Appointments, Profile |
| 8 | 7 | 2 | 2 | 3 | Booking wizard (most complex flow) |
| 9 | 8 | 3 | 4 | 1 | Payments, Reviews pages |
| 10 | 7 | 3 | 2 | 2 | Doctor Dashboard, Appointments, Schedule |
| 11 | 11 | 1 | 4 | 6 | All 10 admin CRUD screens |
| 12 | 8 | 2 | 5 | 1 | Dynamic imports, memo, prefetch, optimizations |
| 13 | 12 | 1 | 5 | 6 | Full test suite, Storybook |
| 14 | 8 | 6 | 2 | 0 | a11y audit, security review, production build |
| **Total** | **146** | **65** | **50** | **31** | — |

## Implementation Rules

1. **No task starts until all its dependencies are complete.** The dependency column lists task IDs that must be done first.
2. **Test-driven changes:** Every implementation task in Sprint 7+ must have its corresponding test task in Sprint 13 planned for the same component. Write tests at the same time or immediately after.
3. **Type-first:** Always define or import types before writing runtime code. Types are the source of truth from the API Contract.
4. **Architecture compliance:** Every file must follow the naming conventions from the architecture doc §12. Every import must follow §13.
5. **No invented auth mechanisms:** Token storage follows the contract exactly — access token in memory (token-store), refresh token in localStorage. No cookies. No new headers. No new flows.