# API Specification — Clinic Booking System

> Frontend-focused API reference. All endpoints under `/api/v1`. Base URL configurable via `NEXT_PUBLIC_API_URL`.

---

## Architecture Summary

**Layered Modular** (Express 5 + TypeScript 7) — Controller → Service → Repository → PostgreSQL 17 via raw SQL. **Zod 4** validates all request bodies. **JWT** (access + refresh) with bcrypt password hashing. **RBAC** with 3 roles (`patient`, `doctor`, `admin`) mapped to granular permissions. All queries parameterized. Transactions on multi-table writes.

---

## Authentication

### Header Format
```
Authorization: Bearer <accessToken>
```

### Token Payload (decoded)
```json
{ "sub": "uuid", "role": "patient" }
```

### Endpoints Not Requiring Auth
| Route | Reason |
|-------|--------|
| `POST /auth/register` | Registration |
| `POST /auth/login` | Login |
| `POST /auth/refresh` | Token refresh |
| `GET /doctors`, `GET /doctors/:id` | Public doctor listing |
| `GET /clinics`, `GET /clinics/:id` | Public clinic listing |
| `GET /specialties`, `GET /specialties/:id` | Public specialty listing |
| `GET /appointment-slots/available` | Public available slots |
| `GET /appointment-slots/doctor/:doctorId` | Public slots by doctor |
| `GET /appointment-slots/date/:slotDate` | Public slots by date |

### Auth Required Endpoints
All others. Use `authenticate` middleware (401 on missing/invalid token). Some require additional `authorize(PERMISSION)` (403 on insufficient permissions).

---

## Response Envelope

### Success (200/201)
```json
{ "success": true, "data": { ... }, "message": "optional" }
```

### Paginated
```json
{ "success": true, "data": [ ... ], "pagination": { "page": 1, "limit": 20, "total": 100, "totalPages": 5 } }
```

### Error
```json
{ "success": false, "message": "reason", "errors": [ ... ] }
```

### Status Codes
| Code | Meaning |
|------|---------|
| 200 | OK |
| 201 | Created |
| 204 | No Content (deletion) |
| 400 | Validation failure / bad request |
| 401 | Missing/invalid token |
| 403 | Insufficient permissions |
| 404 | Resource not found |
| 409 | Conflict (duplicate email, slot taken) |

---

## Validation Rules (Global)

| Constraint | Pattern / Rule |
|-----------|----------------|
| **UUID** | `z.string().uuid()` — standard UUID v4 |
| **Date** | `/^\d{4}-\d{2}-\d{2}$/` — YYYY-MM-DD |
| **Time** | `/^([01]\d\|2[0-3]):[0-5]\d$/` — HH:mm (24h) |
| **Email** | `z.string().email()` — standard email |
| **Password** | min 8, max 128 chars |
| **Rating** | integer, min 1, max 5 |
| **Amount** | positive number |
| **Weekday** | integer, 0–6 (Sun=0, Sat=6) |
| **Slot Duration** | integer >= 1 (minutes) |
| **endTime > startTime** | `.refine()` on schedule + slot create/update |

---

## Module: Auth

### `POST /auth/register`
- **Auth:** None
- **Body:**
  ```
  email:        String (email)       REQUIRED
  password:     String (8-128 chars) REQUIRED
  fullName:     String (1-255)       REQUIRED
  ```
- **201:**
  ```json
  { "accessToken": "jwt...", "refreshToken": "jwt..." }
  ```
- **Errors:** 400 (validation), 409 (email exists)

---

### `POST /auth/login`
- **Auth:** None
- **Body:**
  ```
  email:        String (email)       REQUIRED
  password:     String (min 1)       REQUIRED
  ```
- **200:**
  ```json
  { "accessToken": "jwt...", "refreshToken": "jwt..." }
  ```
- **Errors:** 400, 401 (invalid credentials)

---

### `POST /auth/refresh`
- **Auth:** None
- **Body:**
  ```
  refreshToken: String (min 1)       REQUIRED
  ```
- **200:**
  ```json
  { "accessToken": "jwt...", "refreshToken": "jwt..." }
  ```
- **Errors:** 400, 401 (invalid/expired/revoked)

---

### `POST /auth/logout`
- **Auth:** Required (any role)
- **Body:**
  ```
  refreshToken: String (min 1)      REQUIRED
  ```
- **204:** No Content
- **Errors:** 400, 401

---

### `GET /auth/me`
- **Auth:** Required (any role)
- **200:**
  ```json
  {
    "id": "uuid", "email": "user@example.com",
    "role": "patient", "isVerified": false,
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z",
    "deletedAt": null
  }
  ```
- **Errors:** 401, 404

---

## Module: Users (Admin)

All require `MANAGE_USERS` (admin only).

### `GET /admin/users`
- **Query:**
  ```
  role:       "patient" | "doctor" | "admin"   optional
  isVerified: boolean                           optional
  search:     String                            optional
  page:       Number (positive int)             optional
  limit:      Number (1-100)                    optional
  ```
- **200:**
  ```json
  [
    { "id": "uuid", "email": "...", "role": "patient", "isVerified": false, "createdAt": "...", "updatedAt": "...", "deletedAt": null }
  ]
  ```
- **Errors:** 401, 403

---

### `GET /admin/users/:id`
- **200:** Single user object
- **Errors:** 401, 403, 404

---

### `PATCH /admin/users/:id`
- **Body (all optional):**
  ```
  email:      String (email)               optional
  role:       "patient" | "doctor" | "admin" optional
  isVerified: Boolean                       optional
  ```
- **200:** Updated user object
- **Errors:** 400, 401, 403, 404, 409 (email conflict)

---

### `DELETE /admin/users/:id`
- **204:** No Content
- **Errors:** 401, 403, 404, 400 (already deleted)

---

## Module: Patients

### `GET /patients/me`
- **Auth:** `VIEW_OWN_PROFILE`
- **200:**
  ```json
  { "id": "uuid", "userId": "uuid", "fullName": "John Doe", "phone": null, "gender": null, "birthDate": null }
  ```
- **Errors:** 401, 403, 404

---

### `PATCH /patients/me`
- **Auth:** `MANAGE_OWN_PROFILE`
- **Body (all optional):**
  ```
  fullName:  String (1-255)             optional
  phone:     String (max 50) | null     optional
  gender:    String (max 20) | null     optional
  birthDate: String (YYYY-MM-DD) | null optional
  ```
- **200:** Updated patient object
- **Errors:** 400, 401, 403

---

### `POST /patients`
- **Auth:** `MANAGE_PATIENTS`
- **Body:**
  ```
  userId:    String (UUID)              REQUIRED
  fullName:  String (1-255)             REQUIRED
  phone:     String (max 50) | null     optional
  gender:    String (max 20) | null     optional
  birthDate: String (YYYY-MM-DD) | null optional
  ```
- **201:** Created patient object
- **Errors:** 400, 401, 403, 404 (user not found)

---

### `GET /patients`
- **Auth:** `MANAGE_PATIENTS`
- **200:** `[ PatientRecord, ... ]`
- **Errors:** 401, 403

---

### `GET /patients/:id`
- **Auth:** `MANAGE_PATIENTS`
- **200:** PatientRecord
- **Errors:** 401, 403, 404

---

### `GET /patients/user/:userId`
- **Auth:** `MANAGE_PATIENTS`
- **200:** PatientRecord
- **Errors:** 401, 403, 404

---

### `PATCH /patients/:id`
- **Auth:** `MANAGE_PATIENTS`
- **Body:** Same as `PATCH /patients/me`
- **200:** Updated patient
- **Errors:** 400, 401, 403, 404

---

### `DELETE /patients/:id`
- **Auth:** `MANAGE_PATIENTS`
- **204:** No Content
- **Errors:** 401, 403, 404

---

## Module: Doctors

### `GET /doctors`
- **Auth:** None
- **200:**
  ```json
  [
    {
      "id": "uuid", "userId": "uuid",
      "clinicId": "uuid", "specialtyId": "uuid",
      "consultationFee": "150.00",
      "bio": "text...", "experienceYears": 10
    }
  ]
  ```
  **Note:** `consultationFee` is a **string** (PostgreSQL NUMERIC serialized as string).

---

### `GET /doctors/:id`
- **Auth:** None
- **200:** Single DoctorRecord
- **Errors:** 404

---

### `GET /admin/doctors`
- **Auth:** `MANAGE_DOCTORS`
- **200:** `[ DoctorRecord, ... ]`
- **Errors:** 401, 403

---

### `GET /admin/doctors/:id`
- **Auth:** `MANAGE_DOCTORS`
- **200:** DoctorRecord
- **Errors:** 401, 403, 404

---

### `POST /admin/doctors`
- **Auth:** `MANAGE_DOCTORS`
- **Body:**
  ```
  userId:          String (UUID)       REQUIRED
  clinicId:        String (UUID)       REQUIRED
  specialtyId:     String (UUID)       REQUIRED
  consultationFee: Number (>= 0)       REQUIRED
  bio:             String | null       optional
  experienceYears: Number (int, >= 0)  REQUIRED
  ```
- **201:** DoctorRecord
- **Errors:** 400, 401, 403, 404 (user/clinic/specialty not found)

---

### `PATCH /admin/doctors/:id`
- **Auth:** `MANAGE_DOCTORS`
- **Body (all optional):**
  ```
  clinicId:        String (UUID)       optional
  specialtyId:     String (UUID)       optional
  consultationFee: Number (>= 0)       optional
  bio:             String | null       optional
  experienceYears: Number (int, >= 0)  optional
  ```
- **200:** Updated DoctorRecord
- **Errors:** 400, 401, 403, 404

---

### `DELETE /admin/doctors/:id`
- **Auth:** `MANAGE_DOCTORS`
- **204:** No Content
- **Errors:** 401, 403, 404

---

## Module: Clinics

### `GET /clinics`
- **Auth:** None
- **200:**
  ```json
  [
    { "id": "uuid", "name": "Clinic A", "phone": null, "address": null, "city": null, "description": null }
  ]
  ```

---

### `GET /clinics/:id`
- **Auth:** None
- **200:** Single ClinicRecord
- **Errors:** 404

---

### `GET /admin/clinics`
- **Auth:** `MANAGE_CLINICS`
- **200:** `[ ClinicRecord, ... ]`

---

### `GET /admin/clinics/:id`
- **Auth:** `MANAGE_CLINICS`

---

### `POST /admin/clinics`
- **Auth:** `MANAGE_CLINICS`
- **Body:**
  ```
  name:        String (1-255)        REQUIRED
  phone:       String (max 50) | null optional
  address:     String | null         optional
  city:        String (max 100) | null optional
  description: String | null         optional
  ```
- **201:** ClinicRecord

---

### `PATCH /admin/clinics/:id`
- **Auth:** `MANAGE_CLINICS`
- **Body:** Same fields as create, all optional
- **200:** Updated ClinicRecord

---

### `DELETE /admin/clinics/:id`
- **Auth:** `MANAGE_CLINICS`
- **204:** No Content
- **Errors:** 403, 409 (doctors assigned — DB RESTRICT)

---

## Module: Specialties

### `GET /specialties`
- **Auth:** None
- **200:** `[ { "id": "uuid", "name": "Cardiology" }, ... ]`

---

### `GET /specialties/:id`
- **Auth:** None
- **200:** SpecialtyRecord
- **Errors:** 404

---

### `GET /admin/specialties`
- **Auth:** `MANAGE_SPECIALTIES`

---

### `GET /admin/specialties/:id`
- **Auth:** `MANAGE_SPECIALTIES`

---

### `POST /admin/specialties`
- **Auth:** `MANAGE_SPECIALTIES`
- **Body:**
  ```
  name: String (trim, 2-255) REQUIRED
  ```
- **201:** SpecialtyRecord
- **Errors:** 409 (duplicate name)

---

### `PATCH /admin/specialties/:id`
- **Auth:** `MANAGE_SPECIALTIES`
- **Body:**
  ```
  name: String (trim, 2-255) optional
  ```
- **200:** Updated SpecialtyRecord
- **Errors:** 409 (duplicate name)

---

### `DELETE /admin/specialties/:id`
- **Auth:** `MANAGE_SPECIALTIES`
- **204:** No Content
- **Errors:** 409 (doctors assigned — DB RESTRICT)

---

## Module: Doctor Schedules

### `GET /doctor-schedules/me`
- **Auth:** `VIEW_OWN_SCHEDULE`
- **200:**
  ```json
  [
    { "id": "uuid", "doctorId": "uuid", "weekday": 1, "startTime": "09:00", "endTime": "17:00", "slotDuration": 30 }
  ]
  ```
- **Errors:** 401, 403

---

### `GET /doctor-schedules`
- **Auth:** `MANAGE_SCHEDULES`
- **200:** `[ DoctorScheduleRecord, ... ]`

---

### `GET /doctor-schedules/:id`
- **Auth:** `MANAGE_SCHEDULES`

---

### `GET /doctor-schedules/doctor/:doctorId`
- **Auth:** `MANAGE_SCHEDULES`

---

### `POST /doctor-schedules`
- **Auth:** `MANAGE_SCHEDULES`
- **Body:**
  ```
  doctorId:     String (UUID)        REQUIRED
  weekday:      Number (int, 0-6)    REQUIRED  (0=Sun, 6=Sat)
  startTime:    String (HH:mm)       REQUIRED
  endTime:      String (HH:mm)       REQUIRED  (must be > startTime)
  slotDuration: Number (int, >= 1)   REQUIRED  (minutes)
  ```
- **201:** DoctorScheduleRecord
- **Errors:** 400, 401, 403, 409 (duplicate doctor+weekday+start)

---

### `PATCH /doctor-schedules/:id`
- **Auth:** `MANAGE_SCHEDULES`
- **Body (all optional):**
  ```
  weekday:      Number (int, 0-6)    optional
  startTime:    String (HH:mm)       optional
  endTime:      String (HH:mm)       optional
  slotDuration: Number (int, >= 1)   optional
  ```
- **200:** Updated DoctorScheduleRecord

---

### `DELETE /doctor-schedules/:id`
- **Auth:** `MANAGE_SCHEDULES`
- **204:** No Content

---

## Module: Appointment Slots

### `GET /appointment-slots/available`
- **Auth:** None
- **Query:**
  ```
  doctorId: String (UUID)   optional
  date:     String (YYYY-MM-DD) optional
  ```
- **200:** `[ AppointmentSlotRecord, ... ]` (only status=`available`, deleted_at IS NULL)

---

### `GET /appointment-slots/doctor/:doctorId`
- **Auth:** None
- **200:** `[ AppointmentSlotRecord, ... ]` (deleted_at IS NULL)

---

### `GET /appointment-slots/date/:slotDate`
- **Auth:** None
- **200:** `[ AppointmentSlotRecord, ... ]` (deleted_at IS NULL)

---

### `GET /admin/appointment-slots`
- **Auth:** `MANAGE_SLOTS`

---

### `GET /admin/appointment-slots/:id`
- **Auth:** `MANAGE_SLOTS`

---

### `GET /admin/appointment-slots/available`
- **Auth:** `MANAGE_SLOTS`
- **Query:** Same as public available

---

### `GET /admin/appointment-slots/doctor/:doctorId`
- **Auth:** `MANAGE_SLOTS`

---

### `GET /admin/appointment-slots/date/:slotDate`
- **Auth:** `MANAGE_SLOTS`

---

### `POST /admin/appointment-slots`
- **Auth:** `MANAGE_SLOTS`
- **Body:**
  ```
  doctorId:         String (UUID)                REQUIRED
  doctorScheduleId: String (UUID)                REQUIRED
  slotDate:         String (YYYY-MM-DD)          REQUIRED
  startTime:        String (HH:mm)               REQUIRED
  endTime:          String (HH:mm)               REQUIRED (must be > startTime)
  status:           "available"|"booked"|"cancelled"  optional (default "available")
  ```
- **201:** AppointmentSlotRecord
- **Errors:** 400, 401, 403, 409 (duplicate or overlapping)

---

### `PATCH /admin/appointment-slots/:id`
- **Auth:** `MANAGE_SLOTS`
- **Body:**
  ```
  slotDate:  String (YYYY-MM-DD)                 optional
  startTime: String (HH:mm)                      optional
  endTime:   String (HH:mm)                      optional
  status:    "available"|"booked"|"cancelled"    optional
  ```
- **200:** Updated AppointmentSlotRecord

---

### `DELETE /admin/appointment-slots/:id`
- **Auth:** `MANAGE_SLOTS`
- **204:** No Content (soft delete — sets `deleted_at`)

---

## Module: Appointments

### `POST /appointments` (Self-service)
- **Auth:** `BOOK_APPOINTMENT` or `MANAGE_OWN_APPOINTMENTS`
- **Body:**
  ```
  slotId: String (UUID) REQUIRED
  ```
  Patient ID inferred from JWT `sub`.
- **201:**
  ```json
  { "id": "uuid", "patientId": "uuid", "slotId": "uuid", "status": "scheduled", "notes": null }
  ```
- **Errors:** 400, 401, 403, 404 (patient/slot), 409 (slot not available)

---

### `GET /appointments/mine`
- **Auth:** `MANAGE_OWN_APPOINTMENTS`
- **200:** `[ AppointmentRecord, ... ]` (patient sees own, doctor sees assigned)
- **Errors:** 401, 403

---

### `PATCH /appointments/mine/:id` (Cancel own)
- **Auth:** `MANAGE_OWN_APPOINTMENTS`
- **Body:** _none_
- **200:** Updated AppointmentRecord (status = `cancelled`, slot = `available`)
- **Errors:** 400 (past appointment / wrong status), 401, 403 (not own), 404

---

### `POST /appointments` (Admin — full body)
- **Auth:** `MANAGE_APPOINTMENTS`
- **Body:**
  ```
  patientId: String (UUID)                     REQUIRED
  slotId:    String (UUID)                     REQUIRED
  status:    "scheduled"|"confirmed"|"completed"|"cancelled"|"no_show"  optional
  notes:     String (max 500) | null           optional
  ```
- **201:** AppointmentRecord

---

### `GET /appointments`
- **Auth:** `MANAGE_APPOINTMENTS`
- **200:** `[ AppointmentRecord, ... ]`

---

### `GET /appointments/:id`
- **Auth:** `MANAGE_APPOINTMENTS`

---

### `GET /appointments/patient/:patientId`
- **Auth:** `MANAGE_APPOINTMENTS`

---

### `GET /appointments/doctor/:doctorId`
- **Auth:** `MANAGE_APPOINTMENTS`

---

### `PATCH /appointments/:id` (Admin)
- **Auth:** `MANAGE_APPOINTMENTS`
- **Body:**
  ```
  status: "scheduled"|"confirmed"|"completed"|"cancelled"|"no_show"  optional
  notes:  String (max 500) | null                                     optional
  ```
  If status changes to `cancelled` → slot becomes `available`. If restored from `cancelled` → slot becomes `booked`.
- **200:** Updated AppointmentRecord

---

### `DELETE /appointments/:id`
- **Auth:** `MANAGE_APPOINTMENTS`
- **204:** No Content (transaction: deletes appointment + sets slot to `available`)

---

## Module: Payments

### `POST /payments`
- **Auth:** `PAY_APPOINTMENT` or `MANAGE_PAYMENTS`
- **Body:**
  ```
  appointmentId:       String (UUID)                       REQUIRED
  amount:              Number (positive)                   REQUIRED
  method:              "cash"|"card"|"bank_transfer"|"online"  REQUIRED
  status:              "pending"|"paid"|"failed"|"refunded"    optional
  transactionReference: String (max 255) | null            optional (unique)
  ```
- **201:**
  ```json
  { "id": "uuid", "appointmentId": "uuid", "amount": 150, "method": "card", "status": "pending", "transactionReference": null }
  ```
- **Errors:** 400, 401, 403, 404 (appointment), 409 (already paid)

---

### `GET /payments/mine`
- **Auth:** `PAY_APPOINTMENT`
- **200:** `[ PaymentRecord, ... ]` (own appointments only)

---

### `GET /payments`
- **Auth:** `MANAGE_PAYMENTS`

---

### `GET /payments/:id`
- **Auth:** `MANAGE_PAYMENTS`

---

### `GET /payments/appointment/:appointmentId`
- **Auth:** `MANAGE_PAYMENTS`

---

### `PATCH /payments/:id`
- **Auth:** `MANAGE_PAYMENTS`
- **Body:**
  ```
  amount:              Number (positive)                    optional
  method:              "cash"|"card"|"bank_transfer"|"online"   optional
  status:              "pending"|"paid"|"failed"|"refunded"     optional
  transactionReference: String (max 255) | null             optional
  ```
- **200:** Updated PaymentRecord

---

### `DELETE /payments/:id`
- **Auth:** `MANAGE_PAYMENTS`
- **204:** No Content

---

## Module: Reviews

### `POST /reviews`
- **Auth:** `MANAGE_OWN_REVIEWS`
- **Body:**
  ```
  appointmentId: String (UUID)       REQUIRED
  rating:        Number (int, 1-5)   REQUIRED
  comment:       String (max 500) | null  optional
  ```
- **201:**
  ```json
  { "id": "uuid", "appointmentId": "uuid", "rating": 5, "comment": "Excellent!" }
  ```
- **Errors:** 400, 401, 403, 404 (appointment), 409 (already reviewed)

---

### `GET /reviews/mine`
- **Auth:** `MANAGE_OWN_REVIEWS` or `VIEW_OWN_REVIEWS`
- **200:** `[ ReviewRecord, ... ]`

---

### `GET /reviews`
- **Auth:** `MANAGE_REVIEWS`

---

### `GET /reviews/:id`
- **Auth:** `MANAGE_REVIEWS`

---

### `GET /reviews/appointment/:appointmentId`
- **Auth:** `MANAGE_REVIEWS`

---

### `PATCH /reviews/:id`
- **Auth:** `MANAGE_REVIEWS`
- **Body:**
  ```
  rating:  Number (int, 1-5)         optional
  comment: String (max 500) | null   optional
  ```
- **200:** Updated ReviewRecord

---

### `DELETE /reviews/:id`
- **Auth:** `MANAGE_REVIEWS`
- **204:** No Content

---

## Record Types (for TypeScript interfaces)

```typescript
interface UserRecord {
  id: string; email: string; role: "patient" | "doctor" | "admin";
  isVerified: boolean; createdAt: string; updatedAt: string; deletedAt: string | null;
}

interface PatientRecord {
  id: string; userId: string; fullName: string;
  phone: string | null; gender: string | null; birthDate: string | null;
}

interface DoctorRecord {
  id: string; userId: string; clinicId: string; specialtyId: string;
  consultationFee: string;  // ⚠️ string, not number (NUMERIC serialization)
  bio: string | null; experienceYears: number;
}

interface ClinicRecord {
  id: string; name: string;
  phone: string | null; address: string | null; city: string | null; description: string | null;
}

interface SpecialtyRecord {
  id: string; name: string;
}

interface DoctorScheduleRecord {
  id: string; doctorId: string; weekday: number;
  startTime: string; endTime: string; slotDuration: number;
}

interface AppointmentSlotRecord {
  id: string; doctorId: string; doctorScheduleId: string;
  slotDate: string; startTime: string; endTime: string;
  status: "available" | "booked" | "cancelled";
  createdAt: string; updatedAt: string; deletedAt: string | null;
}

interface AppointmentRecord {
  id: string; patientId: string; slotId: string;
  status: "scheduled" | "confirmed" | "completed" | "cancelled" | "no_show";
  notes: string | null;
}

interface PaymentRecord {
  id: string; appointmentId: string; amount: number;
  method: "cash" | "card" | "bank_transfer" | "online";
  status: "pending" | "paid" | "failed" | "refunded";
  transactionReference: string | null;
}

interface ReviewRecord {
  id: string; appointmentId: string; rating: number; comment: string | null;
}

interface AuthTokens {
  accessToken: string; refreshToken: string;
}
```

---

## Permission → Role Mapping (for frontend UI guards)

```typescript
const RolePermissions = {
  admin: [
    "manageUsers", "managePatients", "manageDoctors", "manageClinics",
    "manageSpecialties", "manageSchedules", "manageSlots", "manageAppointments",
    "managePayments", "manageReviews", "manageNotifications"
  ],
  doctor: [
    "viewOwnProfile", "manageOwnProfile", "viewOwnSchedule",
    "manageOwnAppointments", "viewOwnReviews", "manageOwnNotifications"
  ],
  patient: [
    "viewOwnProfile", "manageOwnProfile", "bookAppointment",
    "manageOwnAppointments", "payAppointment",
    "manageOwnReviews", "manageOwnNotifications"
  ]
};
```

---

## API Endpoint Count: 79

| Module | Public | Authenticated (Self) | Admin | Total |
|--------|--------|---------------------|-------|-------|
| Auth | 3 | 2 | 0 | 5 |
| Users | 0 | 0 | 4 | 4 |
| Patients | 0 | 2 | 6 | 8 |
| Doctors | 2 | 0 | 5 | 7 |
| Clinics | 2 | 0 | 5 | 7 |
| Specialties | 2 | 0 | 5 | 7 |
| Doctor Schedules | 0 | 1 | 6 | 7 |
| Appointment Slots | 3 | 0 | 8 | 11 |
| Appointments | 0 | 3 | 6 | 9 |
| Payments | 0 | 2 | 5 | 7 |
| Reviews | 0 | 2 | 5 | 7 |
| **Total** | **12** | **12** | **55** | **79** |
