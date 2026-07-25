# Architecture Review Report

**Reviewer:** Principal Frontend Architect  
**Sources:** API Contract (authoritative), Frontend Technical Specification, Frontend Architecture  
**Date:** 2026-07-25

---

## Executive Summary

The architecture document is structurally sound but contains **2 critical**, **2 high**, **2 medium**, and **3 low** issues that must be resolved before implementation. The most severe issues are a **route group collision** between patient and doctor route groups, and a **broken middleware authentication check** that cannot work in the Edge runtime.

---

## 1. Critical Issues

### C1. Route Group Collision — Patient and Doctor Share URL Paths

**Document:** `frontend-architecture.md`, Sections 2 & 3

**Problem:** Both `(patient)` and `(doctor)` route groups define pages for the same URL paths:

| URL Path | patient file | doctor file | Conflict? |
|----------|-------------|-------------|-----------|
| `/dashboard` | `(patient)/dashboard/page.tsx` | `(doctor)/dashboard/page.tsx` | **YES** |
| `/appointments` | `(patient)/appointments/page.tsx` | `(doctor)/appointments/page.tsx` | **YES** |
| `/reviews` | `(patient)/reviews/page.tsx` | `(doctor)/reviews/page.tsx` | **YES** |

Next.js route groups do **not** affect URL paths. They only provide layout scoping. Having two `page.tsx` files resolving to the same URL path will cause a build error.

**API Contract Confirmation:** The backend uses the same URL paths `/appointments/mine`, `/appointments/mine/:id`, `/reviews/mine` for both patient and doctor roles. The differentiation is role-based, not URL-based.

**Fix:** Collapse `(patient)` and `(doctor)` into a single route group (e.g., `(authenticated)`). Use a single `AppLayout` that renders role-specific nav items and role-conditional page content. The page components themselves should delegate to role-specific sub-components based on `useAuth().user.role`.

---

### C2. Middleware Cannot Verify Authentication — No Cookie Mechanism in Contract

**Document:** `frontend-architecture.md`, Section 16 — Route Protection

**Problem:** The architecture described a middleware that checks for a JWT in an `auth_session` cookie. This violates the API Contract in two ways:

1. The API Contract (§1) explicitly states tokens are returned **in the response body**, not as cookies. The contract does **not** define any cookie-based auth mechanism.
2. A client-invented `auth_session` cookie is not documented in the API Contract and constitutes an invented authentication mechanism.

**API Contract Confirmation:** 
- §1: "Access token and refresh token are returned as strings in the response body (not HTTP-only cookies)."
- The contract defines exactly 5 auth endpoints: register, login, refresh, logout, me. No cookie endpoint exists.
- The contract states "Client must store both tokens securely (e.g., localStorage or httpOnly cookie at the proxy level)" — note "at the proxy level" means a reverse proxy could convert the body tokens to cookies, but the frontend itself cannot introduce cookies.

**Root constraint:** Next.js middleware runs on the Edge runtime, which has no access to `localStorage` or JavaScript memory variables. Without a cookie from the backend, the middleware cannot determine authentication state.

**Fix:** 
- Remove all references to `auth_session` cookie or any cookie-based mechanism.
- Remove all middleware-based auth checks.
- Move route protection entirely to client-side `AuthGuard` components.
- Accept the limitation: direct navigation to protected URLs will show a brief layout shell before the client-side guard redirects. This is the standard pattern for JWT-in-response-body apps (used by Vercel, Linear, Stripe).
- Document this limitation explicitly so developers understand why middleware auth is absent.

**Recommended architectural approach (matching the contract exactly):**

| Protection Layer | Mechanism | Where |
|---|---|---|
| Route gating (layout) | `AuthGuard` client component | `(authenticated)/layout.tsx` and `(admin)/layout.tsx` |
| Role gating (page) | Role check in page component | Individual page files |
| API authorization | JWT in `Authorization: Bearer` header | Axios interceptor |
| Session restoration | `POST /auth/refresh` on page load | AuthProvider on mount |
| Token refresh on 401 | Axios response interceptor | `lib/axios.ts` |

---

## 2. High Issues

### H1. Axios Response Interceptor Unwrapping Conflicts with API Functions

**Document:** `frontend-architecture.md`, Section 6

**Problem:** The architecture describes two contradictory unwrapping strategies:

The **interceptor** (section 6, response interceptor success handler):
```
Unwraps response.data (extract .data field from ApiResponse)
```

The **API function** (section 6, code example):
```typescript
const { data } = await api.get("/appointments/mine");
return data.data;  // <-- second unwrap
```

If the interceptor already unwraps `response.data.data` → `response.data`, then `data.data` in the API function receives `undefined`. This will cause silent runtime failures.

Additionally, paginated responses require the full envelope to access `pagination` metadata:
```json
{
  "success": true,
  "data": [...],
  "pagination": { "page": 1, "limit": 20, "total": 100, "totalPages": 5 }
}
```

If the interceptor strips `.data`, the `pagination` field is lost.

**Fix:** Remove the response-success unwrapping from the interceptor. API functions handle their own unwrapping:

```typescript
// API function — correct pattern
export async function getMyAppointments(): Promise<AppointmentRecord[]> {
  const response = await api.get("/appointments/mine");
  return response.data.data;  // response.data = full envelope, .data = inner data
}

export async function getMyAppointmentsPaginated(page: number): Promise<PaginatedResponse<AppointmentRecord>> {
  const response = await api.get("/appointments/mine", { params: { page } });
  return response.data;  // returns the full envelope with .data and .pagination
}
```

The interceptor should **only** handle error responses (401 refresh, 403 toast, etc.) and the request interceptor for auth headers.

---

### H2. `/login` Redirect After Refresh Token Failure Causes Infinite Loop

**Document:** `frontend-architecture.md`, Section 16 — Token Flow (Page Load)

**Problem:** The token flow says:

```
Page Load (existing session)
  → Check localStorage for refreshToken
  → If absent: redirect to /login
```

The middleware ALSO redirects to `/login` when no auth cookie is found. If the middleware redirects to `/login` and the client-side code then checks localStorage and also redirects to `/login`, there is no issue per se. But the middleware fires on **every request**, including the redirect to `/login`. The public routes `/login` and `/register` must be excluded from auth checks.

The architecture correctly lists `/login` and `/register` as public routes in the middleware check, so this is handled. However, the middleware still attempts to check for an auth cookie on the `/login` page itself. If the user has a stale/expired cookie that decodes to a valid-looking JWT but is actually expired, the middleware could redirect them away from `/login` to their dashboard, where the Axios 401 handler would then redirect back to `/login`.

**Fix:** Add explicit logic: if the route is public (`/`, `/login`, `/register`, `/clinics`, `/specialties`, `/doctors`, `/appointment-slots/*`), the middleware should skip all auth checks entirely and allow the request through.

---

## 3. Medium Issues

### M1. `AuthContext.memoryStore` — Interceptor Cannot Access React Context

**Document:** `frontend-architecture.md`, Section 6 — Axios Request Interceptor

**Problem:**
```
Request Interceptor
  └── Reads accessToken from AuthContext.memoryStore
```

The Axios instance is created in `src/lib/axios.ts` — a module-level singleton outside any React component tree. `AuthContext` is a React context created inside `auth-provider.tsx`. The interceptor **cannot** read from React context.

**Fix:** The access token is stored in a **module-level variable** in `src/lib/axios.ts` (or a shared token module). The AuthProvider writes to this variable on login/refresh/logout. The interceptor reads directly from it:

```typescript
// src/lib/token-store.ts (NEW)
let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken(): string | null {
  return accessToken;
}
```

The AuthProvider imports `setAccessToken` and calls it on login/refresh/logout. The interceptor imports `getAccessToken`.

---

### M2. `DoctorFilters` Assume Server-Side Filtering Not Documented in API Contract

**Document:** `frontend-architecture.md`, Section 7 — Query Key Factory

**Problem:**
```
doctors: { all: (filters?: DoctorFilters) => ["doctors", filters] as const, ... }
```

The API contract for `GET /doctors` (Section 13.20) does **not** document any query parameters for filtering. The response returns all doctors. If the frontend passes filter params (e.g., `clinicId`, `specialtyId`) and the backend does not recognize them, they will be silently ignored.

**API Contract Confirmation:** Section 13.20 — no query parameters are documented for `GET /doctors`.

**Fix:** Change the `doctors` query key to not include filters until the API contract documents them. If client-side filtering is needed, the frontend should:
1. Fetch all doctors (public endpoint)
2. Filter client-side using JavaScript's `.filter()` or a `useMemo`

Alternatively, if the backend does support undocumented filter params, the API contract must be updated first. Per the review rules, the API contract is authoritative — do not assume undocumented behavior.

---

## 4. Low Issues

### L1. `useAuth()` Exposes `tokens` to Components

**Document:** `frontend-architecture.md`, Section 8 — useAuth hook return

**Problem:**
```
useAuth() → { user, tokens, login, register, logout, isAuthenticated, isLoading }
```

Exposing `tokens` to components is a security concern. Components should not have direct access to tokens. The tokens are needed only by the Axios interceptor and the auth provider itself.

**Fix:** Remove `tokens` from the `useAuth()` return value. Components needing authorization info use `user.role` and `isAuthenticated`. The AuthProvider internally manages the token store module-level variable.

---

### L2. Reference to HTTP 422 — Not Used by Backend for Validation

**Document:** `frontend-architecture.md`, Sections 6 & 14

**Problem:** The architecture references HTTP 422:
- Section 6: "Status 422/400 → pass validation errors to caller"
- Section 14: "Validation errors (400/422) are mapped to form field errors"

The API contract (Section 3 — Error Status Codes) defines:
- `400` — Bad Request, Invalid input, validation failure, malformed UUID/date
- `422` — Unprocessable Entity (listed but no endpoint uses it for validation)

The backend uses HTTP 400 for **all** validation errors. HTTP 422 is not used anywhere in the contract.

**Fix:** Remove references to 422. All validation errors come as 400.

---

### L3. Missing Query Keys for Admin Operations

**Document:** `frontend-architecture.md`, Section 7 — Query Key Factory

**Problem:** The following admin query keys are missing from the factory but referenced in the Technical Specification:

| Missing Key | API Endpoint | Tech Spec Reference |
|---|---|---|
| `slots.admin` | `GET /admin/appointment-slots` | Admin Appointment Slots screen |
| `payments.admin` | `GET /payments` (admin list) | Admin Payments screen |
| `reviews.admin` | `GET /reviews` (admin list) | Admin Reviews screen |

The `appointments.all` key exists as `["appointments"]`, but the admin-specific slot/payment/review list endpoints lack dedicated keys. Without these keys, cache invalidation for admin mutations may not work correctly.

**Fix:** Add the missing keys:

```typescript
slots: {
  // ... existing keys
  admin: (params?: PaginationParams) => ["slots", "admin", params] as const,
},
payments: {
  // ... existing keys
  admin: (params?: PaginationParams) => ["payments", "admin", params] as const,
},
reviews: {
  // ... existing keys
  admin: (params?: PaginationParams) => ["reviews", "admin", params] as const,
},
```

---

## 5. Issues That Are Correct (No Action Needed)

These areas were reviewed and confirmed consistent with the API Contract:

| Check | Verdict |
|-------|---------|
| Auth endpoint paths (`/auth/register`, `/auth/login`, `/auth/refresh`, `/auth/logout`, `/auth/me`) | Correct |
| Token storage (access in memory, refresh in localStorage) | Matches contract §1: "Client must store both tokens securely (e.g., localStorage...)" |
| Logout sends refresh token in body + auth header | Matches contract §13.4 |
| Refresh sends refresh token in body | Matches contract §13.3 |
| API base path `/api/v1` | Correct |
| Response format `{ success, data, message }` | Correct |
| Pagination format `{ page, limit, total, totalPages }` | Correct |
| Error format `{ success, message, errors }` | Correct |
| Validation error structure `{ code, expected, received, path, message }` | Correct |
| Public endpoints list (clinics, specialties, doctors, slots) | Correct |
| Patient endpoints (appointments, patients/me, payments, reviews) | Correct |
| Doctor endpoints (appointments/mine, schedules/me, reviews/mine) | Correct |
| Admin endpoints (all /admin/* routes) | Correct |
| RBAC matrix integration | Correct |
| UUID format (v4) | Correct |
| Date format (YYYY-MM-DD) | Correct |
| Time format (HH:mm) | Correct |
| Endpoint summary categories (Public, Patient, Doctor, Admin) | Correct |
| No notifications/file-upload features assumed | Correct |
| server-side validation rules for all schemas | Correct |

---

## 6. Summary of Required Changes

| Priority | Issue | Section(s) | Change Required |
|----------|-------|------------|-----------------|
| **CRITICAL** | C1 — Route group collision | 2, 3 | Merge `(patient)` and `(doctor)` into `(authenticated)`; use role-conditional rendering |
| **CRITICAL** | C2 — Middleware cannot auth; cookie violates contract | 16 | Remove cookie, remove middleware auth; protect routes entirely via client-side `AuthGuard`; document the limitation |
| **HIGH** | H1 — Double unwrap conflict | 6 | Remove interceptor unwrapping; API functions handle unwrap |
| **HIGH** | H2 — Redirect loop risk | 16 | AuthProvider handles `isLoading` state; client-side guard shows nothing during loading |
| **MEDIUM** | M1 — Token in React context | 6, 9, 10 | Create module-level `token-store.ts`; interceptor reads from it |
| **MEDIUM** | M2 — DoctorFilters assumption | 7 | Remove filters from doctors query key; use client-side filtering |
| **LOW** | L1 — tokens exposed to components | 8 | Remove `tokens` from `useAuth()` return |
| **LOW** | L2 — 422 reference | 6, 14 | Remove all references to HTTP 422 |
| **LOW** | L3 — Missing admin query keys | 7 | Add `slots.admin`, `payments.admin`, `reviews.admin` keys |

---

## 7. Updated Architecture Document

The corrected architecture document follows below.