# Database Specification — Clinic Booking System

## Tables

---

### users

| Column | Type | Constraints |
|---|---|---|
| id | `UUID` | PK, DEFAULT `gen_random_uuid()` |
| email | `VARCHAR(255)` | NOT NULL, UNIQUE |
| password_hash | `VARCHAR(255)` | NOT NULL |
| role | `VARCHAR(50)` | NOT NULL, DEFAULT `'patient'` |
| is_verified | `BOOLEAN` | NOT NULL, DEFAULT `FALSE` |
| created_at | `TIMESTAMPTZ` | NOT NULL, DEFAULT `NOW()` |
| updated_at | `TIMESTAMPTZ` | NOT NULL, DEFAULT `NOW()` |
| deleted_at | `TIMESTAMPTZ` | NULLABLE |

**Indexes:**
- UNIQUE on `email`
- Index on `role`
- Partial index on `deleted_at IS NOT NULL` (soft-delete filter)

**Relationships:**
- 1---* patients (user_id)
- 1---* doctors (user_id)
- 1---* notifications (user_id)

---

### patients

| Column | Type | Constraints |
|---|---|---|
| id | `UUID` | PK, DEFAULT `gen_random_uuid()` |
| user_id | `UUID` | NOT NULL, FK → users(id) ON DELETE CASCADE ON UPDATE CASCADE |
| full_name | `VARCHAR(255)` | NOT NULL |
| phone | `VARCHAR(50)` | NULLABLE |
| gender | `VARCHAR(20)` | NULLABLE |
| birth_date | `DATE` | NULLABLE |

**Indexes:**
- UNIQUE on `user_id` (1-to-1 with users)
- Index on `full_name` (search)

**FK Actions:** ON DELETE CASCADE, ON UPDATE CASCADE

**Relationship cardinality:** 1---* to appointments

---

### doctors

| Column | Type | Constraints |
|---|---|---|
| id | `UUID` | PK, DEFAULT `gen_random_uuid()` |
| user_id | `UUID` | NOT NULL, FK → users(id) ON DELETE CASCADE ON UPDATE CASCADE |
| clinic_id | `UUID` | NOT NULL, FK → clinics(id) ON DELETE RESTRICT ON UPDATE CASCADE |
| specialty_id | `UUID` | NOT NULL, FK → specialties(id) ON DELETE RESTRICT ON UPDATE CASCADE |
| consultation_fee | `NUMERIC(10,2)` | NOT NULL, CHECK (consultation_fee >= 0) |
| bio | `TEXT` | NULLABLE |
| experience_years | `SMALLINT` | NOT NULL, DEFAULT 0, CHECK (experience_years >= 0) |

**Indexes:**
- UNIQUE on `user_id` (1-to-1 with users)
- Index on `clinic_id`
- Index on `specialty_id`

**FK Actions:**
- users: ON DELETE CASCADE, ON UPDATE CASCADE
- clinics: ON DELETE RESTRICT, ON UPDATE CASCADE
- specialties: ON DELETE RESTRICT, ON UPDATE CASCADE

**Relationship cardinality:**
- 1---* to doctor_schedules
- 1---* to appointment_slots

---

### clinics

| Column | Type | Constraints |
|---|---|---|
| id | `UUID` | PK, DEFAULT `gen_random_uuid()` |
| name | `VARCHAR(255)` | NOT NULL |
| phone | `VARCHAR(50)` | NULLABLE |
| address | `TEXT` | NULLABLE |
| city | `VARCHAR(100)` | NULLABLE |
| description | `TEXT` | NULLABLE |

**Indexes:**
- Index on `name`
- Index on `city`

**Relationship cardinality:** 1---* to doctors

---

### specialties

| Column | Type | Constraints |
|---|---|---|
| id | `UUID` | PK, DEFAULT `gen_random_uuid()` |
| name | `VARCHAR(255)` | NOT NULL, UNIQUE |

**Indexes:** UNIQUE on `name`

**Relationship cardinality:** 1---* to doctors

---

### doctor_schedules

| Column | Type | Constraints |
|---|---|---|
| id | `UUID` | PK, DEFAULT `gen_random_uuid()` |
| doctor_id | `UUID` | NOT NULL, FK → doctors(id) ON DELETE CASCADE ON UPDATE CASCADE |
| weekday | `SMALLINT` | NOT NULL, CHECK (weekday BETWEEN 0 AND 6) |
| start_time | `TIME WITHOUT TIME ZONE` | NOT NULL |
| end_time | `TIME WITHOUT TIME ZONE` | NOT NULL, CHECK (end_time > start_time) |
| slot_duration | `SMALLINT` | NOT NULL, CHECK (slot_duration > 0) — in minutes |

**Indexes:**
- Index on `doctor_id`
- UNIQUE on `(doctor_id, weekday, start_time)` — no overlapping schedule entries

**FK Actions:** ON DELETE CASCADE, ON UPDATE CASCADE

**Relationship cardinality:** 1---* to appointment_slots

---

### appointment_slots

| Column | Type | Constraints |
|---|---|---|
| id | `UUID` | PK, DEFAULT `gen_random_uuid()` |
| doctor_id | `UUID` | NOT NULL, FK → doctors(id) ON DELETE CASCADE ON UPDATE CASCADE |
| doctor_schedule_id | `UUID` | NOT NULL, FK → doctor_schedules(id) ON DELETE CASCADE ON UPDATE CASCADE |
| slot_date | `DATE` | NOT NULL |
| start_time | `TIME WITHOUT TIME ZONE` | NOT NULL |
| end_time | `TIME WITHOUT TIME ZONE` | NOT NULL, CHECK (end_time > start_time) |
| status | `VARCHAR(20)` | NOT NULL, DEFAULT `'available'` |
| created_at | `TIMESTAMPTZ` | NOT NULL, DEFAULT `NOW()` |
| updated_at | `TIMESTAMPTZ` | NOT NULL, DEFAULT `NOW()` |
| deleted_at | `TIMESTAMPTZ` | NULLABLE |

**Indexes:**
- Index on `doctor_id`
- Index on `doctor_schedule_id`
- Index on `(slot_date, status)` — find available slots by date
- UNIQUE on `(doctor_id, slot_date, start_time)` — prevent duplicate slots
- Partial index on `deleted_at IS NOT NULL`

**FK Actions:** ON DELETE CASCADE, ON UPDATE CASCADE

**Relationship cardinality:** 1---* to appointments

---

### appointments

| Column | Type | Constraints |
|---|---|---|
| id | `UUID` | PK, DEFAULT `gen_random_uuid()` |
| patient_id | `UUID` | NOT NULL, FK → patients(id) ON DELETE RESTRICT ON UPDATE CASCADE |
| slot_id | `UUID` | NOT NULL, FK → appointment_slots(id) ON DELETE RESTRICT ON UPDATE CASCADE |
| status | `VARCHAR(20)` | NOT NULL, DEFAULT `'scheduled'` |
| notes | `TEXT` | NULLABLE |

**Indexes:**
- Index on `patient_id`
- UNIQUE on `slot_id` (each slot can have at most one appointment)
- Index on `status`

**FK Actions:**
- patients: ON DELETE RESTRICT, ON UPDATE CASCADE
- appointment_slots: ON DELETE RESTRICT, ON UPDATE CASCADE

**Relationship cardinality:**
- 1---1 to payments
- 1---1 to reviews

---

### payments

| Column | Type | Constraints |
|---|---|---|
| id | `UUID` | PK, DEFAULT `gen_random_uuid()` |
| appointment_id | `UUID` | NOT NULL, UNIQUE, FK → appointments(id) ON DELETE RESTRICT ON UPDATE CASCADE |
| amount | `NUMERIC(10,2)` | NOT NULL, CHECK (amount > 0) |
| method | `VARCHAR(50)` | NOT NULL |
| status | `VARCHAR(20)` | NOT NULL, DEFAULT `'pending'` |
| transaction_reference | `VARCHAR(255)` | NULLABLE, UNIQUE |

**Indexes:**
- UNIQUE on `appointment_id`
- UNIQUE on `transaction_reference`
- Index on `status`

**FK Actions:** ON DELETE RESTRICT, ON UPDATE CASCADE

---

### reviews

| Column | Type | Constraints |
|---|---|---|
| id | `UUID` | PK, DEFAULT `gen_random_uuid()` |
| appointment_id | `UUID` | NOT NULL, UNIQUE, FK → appointments(id) ON DELETE CASCADE ON UPDATE CASCADE |
| rating | `SMALLINT` | NOT NULL, CHECK (rating BETWEEN 1 AND 5) |
| comment | `TEXT` | NULLABLE |

**Indexes:** UNIQUE on `appointment_id`

**FK Actions:** ON DELETE CASCADE, ON UPDATE CASCADE

---

### notifications

| Column | Type | Constraints |
|---|---|---|
| id | `UUID` | PK, DEFAULT `gen_random_uuid()` |
| user_id | `UUID` | NOT NULL, FK → users(id) ON DELETE CASCADE ON UPDATE CASCADE |
| title | `VARCHAR(255)` | NOT NULL |
| message | `TEXT` | NOT NULL |
| is_read | `BOOLEAN` | NOT NULL, DEFAULT `FALSE` |

**Indexes:**
- Index on `user_id`
- Index on `(user_id, is_read)` — unread notifications query

**FK Actions:** ON DELETE CASCADE, ON UPDATE CASCADE

---

## 1. Dependency Order for Creating Tables

1. `users`
2. `clinics`
3. `specialties`
4. `doctors` (depends on users, clinics, specialties)
5. `doctor_schedules` (depends on doctors)
6. `appointment_slots` (depends on doctors, doctor_schedules)
7. `patients` (depends on users)
8. `appointments` (depends on patients, appointment_slots)
9. `payments` (depends on appointments)
10. `reviews` (depends on appointments)
11. `notifications` (depends on users)

---

## 2. Suggested ENUM Types

| ENUM Name | Values | Used By |
|---|---|---|
| `user_role` | `'patient'`, `'doctor'`, `'admin'` | users.role |
| `slot_status` | `'available'`, `'booked'`, `'cancelled'` | appointment_slots.status |
| `appointment_status` | `'scheduled'`, `'confirmed'`, `'completed'`, `'cancelled'`, `'no_show'` | appointments.status |
| `payment_method` | `'cash'`, `'card'`, `'bank_transfer'`, `'online'` | payments.method |
| `payment_status` | `'pending'`, `'paid'`, `'failed'`, `'refunded'` | payments.status |

---

## 3. Inconsistencies & Improvements

1. **UniqueID → id** — The ERD labels every PK as `UniqueID`. The column should be named `id` for consistency with standard PostgreSQL conventions.

2. **Missing `patient_id` FK on reviews** — The ERD links reviews to appointments, but there is no direct FK to `patients`. Since `reviews` relates to `appointments` and `appointments` already links to `patients`, this is fine via traversal — the FK to `appointments` is sufficient.

3. **No `updated_at` / `deleted_at` on doctors, patients, clinics, specialties, doctor_schedules** — Most tables lack soft-delete and update timestamps. Only `users`, `appointment_slots` have `created_at`/`updated_at`/`deleted_at`. This is inconsistent. If soft-delete is required, it should be applied uniformly.

4. **Slot/Appointment status overlap** — Both `appointment_slots.status` and `appointments.status` track similar concepts. Consider whether a slot simply transitions to `'booked'` when an appointment is made, and the appointment itself holds the patient-facing status.

5. **patients.gender as VARCHAR** — Better stored as a CHECK constraint (`CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say'))`) or as an ENUM if more structure is needed.

6. **doctor_schedules.slot_duration** — This is the only place slot duration is defined. If all time-based generation logic depends on this value, ensure the application enforces that generated `appointment_slots` end_time - start_time aligns with the schedule's `slot_duration`.

---

## 4. Missing Constraints

1. **appointments.slot_id UNIQUE** — Each slot can only be reserved once. A UNIQUE constraint on `appointment_slots.slot_id` is needed (or already implied by the 1---1 relationship arrow). Add a UNIQUE constraint.

2. **appointment_slots status CHECK** — If not using ENUM, add `CHECK (status IN ('available', 'booked', 'cancelled'))`.

3. **doctor_schedules.weekday CHECK** — `CHECK (weekday BETWEEN 0 AND 6)` where 0 = Sunday, 6 = Saturday.

4. **reviews.appointment_id UNIQUE** — Each appointment should have at most one review. Add UNIQUE constraint.

5. **payments.appointment_id UNIQUE** — Each appointment should have at most one payment record. Add UNIQUE constraint.

6. **CHECK (end_time > start_time)** — On `doctor_schedules` and `appointment_slots`.

7. **NOT NULL on clinics.name** — The clinic name should be required (it appears to be nullable in the ERD by omission; mark it NOT NULL).

8. **overlapping schedule guard** — A UNIQUE constraint on `doctor_schedules(doctor_id, weekday, start_time)` prevents two schedules starting at the same time on the same day for the same doctor.
