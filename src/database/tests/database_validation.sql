-- =============================================================================
-- Database Validation Script — Clinic Booking System
-- =============================================================================
-- This script validates the entire database schema using realistic dummy data.
-- It is safe to execute — all intentionally-failing statements are commented.
-- =============================================================================

-- =============================================================================
-- SECTION 1: HAPPY PATH — Insert Valid Data in Dependency Order
-- =============================================================================

BEGIN;

-- ---------------------------------------------------------------------------
-- 1a. Users (doctor user, patient user)
-- ---------------------------------------------------------------------------
WITH
    inserted_doctor_user AS (
        INSERT INTO users (email, password_hash, role)
        VALUES ('dr.smith@clinic.com', '$2b$10$abcdefghijklmnopqrstuvwxyz0123456789abcdefghijklmnop', 'doctor')
        RETURNING id
    ),
    inserted_patient_user AS (
        INSERT INTO users (email, password_hash, role)
        VALUES ('jane.doe@email.com', '$2b$10$zyxwvutsrqponmlkjihgfedcba0123456789zyxwvutsrqponmlkjihg', 'patient')
        RETURNING id
    ),

-- ---------------------------------------------------------------------------
-- 1b. Clinics
-- ---------------------------------------------------------------------------
    inserted_clinic AS (
        INSERT INTO clinics (name, phone, address, city, description)
        VALUES ('Downtown Health Center', '+1-555-0100', '123 Main Street', 'New York', 'General practice and specialist clinic')
        RETURNING id
    ),

-- ---------------------------------------------------------------------------
-- 1c. Specialties
-- ---------------------------------------------------------------------------
    inserted_specialty AS (
        INSERT INTO specialties (name)
        VALUES ('Cardiology')
        RETURNING id
    ),

-- ---------------------------------------------------------------------------
-- 1d. Doctors
-- ---------------------------------------------------------------------------
    inserted_doctor AS (
        INSERT INTO doctors (user_id, clinic_id, specialty_id, consultation_fee, bio, experience_years)
        SELECT
            du.id, c.id, s.id, 250.00,
            'Board-certified cardiologist with 15 years of experience.', 15
        FROM inserted_doctor_user du, inserted_clinic c, inserted_specialty s
        RETURNING id
    ),

-- ---------------------------------------------------------------------------
-- 1e. Doctor Schedules
-- ---------------------------------------------------------------------------
    inserted_schedule AS (
        INSERT INTO doctor_schedules (doctor_id, weekday, start_time, end_time, slot_duration)
        SELECT d.id, 1, '09:00:00', '12:00:00', 30
        FROM inserted_doctor d
        RETURNING id
    ),

-- ---------------------------------------------------------------------------
-- 1f. Appointment Slots
-- ---------------------------------------------------------------------------
    inserted_slot AS (
        INSERT INTO appointment_slots (doctor_id, doctor_schedule_id, slot_date, start_time, end_time, status)
        SELECT
            d.id, s.id, CURRENT_DATE + 1, '09:00:00', '09:30:00', 'available'
        FROM inserted_doctor d, inserted_schedule s
        RETURNING id
    ),

-- ---------------------------------------------------------------------------
-- 1g. Patients
-- ---------------------------------------------------------------------------
    inserted_patient AS (
        INSERT INTO patients (user_id, full_name, phone, gender, birth_date)
        SELECT pu.id, 'Jane Doe', '+1-555-0200', 'female', '1990-05-15'
        FROM inserted_patient_user pu
        RETURNING id
    ),

-- ---------------------------------------------------------------------------
-- 1h. Appointments
-- ---------------------------------------------------------------------------
    inserted_appointment AS (
        INSERT INTO appointments (patient_id, slot_id, notes)
        SELECT p.id, s.id, 'First-time consultation for chest discomfort'
        FROM inserted_patient p, inserted_slot s
        RETURNING id
    ),

-- ---------------------------------------------------------------------------
-- 1i. Payments
-- ---------------------------------------------------------------------------
    inserted_payment AS (
        INSERT INTO payments (appointment_id, amount, method, status, transaction_reference)
        SELECT a.id, 250.00, 'card', 'paid', 'TXN-001'
        FROM inserted_appointment a
        RETURNING id
    ),

-- ---------------------------------------------------------------------------
-- 1j. Reviews
-- ---------------------------------------------------------------------------
    inserted_review AS (
        INSERT INTO reviews (appointment_id, rating, comment)
        SELECT a.id, 5, 'Excellent doctor, very thorough examination.'
        FROM inserted_appointment a
        RETURNING id
    ),

-- ---------------------------------------------------------------------------
-- 1k. Notifications
-- ---------------------------------------------------------------------------
    inserted_notification AS (
        INSERT INTO notifications (user_id, title, message)
        SELECT pu.id, 'Appointment Confirmed', 'Your appointment with Dr. Smith has been confirmed for tomorrow at 09:00.'
        FROM inserted_patient_user pu
        RETURNING id
    )

-- ---------------------------------------------------------------------------
-- Confirm all IDs were generated
-- ---------------------------------------------------------------------------
SELECT 'Happy path inserts completed successfully.' AS result;

COMMIT;

-- =============================================================================
-- SECTION 2: CONSTRAINT VALIDATION
-- =============================================================================
-- All statements in this section are COMMENTED because they are expected to
-- fail. Uncomment them one at a time to verify each constraint.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 2a. Duplicate user email (violates users_email_unique)
-- ---------------------------------------------------------------------------
-- INSERT INTO users (email, password_hash, role)
-- VALUES ('dr.smith@clinic.com', 'some_hash', 'doctor');

-- ---------------------------------------------------------------------------
-- 2b. Duplicate specialty name (violates specialties_name_unique)
-- ---------------------------------------------------------------------------
-- INSERT INTO specialties (name) VALUES ('Cardiology');

-- ---------------------------------------------------------------------------
-- 2c. Duplicate appointment slot for same doctor/date/time
--      (violates appointment_slots_doctor_id_slot_date_start_time_unique)
-- ---------------------------------------------------------------------------
-- INSERT INTO appointment_slots (doctor_id, doctor_schedule_id, slot_date, start_time, end_time)
-- VALUES (
--     (SELECT id FROM doctors LIMIT 1),
--     (SELECT id FROM doctor_schedules LIMIT 1),
--     CURRENT_DATE + 1, '09:00:00', '09:30:00'
-- );

-- ---------------------------------------------------------------------------
-- 2d. Duplicate payment for the same appointment
--      (violates payments_appointment_id_unique)
-- ---------------------------------------------------------------------------
-- INSERT INTO payments (appointment_id, amount, method, status)
-- VALUES ((SELECT id FROM appointments LIMIT 1), 100.00, 'cash', 'pending');

-- ---------------------------------------------------------------------------
-- 2e. Duplicate review for the same appointment
--      (violates reviews_appointment_id_unique)
-- ---------------------------------------------------------------------------
-- INSERT INTO reviews (appointment_id, rating, comment)
-- VALUES ((SELECT id FROM appointments LIMIT 1), 3, 'Duplicate review');

-- ---------------------------------------------------------------------------
-- 2f. Invalid weekday (outside 0..6 range)
--      (violates doctor_schedules_weekday_check)
-- ---------------------------------------------------------------------------
-- INSERT INTO doctor_schedules (doctor_id, weekday, start_time, end_time, slot_duration)
-- VALUES ((SELECT id FROM doctors LIMIT 1), 7, '09:00:00', '17:00:00', 60);

-- ---------------------------------------------------------------------------
-- 2g. Negative consultation fee (violates doctors_consultation_fee_check)
-- ---------------------------------------------------------------------------
-- INSERT INTO doctors (user_id, clinic_id, specialty_id, consultation_fee, experience_years)
-- VALUES (
--     (SELECT id FROM users LIMIT 1),
--     (SELECT id FROM clinics LIMIT 1),
--     (SELECT id FROM specialties LIMIT 1),
--     -50.00, 5
-- );

-- ---------------------------------------------------------------------------
-- 2h. Amount <= 0 (violates payments_amount_check)
-- ---------------------------------------------------------------------------
-- INSERT INTO payments (appointment_id, amount, method, status)
-- VALUES ((SELECT id FROM appointments LIMIT 1), 0.00, 'cash', 'pending');

-- ---------------------------------------------------------------------------
-- 2i. Rating outside 1..5 range (violates reviews_rating_check)
-- ---------------------------------------------------------------------------
-- INSERT INTO reviews (appointment_id, rating, comment)
-- VALUES ((SELECT id FROM appointments LIMIT 1), 6, 'Invalid rating');

-- ---------------------------------------------------------------------------
-- 2j. end_time <= start_time on doctor_schedules
--      (violates doctor_schedules_end_time_check)
-- ---------------------------------------------------------------------------
-- INSERT INTO doctor_schedules (doctor_id, weekday, start_time, end_time, slot_duration)
-- VALUES ((SELECT id FROM doctors LIMIT 1), 2, '10:00:00', '09:00:00', 30);

-- ---------------------------------------------------------------------------
-- 2k. end_time <= start_time on appointment_slots
--      (violates appointment_slots_end_time_check)
-- ---------------------------------------------------------------------------
-- INSERT INTO appointment_slots (doctor_id, doctor_schedule_id, slot_date, start_time, end_time)
-- VALUES (
--     (SELECT id FROM doctors LIMIT 1),
--     (SELECT id FROM doctor_schedules LIMIT 1),
--     CURRENT_DATE + 2, '10:00:00', '09:30:00'
-- );

-- ---------------------------------------------------------------------------
-- 2l. FK referencing non-existing user
-- ---------------------------------------------------------------------------
-- INSERT INTO patients (user_id, full_name)
-- VALUES ('00000000-0000-0000-0000-000000000000', 'Ghost Patient');

-- ---------------------------------------------------------------------------
-- 2m. FK referencing non-existing clinic
-- ---------------------------------------------------------------------------
-- INSERT INTO doctors (user_id, clinic_id, specialty_id, consultation_fee, experience_years)
-- VALUES (
--     (SELECT id FROM users ORDER BY id DESC LIMIT 1),
--     '00000000-0000-0000-0000-000000000000',
--     (SELECT id FROM specialties LIMIT 1),
--     100.00, 3
-- );

-- ---------------------------------------------------------------------------
-- 2n. Duplicate doctor_schedules entry (violates unique constraint)
-- ---------------------------------------------------------------------------
-- INSERT INTO doctor_schedules (doctor_id, weekday, start_time, end_time, slot_duration)
-- SELECT doctor_id, weekday, start_time, end_time, slot_duration
-- FROM doctor_schedules LIMIT 1;

-- =============================================================================
-- SECTION 3: CASCADE / RESTRICT VALIDATION
-- =============================================================================
-- These statements are COMMENTED because they would modify or destroy data.
-- Uncomment them manually to test referential action behaviour.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 3a. ON DELETE CASCADE: users -> patients
--      Deleting a user should cascade-delete the linked patient.
-- ---------------------------------------------------------------------------
-- DELETE FROM users WHERE id = (SELECT user_id FROM patients LIMIT 1);
-- -- Verify: SELECT * FROM patients WHERE user_id = <deleted_user_id>;

-- ---------------------------------------------------------------------------
-- 3b. ON DELETE CASCADE: users -> doctors
--      Deleting a user should cascade-delete the linked doctor.
-- ---------------------------------------------------------------------------
-- DELETE FROM users WHERE id = (SELECT user_id FROM doctors LIMIT 1);
-- -- Verify: SELECT * FROM doctors WHERE user_id = <deleted_user_id>;

-- ---------------------------------------------------------------------------
-- 3c. ON DELETE CASCADE: users -> notifications
--      Deleting a user should cascade-delete all linked notifications.
-- ---------------------------------------------------------------------------
-- DELETE FROM users WHERE id = (SELECT user_id FROM notifications LIMIT 1);
-- -- Verify: SELECT * FROM notifications WHERE user_id = <deleted_user_id>;

-- ---------------------------------------------------------------------------
-- 3d. ON DELETE RESTRICT: clinics -> doctors
--      Deleting a clinic should be prevented when doctors reference it.
-- ---------------------------------------------------------------------------
-- DELETE FROM clinics WHERE id = (SELECT clinic_id FROM doctors LIMIT 1);
-- -- Expected: ERROR "violates foreign key constraint" with detail "still referenced"

-- ---------------------------------------------------------------------------
-- 3e. ON DELETE RESTRICT: specialties -> doctors
--      Deleting a specialty should be prevented when doctors reference it.
-- ---------------------------------------------------------------------------
-- DELETE FROM specialties WHERE id = (SELECT specialty_id FROM doctors LIMIT 1);
-- -- Expected: ERROR "violates foreign key constraint"

-- ---------------------------------------------------------------------------
-- 3f. ON DELETE RESTRICT: patients -> appointments
--      Deleting a patient should be prevented when appointments reference it.
-- ---------------------------------------------------------------------------
-- DELETE FROM patients WHERE id = (SELECT patient_id FROM appointments LIMIT 1);
-- -- Expected: ERROR "violates foreign key constraint"

-- ---------------------------------------------------------------------------
-- 3g. ON DELETE RESTRICT: appointment_slots -> appointments
--      Deleting a slot should be prevented when appointments reference it.
-- ---------------------------------------------------------------------------
-- DELETE FROM appointment_slots WHERE id = (SELECT slot_id FROM appointments LIMIT 1);
-- -- Expected: ERROR "violates foreign key constraint"

-- ---------------------------------------------------------------------------
-- 3h. ON DELETE RESTRICT: appointments -> payments
--      Deleting an appointment should be prevented when payments reference it.
-- ---------------------------------------------------------------------------
-- DELETE FROM appointments WHERE id = (SELECT appointment_id FROM payments LIMIT 1);
-- -- Expected: ERROR "violates foreign key constraint"

-- =============================================================================
-- SECTION 4: DEFAULT VALUE VALIDATION
-- =============================================================================

-- 4a. Verify users.role defaults to 'patient'
SELECT '4a. users.role DEFAULT' AS test,
       role = 'patient' AS passed
FROM users
WHERE role = 'patient'
LIMIT 1;

-- 4b. Verify users.is_verified defaults to FALSE
SELECT '4b. users.is_verified DEFAULT' AS test,
       is_verified = FALSE AS passed
FROM users
WHERE is_verified = FALSE
LIMIT 1;

-- 4c. Verify created_at is populated automatically
SELECT '4c. created_at TIMESTAMPTZ' AS test,
       created_at IS NOT NULL AS passed
FROM users
LIMIT 1;

-- 4d. Verify updated_at is populated automatically
SELECT '4d. updated_at TIMESTAMPTZ' AS test,
       updated_at IS NOT NULL AS passed
FROM users
LIMIT 1;

-- 4e. Verify appointment_slots.status defaults to 'available'
SELECT '4e. slot_status DEFAULT' AS test,
       status = 'available'::slot_status AS passed
FROM appointment_slots
WHERE status = 'available'
LIMIT 1;

-- 4f. Verify appointments.status defaults to 'scheduled'
SELECT '4f. appointment_status DEFAULT' AS test,
       status = 'scheduled'::appointment_status AS passed
FROM appointments
WHERE status = 'scheduled'
LIMIT 1;

-- 4g. Verify payments.status defaults to 'pending'
SELECT '4g. payment_status DEFAULT' AS test,
       status = 'pending'::payment_status AS passed
FROM payments
WHERE status = 'pending'
LIMIT 1;

-- =============================================================================
-- SECTION 5: ENUM VALIDATION
-- =============================================================================

-- 5a. List all ENUM types and their values
SELECT t.typname AS enum_name,
       e.enumlabel AS enum_value
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
ORDER BY t.typname, e.enumsortorder;

-- 5b. Confirm ENUM columns use the correct types
SELECT table_name, column_name, udt_name
FROM information_schema.columns
WHERE udt_name IN ('user_role', 'slot_status', 'appointment_status', 'payment_method', 'payment_status')
ORDER BY udt_name, table_name, column_name;

-- 5c. Invalid ENUM values (all COMMENTED — expected to fail)

-- Invalid user_role:
-- INSERT INTO users (email, password_hash, role)
-- VALUES ('bad@test.com', 'hash', 'invalid_role');
-- Expected: ERROR "invalid input value for enum user_role: 'invalid_role'"

-- Invalid slot_status:
-- UPDATE appointment_slots SET status = 'unknown' WHERE id = (SELECT id FROM appointment_slots LIMIT 1);
-- Expected: ERROR "invalid input value for enum slot_status: 'unknown'"

-- Invalid appointment_status:
-- INSERT INTO appointments (patient_id, slot_id, status)
-- VALUES (
--     (SELECT id FROM patients LIMIT 1),
--     (SELECT id FROM appointment_slots WHERE id NOT IN (SELECT slot_id FROM appointments) LIMIT 1),
--     'invalid_status'
-- );
-- Expected: ERROR "invalid input value for enum appointment_status: 'invalid_status'"

-- Invalid payment_method:
-- INSERT INTO payments (appointment_id, amount, method, status)
-- VALUES ((SELECT id FROM appointments LIMIT 1), 50.00, 'bitcoin', 'pending');
-- Expected: ERROR "invalid input value for enum payment_method: 'bitcoin'"

-- Invalid payment_status:
-- INSERT INTO payments (appointment_id, amount, method, status)
-- VALUES ((SELECT id FROM appointments LIMIT 1), 50.00, 'cash', 'unknown_status');
-- Expected: ERROR "invalid input value for enum payment_status: 'unknown_status'"

-- =============================================================================
-- SECTION 6: QUERY VALIDATION — Useful SELECTs for Manual Verification
-- =============================================================================

-- 6a. Doctors with specialty
SELECT
    d.id AS doctor_id,
    u.email AS doctor_email,
    s.name AS specialty,
    d.consultation_fee,
    d.experience_years
FROM doctors d
JOIN users u ON u.id = d.user_id
JOIN specialties s ON s.id = d.specialty_id;

-- 6b. Doctors by clinic
SELECT
    c.name AS clinic_name,
    c.city,
    u.email AS doctor_email,
    d.consultation_fee
FROM doctors d
JOIN users u ON u.id = d.user_id
JOIN clinics c ON c.id = d.clinic_id
ORDER BY c.name;

-- 6c. Doctor schedules
SELECT
    u.email AS doctor,
    ds.weekday,
    ds.start_time,
    ds.end_time,
    ds.slot_duration
FROM doctor_schedules ds
JOIN doctors d ON d.id = ds.doctor_id
JOIN users u ON u.id = d.user_id
ORDER BY ds.weekday, ds.start_time;

-- 6d. Available appointment slots
SELECT
    u.email AS doctor,
    a_slot.slot_date,
    a_slot.start_time,
    a_slot.end_time,
    a_slot.status
FROM appointment_slots a_slot
JOIN doctors d ON d.id = a_slot.doctor_id
JOIN users u ON u.id = d.user_id
WHERE a_slot.status = 'available'
ORDER BY a_slot.slot_date, a_slot.start_time;

-- 6e. Appointments with patient
SELECT
    a.id AS appointment_id,
    p.full_name AS patient,
    a_slot.slot_date,
    a_slot.start_time,
    a.status
FROM appointments a
JOIN patients p ON p.id = a.patient_id
JOIN appointment_slots a_slot ON a_slot.id = a.slot_id
ORDER BY a_slot.slot_date;

-- 6f. Appointments with doctor
SELECT
    a.id AS appointment_id,
    u.email AS doctor,
    p.full_name AS patient,
    a_slot.slot_date,
    a_slot.start_time,
    a.status
FROM appointments a
JOIN patients p ON p.id = a.patient_id
JOIN appointment_slots a_slot ON a_slot.id = a.slot_id
JOIN doctors d ON d.id = a_slot.doctor_id
JOIN users u ON u.id = d.user_id
ORDER BY a_slot.slot_date;

-- 6g. Payments
SELECT
    a.id AS appointment_id,
    p.full_name AS patient,
    pay.amount,
    pay.method,
    pay.status,
    pay.transaction_reference
FROM payments pay
JOIN appointments a ON a.id = pay.appointment_id
JOIN patients p ON p.id = a.patient_id;

-- 6h. Reviews
SELECT
    a.id AS appointment_id,
    p.full_name AS patient,
    r.rating,
    r.comment
FROM reviews r
JOIN appointments a ON a.id = r.appointment_id
JOIN patients p ON p.id = a.patient_id;

-- 6i. Unread notifications
SELECT
    n.title,
    n.message,
    u.email AS recipient
FROM notifications n
JOIN users u ON u.id = n.user_id
WHERE n.is_read = FALSE;

-- 6j. Summary counts
SELECT
    (SELECT COUNT(*) FROM users) AS total_users,
    (SELECT COUNT(*) FROM patients) AS total_patients,
    (SELECT COUNT(*) FROM doctors) AS total_doctors,
    (SELECT COUNT(*) FROM clinics) AS total_clinics,
    (SELECT COUNT(*) FROM specialties) AS total_specialties,
    (SELECT COUNT(*) FROM doctor_schedules) AS total_schedules,
    (SELECT COUNT(*) FROM appointment_slots) AS total_slots,
    (SELECT COUNT(*) FROM appointments) AS total_appointments,
    (SELECT COUNT(*) FROM payments) AS total_payments,
    (SELECT COUNT(*) FROM reviews) AS total_reviews,
    (SELECT COUNT(*) FROM notifications) AS total_notifications;
