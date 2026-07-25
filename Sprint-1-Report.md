# Sprint 1 Report — Foundation: Types, Schemas, and Core Library

**Date:** 2026-07-25
**Status:** COMPLETE

---

## Completed Tasks

| ID | Title | Files Created/Modified |
|----|-------|----------------------|
| S1.1 | Define API envelope types | `src/types/api.ts` |
| S1.2 | Define auth types | `src/types/auth.ts` |
| S1.3 | Define all model types | `src/types/models/*.ts` (10 files) |
| S1.4 | Define enums | `src/types/enums.ts` |
| S1.5 | Define all Zod schemas | `src/schemas/*.ts` (11 files) |
| S1.6 | Implement token store | `src/lib/token-store.ts` |
| S1.7 | Implement Axios instance | `src/lib/axios.ts` |
| S1.8 | Configure QueryClient | `src/lib/query-client.ts` |
| S1.9 | Implement query key factory | `src/lib/query-keys.ts` |
| S1.10 | Implement utility functions | `src/lib/utils.ts` (modified) |
| S1.11 | Create config constants | `src/config/index.ts` |

---

## Files Added (29 new files)

**Types:**
- `src/types/enums.ts` — UserRole, SlotStatus, AppointmentStatus, PaymentMethod, PaymentStatus, SortOrder
- `src/types/api.ts` — ApiResponse, PaginatedResponse, PaginationMeta, ApiError, ValidationError, PaginationParams
- `src/types/auth.ts` — AuthTokens, AuthenticatedUser, LoginRequest, RegisterRequest, RefreshTokenRequest, LogoutRequest
- `src/types/models/user.ts` — UserPublic, UserUpdateRequest, UserFilters
- `src/types/models/patient.ts` — PatientRecord, PatientCreateRequest, PatientUpdateRequest
- `src/types/models/doctor.ts` — DoctorRecord, DoctorCreateRequest, DoctorUpdateRequest
- `src/types/models/clinic.ts` — ClinicRecord, ClinicCreateRequest, ClinicUpdateRequest
- `src/types/models/specialty.ts` — SpecialtyRecord, SpecialtyCreateRequest, SpecialtyUpdateRequest
- `src/types/models/schedule.ts` — DoctorScheduleRecord, CreateDoctorScheduleRequest, UpdateDoctorScheduleRequest
- `src/types/models/slot.ts` — AppointmentSlotRecord, CreateAppointmentSlotRequest, UpdateAppointmentSlotRequest, AvailableSlotsParams
- `src/types/models/appointment.ts` — AppointmentRecord, CreateAppointmentRequest, UpdateAppointmentRequest
- `src/types/models/payment.ts` — PaymentRecord, CreatePaymentRequest, UpdatePaymentRequest
- `src/types/models/review.ts` — ReviewRecord, CreateReviewRequest, UpdateReviewRequest

**Schemas (Zod):**
- `src/schemas/auth.ts` — registerSchema, loginSchema, refreshTokenSchema, logoutSchema
- `src/schemas/patient.ts` — createPatientSchema, updatePatientSchema
- `src/schemas/appointment.ts` — createAppointmentSchema, updateAppointmentSchema
- `src/schemas/payment.ts` — createPaymentSchema, updatePaymentSchema
- `src/schemas/review.ts` — createReviewSchema, updateReviewSchema
- `src/schemas/clinic.ts` — createClinicSchema, updateClinicSchema
- `src/schemas/specialty.ts` — createSpecialtySchema, updateSpecialtySchema
- `src/schemas/doctor.ts` — createDoctorSchema, updateDoctorSchema
- `src/schemas/schedule.ts` — createDoctorScheduleSchema (with endTime > startTime refinement), updateDoctorScheduleSchema
- `src/schemas/slot.ts` — createAppointmentSlotSchema (with endTime > startTime refinement), updateAppointmentSlotSchema
- `src/schemas/user.ts` — updateUserSchema

**Core Library:**
- `src/lib/token-store.ts` — Module-level access token / refresh token holder
- `src/lib/axios.ts` — Axios instance with Bearer token interceptor + 401 refresh queue
- `src/lib/query-client.ts` — TanStack QueryClient with default staleTime/gcTime/retry config
- `src/lib/query-keys.ts` — Query key factory for all entities (including admin keys per L3 fix)

**Config:**
- `src/config/index.ts` — API_BASE_URL, STALE_TIMES, PAGINATION_DEFAULTS

## Files Modified (1 file)

- `src/lib/utils.ts` — Added `formatDate()`, `formatCurrency()`, `formatTime()` functions

---

## Architecture Decisions

1. **Token store as module-level singleton** (M1 fix): Access/refresh tokens stored in a plain module with get/set/clear functions, not React context. This allows the Axios interceptor to read tokens synchronously outside the component tree.

2. **Axios interceptor does NOT unwrap success responses** (H1 fix): The response interceptor passes full `ApiResponse` envelopes through. API functions handle their own unwrapping via `response.data.data`. The error interceptor handles 401 refresh with a queue to prevent concurrent refresh storms.

3. **Route protection via client-side guards** (C2 fix): No middleware auth. All route protection will use client-side `AuthGuard` components in Sprint 2.

4. **No filters in doctors query key** (M2 fix): `queryKeys.doctors.all` has no filter params to avoid assuming undocumented backend filtering.

5. **Admin query keys added** (L3 fix): `slots.admin`, `payments.admin`, `reviews.admin` keys included in query key factory.

---

## Problems Encountered

1. **Next.js build re-adds `.next/dev/types/**/*.ts` to tsconfig**: Each `next build` re-adds the dev types include that we removed in Sprint 0. This is harmless — the regenerated `validator.ts` is now correct. The committed `tsconfig.json` does not include it.

---

## Verification Results

| Check | Result |
|-------|--------|
| `npm run lint` (frontend) | ✅ Passes |
| `npx tsc --noEmit` (frontend) | ✅ Passes |
| `npm run build` (frontend) | ✅ Succeeds (2 static pages) |
| `npm run dev` (frontend) | ✅ HTTP 200 at localhost:3000 |
| `npm run typecheck` (backend) | ✅ Passes |
| `npm run build` (backend) | ✅ Succeeds |

---

## Remaining Risks

- No tests written yet for types/schemas/library modules (Sprint 13)
- Axios refresh interceptor relies on `API_BASE_URL` config; 401 redirect-to-login not wired yet (Sprint 2 AuthProvider)
- Toast/error handling in Axios interceptor will be enhanced in Sprint 2 with the toast system
