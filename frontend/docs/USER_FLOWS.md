# User Flows — Clinic Booking System

---

## Patient Flows

### 1. Registration

**Trigger:** User clicks "Sign Up" or "Register"

**Happy Path:**
```
1. User navigates to /register
2. Sees registration form: email, password, full name
3. Fills in valid data
4. Submits form → POST /api/v1/auth/register
5. Backend creates user (role=patient) + patient profile (transaction)
6. Returns { accessToken, refreshToken }
7. AuthProvider stores access token in-memory, refresh token in httpOnly cookie
8. Redirect to /dashboard (patient home)
9. Toast: "Welcome, {name}!"
```

**Error Cases:**
| Error | Backend | Frontend Behavior |
|-------|---------|-------------------|
| Email taken | 409 Conflict | Inline error on email field: "This email is already registered" |
| Invalid email | 400 (Zod) | Inline error on email field: "Invalid email format" |
| Password too short | 400 (Zod) | Inline error: "Password must be at least 8 characters" |
| Network error | — | Toast: "Connection lost. Please try again." Button to retry |

**Validation Rules (matching backend):**
- email: valid email format
- password: 8-128 characters
- fullName: 1-255 characters

**Permission Restrictions:** None (public endpoint)

---

### 2. Login

**Trigger:** User clicks "Sign In" or is redirected from auth guard

**Happy Path:**
```
1. User navigates to /login
2. Sees login form: email, password
3. Fills in valid credentials
4. Submits → POST /api/v1/auth/login
5. Backend verifies credentials, returns tokens
6. AuthProvider stores access token in-memory, refresh token in httpOnly cookie
7. Redirect to intended page or /dashboard
8. Toast: "Welcome back!"
```

**Error Cases:**
| Error | Backend | Frontend Behavior |
|-------|---------|-------------------|
| Wrong email/password | 401 | Form-level error: "Invalid email or password" |
| Account deactivated | 401 | Form-level error: "Account not found" |
| Network error | — | Toast + retry button |

**Permission Restrictions:** None (public endpoint)

---

### 3. Browse Doctors

**Trigger:** User visits home page or clicks "Find a Doctor"

**Happy Path:**
```
1. User navigates to /doctors (public page, Server Component)
2. Page renders grid of doctor cards with:
   - Name, specialty, clinic, consultation fee
   - Experience years, rating (if available)
3. User scrolls — load more on scroll or pagination
4. User can filter by clinic (dropdown), specialty (dropdown), city
```

**Error Cases:**
| Scenario | Frontend Behavior |
|----------|-------------------|
| Empty doctor list | Empty state: "No doctors available" with CTA to check back later |
| Network error | Error state with "Retry" button |
| Filter returns no results | "No doctors match your filters" with "Clear filters" button |

**Loading State:** Skeleton cards (8 placeholder cards with pulse animation)

**Permission Restrictions:** None (public endpoint)

---

### 4. Search/Filter Doctors

**Trigger:** User uses search bar or filter controls on /doctors

**Happy Path:**
```
1. User types in search field (debounced 300ms)
2. Query params update: /doctors?search=cardio&clinicId=xxx
3. TanStack Query refetches with new filters
4. Results update without full page reload
```

**Filters Available:**
| Filter | Source API | UI Component |
|--------|-----------|--------------|
| Clinic | GET /clinics | Dropdown select |
| Specialty | GET /specialties | Dropdown select |
| City | Derived from /clinics | Dropdown select |
| Search term | Client-side on name/specialty | Text input |

**Error Cases:** Same as Browse Doctors

**Loading State:** Table/cards skeleton, filter controls stay interactive

**Permission Restrictions:** None (public endpoints for doctors, clinics, specialties)

---

### 5. View Doctor Profile

**Trigger:** User clicks on a doctor card

**Happy Path:**
```
1. User navigates to /doctors/:id (Server Component, ISR)
2. Page displays:
   - Doctor name, photo (future), bio
   - Specialty, clinic name, city
   - Consultation fee (formatted: "$150.00")
   - Experience years
   - Available days/times (from GET /doctor-schedules/doctor/:id)
   - Average rating if reviews exist
3. "Book Appointment" button → requires auth
   - If not authenticated → redirect to /login?callback=/doctors/:id
   - If authenticated → push to /book?doctorId=:id
```

**Error Cases:**
| Error | Frontend Behavior |
|-------|-------------------|
| Doctor not found | 404 page: "Doctor not found" with link back to /doctors |
| Network error | Error state with retry |
| No schedule set | "This doctor has not set their schedule yet" notice |

**Permission Restrictions:**
- Profile view: public
- Booking: requires `BOOK_APPOINTMENT` permission (patient role)

---

### 6. View Available Slots

**Trigger:** Patient proceeds to book an appointment

**Happy Path:**
```
1. User on /book?doctorId=xxx (requires auth)
2. Select date from date picker (min: today, max: +30 days)
3. GET /appointment-slots/available?doctorId=xxx&date=2025-01-15
4. Page shows available time slots as a grid/buttons:
   - 09:00 AM, 09:30 AM, 10:00 AM, ...
5. User selects a slot
6. Selected slot highlights, "Confirm Booking" button becomes active
```

**Error Cases:**
| Error | Frontend Behavior |
|-------|-------------------|
| No slots available on selected date | "No available slots for this date" with date picker |
| All slots booked | "Fully booked" message, suggest other dates |
| Network error | Retry button |
| Invalid doctor ID | Error toast |

**Loading State:** Date picker visible, slot area shows skeleton grid

**Empty State:** "No available slots for [date]. Please select another date."

**Permission Restrictions:** Requires authentication (patient role)

---

### 7. Book Appointment

**Trigger:** Patient has selected a slot and clicks "Confirm Booking"

**Happy Path:**
```
1. User reviews booking summary:
   - Doctor name, clinic, date, time, fee
2. User clicks "Confirm Booking"
3. POST /appointments { slotId }
4. Backend: transaction — create appointment + mark slot as booked
5. Response: AppointmentRecord with status "scheduled"
6. Toast: "Appointment booked successfully!"
7. Redirect to /appointments/:id or /appointments
```

**Error Cases:**
| Error | Backend | Frontend Behavior |
|-------|---------|-------------------|
| Slot already booked (conflict) | 409 | "This slot was just booked by someone else" + refresh available slots |
| Patient profile not found | 404 | Toast: "Profile error, please contact support" |
| Network error — request sent | — | Show "Checking..." then verify via GET /appointments/mine |
| Validation error | 400 | Inline form errors |

**Optimistic Update:**
- Immediately show slot as booked (optimistic)
- If server returns error, revert slot to available + show error toast

**Permission Restrictions:** Requires `BOOK_APPOINTMENT` (patient) or `MANAGE_OWN_APPOINTMENTS` (patient)

---

### 8. View Appointments

**Trigger:** Patient clicks "My Appointments"

**Happy Path:**
```
1. User navigates to /appointments
2. GET /appointments/mine (TanStack Query, 30s staleTime)
3. Shows list of appointments with:
   - Doctor name, clinic, date, time
   - Status badge (scheduled/confirmed/completed/cancelled/no_show)
   - Payment status
   - Review status
   - Cancel button (if cancellable)
4. Default sort by date descending
5. Filter tabs: Upcoming | Past | Cancelled
```

**Error Cases:**
| Error | Frontend Behavior |
|-------|-------------------|
| No appointments | Empty state: "No appointments yet" + "Book an Appointment" CTA |
| Network error | Error state + retry |

**Loading State:** Table skeleton

**Empty State:** Empty illustration + "Book your first appointment" button

**Permission Restrictions:** Requires `MANAGE_OWN_APPOINTMENTS` (patient)

---

### 9. Cancel Appointment

**Trigger:** Patient clicks "Cancel" on an appointment

**Happy Path:**
```
1. User clicks "Cancel" on a scheduled/confirmed appointment
2. Confirmation dialog: "Are you sure you want to cancel this appointment?"
3. User confirms
4. PATCH /appointments/mine/:id (no body)
5. Backend: transaction — set status="cancelled", slot="available"
6. Toast: "Appointment cancelled"
7. Appointment status updates to "cancelled" in UI
8. Slot becomes available for other patients
```

**Error Cases:**
| Error | Backend | Frontend Behavior |
|-------|---------|-------------------|
| Past appointment cannot be cancelled | 400 | "This appointment has already passed and cannot be cancelled" |
| Only scheduled/confirmed can be cancelled | 400 | "Appointment cannot be cancelled in its current state" |
| Not your appointment | 403 | Toast: "You don't have permission to cancel this appointment" |
| Network error | 500 | Toast + retry |

**Cancel Conditions:**
- Only appointments with status "scheduled" or "confirmed" can be cancelled
- Past appointments cannot be cancelled by patient
- Cancel button hidden/disabled when not applicable

**Permission Restrictions:** Requires `MANAGE_OWN_APPOINTMENTS`

---

### 10. Make Payment

**Trigger:** Patient clicks "Pay" on an unpaid appointment

**Happy Path:**
```
1. User on /appointments/:id or /payments
2. Sees payment form: amount, method (dropdown), transaction reference (optional)
3. Selects payment method (cash/card/bank_transfer/online)
4. Submits → POST /payments { appointmentId, amount, method }
5. Backend checks: appointment exists, status is not cancelled/completed, ownership
6. Returns PaymentRecord with status="pending"
7. Toast: "Payment recorded"
8. Payment status shown on appointment detail
```

**Error Cases:**
| Error | Backend | Frontend Behavior |
|-------|---------|-------------------|
| Already paid | 409 (unique constraint) | "This appointment is already paid" |
| Cannot pay for cancelled appointment | 400 | "This appointment is cancelled" |
| Cannot pay for completed appointment | 400 | "This appointment is already completed" |
| Amount must be > 0 | 400 | Inline form error |

**Permission Restrictions:** Requires `PAY_APPOINTMENT` or `MANAGE_PAYMENTS`

---

### 11. Leave Review

**Trigger:** Patient clicks "Review" on a completed appointment

**Happy Path:**
```
1. User navigates to /appointments (completed tab)
2. Clicks "Write Review" on a completed, unreviewed appointment
3. Review form: rating (1-5 stars), comment (optional, max 500 chars)
4. Submits → POST /reviews { appointmentId, rating, comment }
5. Backend checks: appointment completed, owned by patient, not already reviewed
6. Returns ReviewRecord
7. Toast: "Review submitted!"
8. UI updates: review shown, "Write Review" button becomes "View Review"
```

**Error Cases:**
| Error | Backend | Frontend Behavior |
|-------|---------|-------------------|
| Already reviewed | 409 | "You've already reviewed this appointment" |
| Not completed | 400 | "You can only review completed appointments" |
| Not your appointment | 403 | Toast: "Permission denied" |

**Permission Restrictions:** Requires `MANAGE_OWN_REVIEWS` (patient)

---

## Admin Flows

### 1. Admin Login

**Trigger:** Admin navigates to /login with admin credentials

**Happy Path:**
```
1. Same login form as patient
2. POST /api/v1/auth/login (credentials have admin role)
3. Backend returns tokens (role = admin in JWT payload)
4. AuthProvider stores access token in-memory, refresh token in httpOnly cookie
5. Middleware detects admin role → redirects to /admin/dashboard
```

**Error Cases:** Same as patient login

**Permission Restrictions:** Admin account must exist (seeded via env vars or manually)

---

### 2. Admin Dashboard

**Trigger:** Admin navigates to /admin

**Happy Path:**
```
1. GET /admin/users, /admin/appointments, /admin/doctors (aggregated stats)
2. Dashboard shows:
   - Total doctors, patients, appointments, revenue
   - Recent appointments
   - Quick action buttons
3. Cards link to respective management pages
```

**Permission Restrictions:** Requires all `MANAGE_*` permissions (admin role)

---

### 3. Doctor Management

**Trigger:** Admin clicks "Doctors" in sidebar

**Happy Path:**
```
1. GET /admin/doctors (TanStack Query, 10s staleTime)
2. DataTable with: name, specialty, clinic, fee, experience, actions
3. Search, filter by clinic/specialty
4. Click "Add Doctor" → dialog/form
   - Select user (must have doctor role)
   - Select clinic, specialty
   - Set fee, bio, experience years
5. Submit → POST /admin/doctors
6. Toast: "Doctor created"
7. Table refreshes
```

**Edit/Delete:**
- Click "Edit" → pre-filled form in dialog/sheet
- Click "Delete" → confirmation → DELETE /admin/doctors/:id → 204
- Cannot delete if appointments exist (DB RESTRICT)

**Permission Restrictions:** Requires `MANAGE_DOCTORS`

---

### 4. Appointment Management

**Trigger:** Admin clicks "Appointments" in sidebar

**Happy Path:**
```
1. GET /appointments (admin)
2. DataTable with: patient, doctor, date, time, status, payment
3. Filter by status, date range, doctor, patient
4. Click appointment → detail view
5. Can update status (scheduled → confirmed → completed)
6. Can cancel appointment (slot released)
```

**Status Change Flow:**
```
1. Admin selects new status from dropdown
2. PATCH /appointments/:id { status }
3. On "cancelled" → slot becomes available
4. On restore from "cancelled" to "scheduled" → slot becomes booked
5. Toast: "Appointment updated"
```

**Permission Restrictions:** Requires `MANAGE_APPOINTMENTS`

---

### 5. User Management

**Trigger:** Admin clicks "Users" in sidebar

**Happy Path:**
```
1. GET /admin/users
2. DataTable: email, role, verified, created, deleted status
3. Filter by role, verified status
4. Click user → edit dialog
5. Can update: email, role, isVerified
6. Can soft-delete user
```

**Soft Delete Flow:**
```
1. Admin clicks "Delete" on user
2. Confirmation: "This will disable the user account. Continue?"
3. Confirms → DELETE /admin/users/:id → 204
4. User shown as deleted (greyed out, "Deleted" badge)
5. Cannot edit or re-delete a soft-deleted user
```

**Permission Restrictions:** Requires `MANAGE_USERS`

---

### 6. Clinic & Specialty Management

**Clinic CRUD:**
1. List → GET /admin/clinics
2. Create → POST /admin/clinics { name, phone, address, city, description }
3. Edit → PATCH /admin/clinics/:id
4. Delete → may fail 409 if doctors assigned (DB RESTRICT)

**Specialty CRUD:**
1. List → GET /admin/specialties
2. Create → POST /admin/specialties { name }
3. Edit → PATCH /admin/specialties/:id { name }
4. Delete → may fail 409 if doctors assigned

**Permission Restrictions:** Requires `MANAGE_CLINICS` / `MANAGE_SPECIALTIES`

---

### 7. Schedule & Slot Management

**Doctor Schedules:**
1. List all schedules → GET /doctor-schedules
2. View by doctor → GET /doctor-schedules/doctor/:doctorId
3. Create → POST /doctor-schedules { doctorId, weekday, startTime, endTime, slotDuration }
4. Edit → PATCH /doctor-schedules/:id
5. Delete → DELETE /doctor-schedules/:id

**Appointment Slots:**
1. List all slots → GET /admin/appointment-slots
2. Create individual slot → POST /admin/appointment-slots
3. View available → GET /admin/appointment-slots/available
4. Soft delete → DELETE /admin/appointment-slots/:id

**Permission Restrictions:** Requires `MANAGE_SCHEDULES` / `MANAGE_SLOTS`

---

## Doctor Flows

### 1. View Own Schedule

**Trigger:** Doctor clicks "My Schedule"

```
1. GET /doctor-schedules/me
2. Shows weekly schedule: days, times, slot duration
3. Read-only view (admin manages schedules)
```

**Permission Restrictions:** Requires `VIEW_OWN_SCHEDULE`

---

### 2. View Assigned Appointments

**Trigger:** Doctor clicks "My Appointments"

```
1. GET /appointments/mine (scoped to doctor's slots)
2. Shows appointments for upcoming days
3. Can cancel own appointments
4. Cannot modify past appointments
```

**Permission Restrictions:** Requires `MANAGE_OWN_APPOINTMENTS` (doctor)
