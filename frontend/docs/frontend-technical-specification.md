# HealthFlow Clinic Booking System — Frontend Technical Specification

**Framework:** Next.js 16.2.11, React 19.2.4  
**Styling:** Tailwind CSS 4  
**Language:** TypeScript 5  
**API Base URL:** `/api/v1`  
**Data Fetching:** TanStack Query (recommended)  
**Form Validation:** Zod (shared via npm workspaces or duplicated schemas)  
**Date:** 2026-07-25  

---

## Table of Contents

1. [Feature Breakdown](#1-feature-breakdown)
2. [Screen Inventory](#2-screen-inventory)
3. [Navigation Flow](#3-navigation-flow)
4. [User Flows](#4-user-flows)
5. [Route Protection Strategy](#5-route-protection-strategy)
6. [Data Fetching Strategy](#6-data-fetching-strategy)
7. [Cache Strategy](#7-cache-strategy)
8. [Form Validation Strategy](#8-form-validation-strategy)
9. [Error Handling Strategy](#9-error-handling-strategy)
10. [Optimistic Update Opportunities](#10-optimistic-update-opportunities)
11. [Prefetch Opportunities](#11-prefetch-opportunities)
12. [API Dependency Map](#12-api-dependency-map)
13. [State Ownership](#13-state-ownership)
14. [Component Ownership](#14-component-ownership)
15. [Reusable Business Components](#15-reusable-business-components)
16. [Feature Dependency Graph](#16-feature-dependency-graph)

---

## 1. Feature Breakdown

### 1.1 Authentication
- Register a new patient account
- Login with email/password
- Refresh access token on 401
- Logout (revoke refresh token)
- Get current user profile (`/auth/me`)
- JWT stored in memory + refresh token in localStorage
- Axios/fetch interceptor appends `Authorization: Bearer <token>` header
- Token refresh interceptor on 401 responses

### 1.2 Patient
- View own patient profile
- Edit own patient profile (name, phone, gender, birthDate)
- View own appointments (past and upcoming)
- Book an appointment (select a slot)
- Cancel own appointment
- View own payments
- Create a payment for an appointment
- Create a review for a completed appointment
- View own reviews

### 1.3 Doctor
- View own schedule (weekly recurring)
- View own appointments (patients assigned to them)
- Cancel an appointment (own patients)
- View reviews left for their appointments

### 1.4 Admin
- CRUD Users (list, view, update role/verification, soft-delete)
- CRUD Clinics
- CRUD Specialties
- CRUD Doctors
- CRUD Doctor Schedules
- CRUD Appointment Slots
- View/Cancel/Update all Appointments
- View/Update/Create Payments
- CRUD Reviews
- View all Patients

### 1.5 Booking
- Browse public clinics
- Browse public specialties
- Browse public doctors (filterable by clinic/specialty)
- View available appointment slots (filter by doctor, date)
- Select a slot → Confirm → Book

### 1.6 Profile
- Patient: view & edit fullName, phone, gender, birthDate
- Doctor: view own schedule
- Universal: email and role are read-only (set at registration/assignment)

---

## 2. Screen Inventory

### 2.1 Landing Page
| Property | Value |
|----------|-------|
| **Purpose** | Public landing / hero page with clinic branding |
| **Route** | `/` |
| **Auth required** | No |
| **Role required** | None |
| **APIs consumed** | None (static/marketing content) |
| **Query parameters** | None |
| **Mutations** | None |
| **Loading state** | None (static page) |
| **Empty state** | N/A |
| **Error state** | N/A |
| **Success state** | Renders hero, features, CTA to register/login |
| **Reusable components** | `Navbar`, `Footer`, `Button`, `HeroSection` |

---

### 2.2 Register
| Property | Value |
|----------|-------|
| **Purpose** | Create a new patient user account |
| **Route** | `/register` |
| **Auth required** | No |
| **Role required** | None |
| **APIs consumed** | `POST /auth/register` |
| **Query parameters** | None |
| **Mutations** | `register(email, password, fullName)` |
| **Loading state** | Spinner on submit button, form disabled |
| **Empty state** | N/A |
| **Error state** | Inline field errors (400), banner for 409 (duplicate email) |
| **Success state** | Redirect to dashboard (role-based) |
| **Reusable components** | `AuthLayout`, `InputField`, `Button`, `FormError`, `PasswordInput` |

---

### 2.3 Login
| Property | Value |
|----------|-------|
| **Purpose** | Authenticate existing user |
| **Route** | `/login` |
| **Auth required** | No |
| **Role required** | None |
| **APIs consumed** | `POST /auth/login` |
| **Query parameters** | Optional `?redirect=` for post-login redirect |
| **Mutations** | `login(email, password)` |
| **Loading state** | Spinner on submit button |
| **Empty state** | N/A |
| **Error state** | Inline error for invalid credentials (401) |
| **Success state** | Redirect to `redirect` param or role-based dashboard |
| **Reusable components** | `AuthLayout`, `InputField`, `Button`, `FormError` |

---

### 2.4 Patient Dashboard
| Property | Value |
|----------|-------|
| **Purpose** | Patient's main view — upcoming appointments, quick actions |
| **Route** | `/dashboard` |
| **Auth required** | Yes |
| **Role required** | `patient` |
| **APIs consumed** | `GET /appointments/mine`, `GET /patients/me` |
| **Query parameters** | None |
| **Mutations** | None (read-only dashboard) |
| **Loading state** | Skeleton cards for appointment list and profile summary |
| **Empty state** | "No upcoming appointments — Book your first appointment" with CTA |
| **Error state** | Error banner with retry |
| **Success state** | Upcoming appointments list + profile summary card |
| **Reusable components** | `AppointmentCard`, `ProfileSummaryCard`, `Skeleton`, `EmptyState`, `ErrorBanner` |

---

### 2.5 Patient Profile
| Property | Value |
|----------|-------|
| **Purpose** | View and edit patient's personal information |
| **Route** | `/profile` |
| **Auth required** | Yes |
| **Role required** | `patient` |
| **APIs consumed** | `GET /patients/me`, `PATCH /patients/me` |
| **Query parameters** | None |
| **Mutations** | `updateMyProfile(fullName?, phone?, gender?, birthDate?)` |
| **Loading state** | Skeleton form fields |
| **Empty state** | N/A (profile always exists after registration) |
| **Error state** | Inline field validation errors, API error banner |
| **Success state** | Success toast + updated fields reflect immediately |
| **Reusable components** | `ProfileForm`, `InputField`, `DatePicker`, `SelectField`, `Button`, `Toast` |

---

### 2.6 Book Appointment
| Property | Value |
|----------|-------|
| **Purpose** | Browse doctors and available slots, book an appointment |
| **Route** | `/book` |
| **Auth required** | Yes |
| **Role required** | `patient` |
| **APIs consumed** | `GET /clinics`, `GET /specialties`, `GET /doctors`, `GET /appointment-slots/available?doctorId=&date=`, `POST /appointments` |
| **Query parameters** | `?clinicId=`, `?specialtyId=`, `?doctorId=`, `?date=` |
| **Mutations** | `bookAppointment(slotId)` |
| **Loading state** | Step loaders: clinics → specialties → doctors → slots |
| **Empty state** | "No doctors available for this filter" or "No slots available on this date" |
| **Error state** | Error per step with retry |
| **Success state** | Confirmation screen with appointment details |
| **Reusable components** | `StepWizard`, `ClinicSelector`, `SpecialtySelector`, `DoctorCard`, `SlotPicker`, `ConfirmDialog`, `AppointmentConfirmation` |

---

### 2.7 Patient Appointments
| Property | Value |
|----------|-------|
| **Purpose** | Full list of patient's appointments with filtering |
| **Route** | `/appointments` |
| **Auth required** | Yes |
| **Role required** | `patient` |
| **APIs consumed** | `GET /appointments/mine` |
| **Query parameters** | None |
| **Mutations** | `cancelMyAppointment(id)` — PATCH `/appointments/mine/:id` |
| **Loading state** | Skeleton list |
| **Empty state** | "No appointments yet" with Book CTA |
| **Error state** | Error banner with retry |
| **Success state** | List of appointments grouped by status (Upcoming / Past) |
| **Reusable components** | `AppointmentCard`, `StatusBadge`, `CancelButton`, `Skeleton`, `EmptyState`, `TabGroup` |

---

### 2.8 Patient Payments
| Property | Value |
|----------|-------|
| **Purpose** | View payment history and pay for appointments |
| **Route** | `/payments` |
| **Auth required** | Yes |
| **Role required** | `patient` |
| **APIs consumed** | `GET /payments/mine`, `POST /payments` |
| **Query parameters** | None |
| **Mutations** | `createPayment(appointmentId, amount, method, transactionReference?)` |
| **Loading state** | Skeleton list |
| **Empty state** | "No payments yet" |
| **Error state** | Error banner |
| **Success state** | List of payments with status badges, "Pay Now" button for unpaid items |
| **Reusable components** | `PaymentCard`, `PaymentForm`, `StatusBadge`, `Button` |

---

### 2.9 Patient Reviews
| Property | Value |
|----------|-------|
| **Purpose** | View and create reviews for completed appointments |
| **Route** | `/reviews` |
| **Auth required** | Yes |
| **Role required** | `patient` |
| **APIs consumed** | `GET /reviews/mine`, `POST /reviews` |
| **Query parameters** | None |
| **Mutations** | `createReview(appointmentId, rating, comment?)` |
| **Loading state** | Skeleton list |
| **Empty state** | "No reviews yet" |
| **Error state** | Error banner |
| **Success state** | List of reviews, "Write a Review" CTA on completed appointments without reviews |
| **Reusable components** | `ReviewCard`, `ReviewForm`, `StarRating`, `Button`, `EmptyState` |

---

### 2.10 Doctor Dashboard
| Property | Value |
|----------|-------|
| **Purpose** | Doctor's main view — today's appointments, schedule overview |
| **Route** | `/dashboard` |
| **Auth required** | Yes |
| **Role required** | `doctor` |
| **APIs consumed** | `GET /appointments/mine`, `GET /doctor-schedules/me` |
| **Query parameters** | None |
| **Mutations** | `cancelMyAppointment(id)` |
| **Loading state** | Skeleton cards |
| **Empty state** | "No appointments scheduled" |
| **Error state** | Error banner with retry |
| **Success state** | Today's appointments list + weekly schedule summary |
| **Reusable components** | `AppointmentCard`, `ScheduleSummary`, `StatusBadge`, `CancelButton` |

---

### 2.11 Doctor Appointments
| Property | Value |
|----------|-------|
| **Purpose** | Full list of doctor's patient appointments |
| **Route** | `/appointments` |
| **Auth required** | Yes |
| **Role required** | `doctor` |
| **APIs consumed** | `GET /appointments/mine`, `PATCH /appointments/mine/:id` |
| **Query parameters** | None |
| **Mutations** | `cancelMyAppointment(id)` |
| **Loading state** | Skeleton list |
| **Empty state** | "No appointments" |
| **Error state** | Error banner |
| **Success state** | Appointment list with patient names, times, status badges |
| **Reusable components** | `AppointmentCard`, `StatusBadge`, `CancelButton` |

---

### 2.12 Doctor Schedule
| Property | Value |
|----------|-------|
| **Purpose** | View own weekly recurring schedule |
| **Route** | `/schedule` |
| **Auth required** | Yes |
| **Role required** | `doctor` |
| **APIs consumed** | `GET /doctor-schedules/me` |
| **Query parameters** | None |
| **Mutations** | None (read-only for doctors) |
| **Loading state** | Skeleton weekly grid |
| **Empty state** | "No schedule defined — contact admin" |
| **Error state** | Error banner |
| **Success state** | Weekly grid showing time blocks per weekday |
| **Reusable components** | `WeeklyCalendar`, `TimeBlock` |

---

### 2.13 Admin Dashboard
| Property | Value |
|----------|-------|
| **Purpose** | Admin overview — quick stats and management links |
| **Route** | `/admin/dashboard` |
| **Auth required** | Yes |
| **Role required** | `admin` |
| **APIs consumed** | None (or aggregate stats if added later) |
| **Query parameters** | None |
| **Mutations** | None |
| **Loading state** | Skeleton stat cards |
| **Empty state** | N/A |
| **Error state** | N/A |
| **Success state** | Navigation cards for each CRUD section |
| **Reusable components** | `StatCard`, `NavCard`, `AdminLayout` |

---

### 2.14 Admin Users
| Property | Value |
|----------|-------|
| **Purpose** | CRUD management of all users |
| **Route** | `/admin/users` |
| **Auth required** | Yes |
| **Role required** | `admin` |
| **APIs consumed** | `GET /admin/users?page=&limit=&role=&isVerified=&search=`, `GET /admin/users/:id`, `PATCH /admin/users/:id`, `DELETE /admin/users/:id` |
| **Query parameters** | `page`, `limit`, `role`, `isVerified`, `search` |
| **Mutations** | `updateUser(id, data)`, `softDeleteUser(id)` |
| **Loading state** | Skeleton table rows |
| **Empty state** | "No users found matching filters" |
| **Error state** | Error banner with retry |
| **Success state** | Paginated table with search, filter, edit, delete actions |
| **Reusable components** | `DataTable`, `SearchInput`, `FilterDropdown`, `Pagination`, `ConfirmDialog`, `UserFormModal` |

---

### 2.15 Admin Clinics
| Property | Value |
|----------|-------|
| **Purpose** | CRUD management of clinics |
| **Route** | `/admin/clinics` |
| **Auth required** | Yes |
| **Role required** | `admin` |
| **APIs consumed** | `GET /clinics`, `GET /clinics/:id`, `POST /admin/clinics`, `PATCH /admin/clinics/:id`, `DELETE /admin/clinics/:id` |
| **Query parameters** | None |
| **Mutations** | `createClinic(data)`, `updateClinic(id, data)`, `deleteClinic(id)` |
| **Loading state** | Skeleton table |
| **Empty state** | "No clinics yet — Create one" |
| **Error state** | Error banner |
| **Success state** | Table with inline edit / modal create |
| **Reusable components** | `DataTable`, `ClinicFormModal`, `ConfirmDialog` |

---

### 2.16 Admin Specialties
| Property | Value |
|----------|-------|
| **Purpose** | CRUD management of medical specialties |
| **Route** | `/admin/specialties` |
| **Auth required** | Yes |
| **Role required** | `admin` |
| **APIs consumed** | `GET /specialties`, `POST /admin/specialties`, `PATCH /admin/specialties/:id`, `DELETE /admin/specialties/:id` |
| **Mutations** | `createSpecialty(name)`, `updateSpecialty(id, name)`, `deleteSpecialty(id)` |
| **Loading/Empty/Error/Success** | Same pattern as Admin Clinics |
| **Reusable components** | `DataTable`, `SpecialtyFormModal`, `ConfirmDialog` |

---

### 2.17 Admin Doctors
| Property | Value |
|----------|-------|
| **Purpose** | CRUD management of doctor profiles |
| **Route** | `/admin/doctors` |
| **Auth required** | Yes |
| **Role required** | `admin` |
| **APIs consumed** | `GET /doctors`, `GET /doctors/:id`, `POST /admin/doctors`, `PATCH /admin/doctors/:id`, `DELETE /admin/doctors/:id` |
| **Query parameters** | None |
| **Mutations** | `createDoctor(data)`, `updateDoctor(id, data)`, `deleteDoctor(id)` |
| **Loading state** | Skeleton table |
| **Empty state** | "No doctors registered" |
| **Error state** | Error banner |
| **Success state** | Table showing doctor name, clinic, specialty, fee |
| **Reusable components** | `DataTable`, `DoctorFormModal`, `ConfirmDialog` |

---

### 2.18 Admin Doctor Schedules
| Property | Value |
|----------|-------|
| **Purpose** | CRUD management of doctor weekly schedules |
| **Route** | `/admin/doctor-schedules` |
| **Auth required** | Yes |
| **Role required** | `admin` |
| **APIs consumed** | `GET /doctor-schedules`, `GET /doctor-schedules/doctor/:doctorId`, `POST /doctor-schedules`, `PATCH /doctor-schedules/:id`, `DELETE /doctor-schedules/:id` |
| **Query parameters** | `?doctorId=` |
| **Mutations** | `createSchedule(data)`, `updateSchedule(id, data)`, `deleteSchedule(id)` |
| **Loading state** | Skeleton weekly grid |
| **Empty state** | "No schedules — Create one" |
| **Error state** | Error banner |
| **Success state** | Weekly calendar grid with schedule blocks per doctor |
| **Reusable components** | `WeeklyCalendar`, `ScheduleFormModal`, `DoctorSelect`, `ConfirmDialog` |

---

### 2.19 Admin Appointment Slots
| Property | Value |
|----------|-------|
| **Purpose** | CRUD management of appointment slots |
| **Route** | `/admin/appointment-slots` |
| **Auth required** | Yes |
| **Role required** | `admin` |
| **APIs consumed** | `GET /admin/appointment-slots`, `GET /admin/appointment-slots/:id`, `POST /admin/appointment-slots`, `PATCH /admin/appointment-slots/:id`, `DELETE /admin/appointment-slots/:id` |
| **Mutations** | `createSlot(data)`, `updateSlot(id, data)`, `deleteSlot(id)` |
| **Loading/Empty/Error/Success** | Same pattern |
| **Reusable components** | `DataTable`, `SlotFormModal`, `ConfirmDialog` |

---

### 2.20 Admin Appointments
| Property | Value |
|----------|-------|
| **Purpose** | View and manage all appointments |
| **Route** | `/admin/appointments` |
| **Auth required** | Yes |
| **Role required** | `admin` |
| **APIs consumed** | `GET /appointments`, `GET /appointments/:id`, `PATCH /appointments/:id`, `DELETE /appointments/:id`, `GET /appointments/patient/:patientId`, `GET /appointments/doctor/:doctorId` |
| **Query parameters** | `?patientId=`, `?doctorId=` |
| **Mutations** | `updateAppointment(id, status?, notes?)`, `deleteAppointment(id)` |
| **Loading state** | Skeleton table |
| **Empty state** | "No appointments" |
| **Error state** | Error banner |
| **Success state** | Filterable table with status badges, inline status change |
| **Reusable components** | `DataTable`, `StatusBadge`, `AppointmentDetailModal`, `ConfirmDialog` |

---

### 2.21 Admin Payments
| Property | Value |
|----------|-------|
| **Purpose** | View and manage all payments |
| **Route** | `/admin/payments` |
| **Auth required** | Yes |
| **Role required** | `admin` |
| **APIs consumed** | `GET /payments`, `GET /payments/:id`, `PATCH /payments/:id`, `DELETE /payments/:id`, `GET /payments/appointment/:appointmentId` |
| **Mutations** | `updatePayment(id, data)`, `deletePayment(id)` |
| **Loading/Empty/Error/Success** | Same pattern |
| **Reusable components** | `DataTable`, `PaymentFormModal`, `ConfirmDialog` |

---

### 2.22 Admin Reviews
| Property | Value |
|----------|-------|
| **Purpose** | View and moderate all reviews |
| **Route** | `/admin/reviews` |
| **Auth required** | Yes |
| **Role required** | `admin` |
| **APIs consumed** | `GET /reviews`, `GET /reviews/:id`, `PATCH /reviews/:id`, `DELETE /reviews/:id` |
| **Mutations** | `updateReview(id, rating?, comment?)`, `deleteReview(id)` |
| **Loading/Empty/Error/Success** | Same pattern |
| **Reusable components** | `DataTable`, `ReviewDetailModal`, `StarRating`, `ConfirmDialog` |

---

### 2.23 Admin Patients
| Property | Value |
|----------|-------|
| **Purpose** | View and manage all patient profiles |
| **Route** | `/admin/patients` |
| **Auth required** | Yes |
| **Role required** | `admin` |
| **APIs consumed** | `GET /patients`, `GET /patients/:id`, `POST /patients`, `PATCH /patients/:id`, `DELETE /patients/:id` |
| **Mutations** | `createPatient(data)`, `updatePatient(id, data)`, `deletePatient(id)` |
| **Loading/Empty/Error/Success** | Same pattern |
| **Reusable components** | `DataTable`, `PatientFormModal`, `ConfirmDialog` |

---

## 3. Navigation Flow

```
/  (Landing)
├── /login
├── /register
│
├── /dashboard  [patient]
│   ├── /appointments
│   ├── /book
│   ├── /payments
│   ├── /reviews
│   └── /profile
│
├── /dashboard  [doctor]
│   ├── /appointments
│   ├── /schedule
│   └── /reviews
│
├── /admin/dashboard  [admin]
│   ├── /admin/users
│   ├── /admin/clinics
│   ├── /admin/specialties
│   ├── /admin/doctors
│   ├── /admin/doctor-schedules
│   ├── /admin/appointment-slots
│   ├── /admin/appointments
│   ├── /admin/payments
│   ├── /admin/reviews
│   └── /admin/patients
```

Layout hierarchy:
- `AuthLayout` — used for `/login`, `/register`
- `AppLayout` — used for all authenticated routes (patient/doctor), contains `Navbar` + `Sidebar`
- `AdminLayout` — used for all admin routes, contains `AdminNavbar` + `AdminSidebar`

---

## 4. User Flows

### 4.1 Patient Registration → Booking
1. Visit `/` → Click "Get Started" → `/register`
2. Fill form (email, password, fullName) → Submit
3. `POST /auth/register` → Receive tokens → Store tokens
4. Auto-redirect to `/dashboard`
5. Dashboard shows empty state → Click "Book Appointment"
6. Navigate to `/book`
7. Select clinic → Select specialty → Select doctor → Select date
8. `GET /appointment-slots/available?doctorId=&date=` → Show available slots
9. Click a slot → Confirm dialog → `POST /appointments { slotId }`
10. Redirect to `/appointments` → See newly booked appointment

### 4.2 Patient Cancellation
1. Navigate to `/appointments`
2. `GET /appointments/mine` → List shows upcoming appointments
3. Click "Cancel" on a `scheduled` or `confirmed` appointment
4. Confirm dialog → `PATCH /appointments/mine/:id`
5. Appointment status updates to `cancelled` → UI updates

### 4.3 Patient Payment
1. Navigate to `/payments`
2. `GET /payments/mine` → See unpaid pending payments
3. Click "Pay Now" → `POST /payments { appointmentId, amount, method }`
4. Payment status shows `pending` → Admin marks `paid`

### 4.4 Patient Review
1. Navigate to `/reviews`
2. `GET /reviews/mine` → See existing reviews + "Write a Review" on completed appointments without reviews
3. Click "Write a Review" → Form with rating (1-5) and optional comment
4. `POST /reviews { appointmentId, rating, comment? }` → Review appears in list

### 4.5 Doctor Appointment Management
1. Login as doctor → Redirect to `/dashboard`
2. `GET /appointments/mine` → See patient appointments
3. Click appointment → View details
4. Click "Cancel" → `PATCH /appointments/mine/:id` → Appointment cancelled

### 4.6 Admin Full CRUD
1. Login as admin → Redirect to `/admin/dashboard`
2. Select entity (e.g., Users) → `/admin/users`
3. `GET /admin/users?page=1&limit=20` → Paginated table
4. Click "Create" → Modal form → `POST /admin/<entity>`
5. Click "Edit" → Modal with pre-filled data → `PATCH /admin/<entity>/:id`
6. Click "Delete" → Confirm dialog → `DELETE /admin/<entity>/:id`

---

## 5. Route Protection Strategy

### Middleware (Next.js middleware.ts)
- Check for access token in `localStorage` (client-side in useEffect) or via a server-side cookie
- Redirect unauthenticated users to `/login?redirect=<currentPath>`
- Redirect authenticated users away from `/login` and `/register` to their dashboard

### Client-Side Protection (Higher-Order Component / Layout)
- `withAuth(Component, allowedRoles?)` — Wraps pages, checks `req.user.role` from JWT
- Redirects to `/login` if unauthenticated
- Redirects to `/dashboard` if role not in `allowedRoles`
- Admin routes check for `role === "admin"`

### Route Map
| Route | Guard | Role |
|-------|-------|------|
| `/`, `/login`, `/register` | Public | None |
| `/dashboard`, `/appointments`, `/book`, `/payments`, `/reviews`, `/profile` | Auth | patient |
| `/dashboard`, `/appointments`, `/schedule`, `/reviews` | Auth | doctor |
| `/admin/*` | Auth | admin |

---

## 6. Data Fetching Strategy

### Library
TanStack Query (React Query) v5 — for all server-state management.

### Fetching Pattern
- Each API call wrapped in a custom hook: `useApi|useQuery|useMutation`
- Axios instance with base URL `/api/v1` and auth interceptor
- Query keys follow pattern: `[entity, ...params]`
  - `["appointments", "mine"]` for `GET /appointments/mine`
  - `["appointments", "admin", { page, limit }]` for `GET /appointments`
  - `["doctors", { clinicId, specialtyId }]` for `GET /doctors`
  - `["slots", "available", { doctorId, date }]` for available slots

### Auth Interceptor
```typescript
// Axios request interceptor
if (accessToken) {
  config.headers.Authorization = `Bearer ${accessToken}`;
}

// Axios response interceptor (401 handling)
if (error.response?.status === 401 && !config._retry) {
  config._retry = true;
  const newTokens = await POST /auth/refresh { refreshToken };
  updateTokens(newTokens);
  config.headers.Authorization = `Bearer ${newTokens.accessToken}`;
  return axios(config);
}
```

---

## 7. Cache Strategy (TanStack Query)

### Stale Times
| Data Type | staleTime | cacheTime | Notes |
|-----------|-----------|-----------|-------|
| Clinics list | 5 min | 30 min | Rarely changes |
| Specialties list | 5 min | 30 min | Rarely changes |
| Doctors list | 2 min | 10 min | Moderate churn |
| Available slots | 30 sec | 2 min | Highly volatile (booking) |
| My appointments | 30 sec | 5 min | Status can change |
| My schedule (doctor) | 5 min | 30 min | Weekly recurring |
| My profile | Infinity | 30 min | Static between edits |
| My payments | 1 min | 5 min | Status changes |
| My reviews | 2 min | 10 min | Moderate |
| Admin lists | 1 min | 5 min | Needs freshness |

### Cache Invalidation
- After `POST /appointments` → invalidate `["appointments"]` and `["slots", "available"]`
- After `PATCH /appointments/mine/:id` → invalidate `["appointments"]`
- After `POST /payments` → invalidate `["payments"]` and `["appointments"]`
- After `POST /reviews` → invalidate `["reviews"]`
- After any admin CRUD mutation → invalidate the corresponding entity list
- After `PATCH /patients/me` → invalidate `["patients", "me"]`

### Query Key Factory
```typescript
export const queryKeys = {
  auth: { me: ["auth", "me"] as const },
  patients: { me: ["patients", "me"] as const, all: (params) => ["patients", "admin", params] as const, byId: (id) => ["patients", id] as const },
  doctors: { all: (filters) => ["doctors", filters] as const, byId: (id) => ["doctors", id] as const },
  clinics: { all: ["clinics"] as const, byId: (id) => ["clinics", id] as const },
  specialties: { all: ["specialties"] as const, byId: (id) => ["specialties", id] as const },
  slots: { available: (params) => ["slots", "available", params] as const, byDoctor: (id) => ["slots", "doctor", id] as const, byDate: (date) => ["slots", "date", date] as const },
  schedules: { me: ["schedules", "me"] as const, byDoctor: (id) => ["schedules", "doctor", id] as const },
  appointments: { mine: ["appointments", "mine"] as const, byPatient: (id) => ["appointments", "patient", id] as const, byDoctor: (id) => ["appointments", "doctor", id] as const },
  payments: { mine: ["payments", "mine"] as const, byAppointment: (id) => ["payments", "appointment", id] as const },
  reviews: { mine: ["reviews", "mine"] as const, byAppointment: (id) => ["reviews", "appointment", id] as const },
  users: { all: (params) => ["users", params] as const, byId: (id) => ["users", id] as const },
};
```

---

## 8. Form Validation Strategy

### Library
Zod — reuse the same validation schemas defined in the backend.

### Pattern
- Each form has a matching Zod schema (mirrored or shared via package)
- React Hook Form + `@hookform/resolvers/zod` for integration
- Validation runs on blur and on submit
- Error messages displayed inline below each field

### Schema Mapping
| Screen | Schema |
|--------|--------|
| Register | `registerSchema` (email, password min 8 max 128, fullName min 1 max 255) |
| Login | `loginSchema` (email, password min 1) |
| Patient Profile | `updatePatientSchema` (fullName min 1 max 255, phone max 50, gender max 20, birthDate YYYY-MM-DD) |
| Book Appointment | `createAppointmentSelfSchema` (slotId UUID) |
| Create Payment | `createPaymentSchema` (appointmentId UUID, amount positive, method enum, status enum optional) |
| Create Review | `createReviewSchema` (appointmentId UUID, rating 1-5, comment max 500 optional) |
| Admin: Clinic | `createClinicSchema` / `updateClinicSchema` |
| Admin: Specialty | `createSpecialtySchema` / `updateSpecialtySchema` |
| Admin: Doctor | `createDoctorSchema` / `updateDoctorSchema` |
| Admin: Schedule | `createDoctorScheduleSchema` / `updateDoctorScheduleSchema` (HH:mm, endTime > startTime) |
| Admin: Slot | `createAppointmentSlotSchema` / `updateAppointmentSlotSchema` |
| Admin: Appointment | `updateAppointmentSchema` |
| Admin: Payment | `createPaymentSchema` / `updatePaymentSchema` |
| Admin: Review | `createReviewSchema` / `updateReviewSchema` |
| Admin: Patient | `createPatientSchema` / `updatePatientSchema` |
| Admin: User | `updateUserSchema` |

### Client-Side Only Validations
- Confirm password field on register (not in API contract — implemented client-side)
- Date picker constraints (no past dates for booking, etc.)
- Debounced email format check on blur

---

## 9. Error Handling Strategy

### Global Error Boundary
- Top-level error boundary in `AppLayout` catches React errors
- Displays "Something went wrong" with retry button

### API Error Handler (hook)
```typescript
function useApiError() {
  // Parses AxiosError into:
  // - 400: show inline field errors from validation
  // - 401: trigger token refresh; if refresh fails → redirect to /login
  // - 403: show "You don't have permission" toast
  // - 404: show "Resource not found" toast or redirect
  // - 409: show "Already exists" toast
  // - 500: show "Server error" toast
}
```

### Per-Screen Error States
- Each data-fetching component renders an `ErrorBanner` on `isError`
- Each mutation shows a `Toast` on error
- Validation errors are inline per field (from Zod)

### Network Offline
- TanStack Query's `networkMode` set to `online`
- Show offline banner when `navigator.onLine === false`

---

## 10. Optimistic Update Opportunities

| Mutation | UI Optimistic Update | Rollback Strategy |
|----------|---------------------|-------------------|
| `cancelMyAppointment(id)` | Immediately set status to `cancelled`, disable cancel button | Revert to previous status on error |
| `updateMyProfile(data)` | Show updated fields immediately | Revert to old values on error |
| `updateAppointment(id, status)` | Update status badge immediately | Revert on error |
| `createReview(data)` | Add review card to list instantly | Remove card on error, show toast |
| Admin: toggle `isVerified` | Flip badge immediately | Revert on error |
| Admin: `deleteClinic(id)` | Remove row from table instantly | Re-insert row on error |

---

## 11. Prefetch Opportunities

| Trigger | Prefetch What | Why |
|---------|---------------|-----|
| Hover on "Book Appointment" CTA | `GET /clinics`, `GET /specialties` | First step of booking flow |
| Focus on doctor selector | `GET /doctors` (with current filters) | Next step |
| Hover on date in slot picker | `GET /appointment-slots/available?doctorId=&date=` | Slots for that date |
| Login page mount (background) | None (no public data needed) | — |
| Dashboard page mount | `GET /appointments/mine`, `GET /patients/me` or `GET /doctor-schedules/me` | Core dashboard data |
| Admin list page mount | First page of data (`page=1`) | Table loads immediately |

---

## 12. API Dependency Map

```
Screen                    → APIs Consumed
─────────────────────────────────────────────────────
Register                  POST /auth/register
Login                     POST /auth/login
Logout                    POST /auth/logout + GET /auth/me
Refresh                   POST /auth/refresh

Patient Dashboard         GET /appointments/mine + GET /patients/me
Patient Appointments      GET /appointments/mine + PATCH /appointments/mine/:id
Patient Profile           GET /patients/me + PATCH /patients/me
Book Appointment          GET /clinics + GET /specialties + GET /doctors + GET /appointment-slots/available + POST /appointments
Patient Payments          GET /payments/mine + POST /payments
Patient Reviews           GET /reviews/mine + POST /reviews

Doctor Dashboard          GET /appointments/mine + GET /doctor-schedules/me
Doctor Appointments       GET /appointments/mine + PATCH /appointments/mine/:id
Doctor Schedule           GET /doctor-schedules/me

Admin Dashboard           N/A (static cards)
Admin Users               GET+POST+PATCH+DELETE /admin/users/*
Admin Clinics             GET+POST+PATCH+DELETE /admin/clinics/*
Admin Specialties          GET+POST+PATCH+DELETE /admin/specialties/*
Admin Doctors             GET+POST+PATCH+DELETE /admin/doctors/*
Admin Schedules           GET+POST+PATCH+DELETE /doctor-schedules/*
Admin Slots               GET+POST+PATCH+DELETE /admin/appointment-slots/*
Admin Appointments        GET+PATCH+DELETE /appointments/*
Admin Payments            GET+PATCH+DELETE /payments/*
Admin Reviews             GET+PATCH+DELETE /reviews/*
Admin Patients            GET+POST+PATCH+DELETE /patients/*
```

---

## 13. State Ownership

| State | Owner Layer | Notes |
|-------|------------|-------|
| Auth tokens | Client (memory + localStorage) | Managed by `useAuth` hook |
| Authenticated user | React Context (`AuthContext`) | Populated from JWT or `/auth/me` |
| TanStack Query cache | Global QueryClient | All server data |
| Form state | React Hook Form (local) | Per component, not global |
| UI state (modals, toasts) | Local component state or context | Toast via `ToastContext` |
| Sidebar collapse | Local state or persisted preference | Per layout |
| Booking wizard step | Local state | Multi-step form state |
| Table filters/sort/pagination | URL search params + Query params | Shareable URLs |
| Theme preference | `localStorage` + `ThemeContext` | System default |

---

## 14. Component Ownership

| Component | Owner/Screen(s) |
|-----------|-----------------|
| `AuthLayout` | Login, Register |
| `AppLayout` | Patient + Doctor screens |
| `AdminLayout` | All admin screens |
| `Navbar` | AppLayout |
| `Sidebar` | AppLayout (role-based links) |
| `AdminSidebar` | AdminLayout |
| `Footer` | Public pages |
| `DataTable` | All admin CRUD list screens |
| `Pagination` | All list screens |
| `SearchInput` | Admin Users |
| `FilterDropdown` | Admin Users |
| `ConfirmDialog` | All delete/cancel actions |
| `FormModal` | All admin CRUD create/edit |
| `InputField` | All forms |
| `PasswordInput` | Register |
| `DatePicker` | Patient Profile, Slot creation |
| `SelectField` | All forms with enums |
| `StarRating` | Review display + form |
| `StatusBadge` | Appointments, Payments |
| `AppointmentCard` | Patient/Doctor appointment lists |
| `DoctorCard` | Booking flow |
| `SlotPicker` | Booking flow (time grid) |
| `StepWizard` | Booking flow |
| `WeeklyCalendar` | Doctor Schedule, Admin Schedules |
| `TimeBlock` | WeeklyCalendar cells |
| `Skeleton` | All loading states |
| `EmptyState` | All empty states |
| `ErrorBanner` | All error states |
| `Toast` | Global notifications |
| `Button` | All actions |
| `HeroSection` | Landing page |
| `ProfileSummaryCard` | Dashboard |
| `AuthGuard` | Route protection HOC |
| `RoleGuard` | Role-based gate |

---

## 15. Reusable Business Components

| Component | Props | Description |
|-----------|-------|-------------|
| `DataTable<T>` | `columns: Column<T>[]`, `data: T[]`, `loading`, `pagination`, `onSort`, `onFilter` | Generic sortable, filterable table with pagination |
| `Pagination` | `page, totalPages, limit, onPageChange` | Page navigation controls |
| `ConfirmDialog` | `open, title, message, onConfirm, onCancel, variant` | Confirmation modal with danger/success variants |
| `FormModal` | `open, title, schema, defaultValues, onSubmit, onClose` | Generic create/edit modal with Zod validation |
| `StatusBadge` | `status: string`, `variantMap: Record<string, string>` | Color-coded status pill (appointment/payment status) |
| `StarRating` | `rating, onChange?, readonly, size` | Interactive or read-only star display |
| `AppointmentCard` | `appointment, onCancel, onPay, onReview, role` | Card showing appointment details with contextual actions |
| `DoctorCard` | `doctor, onSelect, selected` | Doctor profile card with name, specialty, clinic, fee |
| `SlotPicker` | `slots, selectedSlot, onSelect, date` | Time grid of available appointment slots |
| `StepWizard` | `steps: Step[]`, `currentStep`, `onNext`, `onBack` | Multi-step form container with progress indicator |
| `WeeklyCalendar` | `schedules, onEdit, onDelete, editable` | Weekly grid (Sun–Sat) showing time blocks |
| `Skeleton` | `variant: "table" | "card" | "form" | "text"` | Loading placeholder shapes |
| `EmptyState` | `icon, title, description, action?` | Empty list placeholder with optional CTA |
| `ErrorBanner` | `message, onRetry?` | Dismissible error banner with retry |
| `Toast` | (via context) `type: "success" | "error" | "info"`, `message` | Global notification toast |
| `SearchInput` | `value, onChange, placeholder, debounceMs` | Debounced search input |
| `FilterDropdown` | `options, value, onChange, label` | Single-select filter dropdown |
| `SelectField` | `options, value, onChange, error, label` | Form select with validation error |
| `DatePicker` | `value, onChange, min, max, error` | Date input with constraints |
| `TimeBlock` | `startTime, endTime, status, onClick` | Single time range block in a calendar |
| `ProfileSummaryCard` | `patient: PatientRecord \| null` | Name, phone, gender, birthDate summary |
| `PaymentCard` | `payment, onPay?` | Payment details with actions |
| `ReviewCard` | `review, showAppointment?` | Review display with star rating + comment |

---

## 16. Feature Dependency Graph

```
Authentication
  └── Register
  └── Login
  └── AuthGuard (used by all protected features)

Patient Feature
  ├── Dashboard ───────── depends on: auth, appointments, patients
  ├── Appointments ────── depends on: auth, appointments
  ├── Booking ─────────── depends on: auth, clinics, specialties, doctors, slots
  ├── Profile ─────────── depends on: auth, patients
  ├── Payments ────────── depends on: auth, payments, appointments
  └── Reviews ─────────── depends on: auth, reviews, appointments

Doctor Feature
  ├── Dashboard ───────── depends on: auth, appointments, schedules
  ├── Appointments ────── depends on: auth, appointments
  ├── Schedule ────────── depends on: auth, schedules
  └── Reviews ─────────── depends on: auth, reviews

Admin Feature
  ├── Dashboard ───────── (static)
  ├── Users ───────────── depends on: auth, users
  ├── Clinics ─────────── depends on: auth, clinics
  ├── Specialties ─────── depends on: auth, specialties
  ├── Doctors ─────────── depends on: auth, doctors, clinics, specialties, users
  ├── Schedules ───────── depends on: auth, schedules, doctors
  ├── Slots ───────────── depends on: auth, slots, doctors, schedules
  ├── Appointments ────── depends on: auth, appointments, patients, doctors
  ├── Payments ────────── depends on: auth, payments, appointments
  ├── Reviews ─────────── depends on: auth, reviews, appointments
  └── Patients ────────── depends on: auth, patients, users

Shared (no dependencies on other features)
  ├── AuthLayout
  ├── AppLayout
  ├── AdminLayout
  ├── DataTable
  └── UI primitives (Button, Input, etc.)
```