CREATE INDEX IF NOT EXISTS idx_users_role ON users (role);
CREATE INDEX IF NOT EXISTS idx_users_deleted_at_partial ON users (deleted_at) WHERE deleted_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_patients_full_name ON patients (full_name);

CREATE INDEX IF NOT EXISTS idx_doctors_clinic_id ON doctors (clinic_id);
CREATE INDEX IF NOT EXISTS idx_doctors_specialty_id ON doctors (specialty_id);

CREATE INDEX IF NOT EXISTS idx_clinics_name ON clinics (name);
CREATE INDEX IF NOT EXISTS idx_clinics_city ON clinics (city);

CREATE INDEX IF NOT EXISTS idx_doctor_schedules_doctor_id ON doctor_schedules (doctor_id);

CREATE INDEX IF NOT EXISTS idx_appointment_slots_doctor_id ON appointment_slots (doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointment_slots_doctor_schedule_id ON appointment_slots (doctor_schedule_id);
CREATE INDEX IF NOT EXISTS idx_appointment_slots_slot_date_status ON appointment_slots (slot_date, status);
CREATE INDEX IF NOT EXISTS idx_appointment_slots_deleted_at_partial ON appointment_slots (deleted_at) WHERE deleted_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON appointments (patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments (status);

CREATE INDEX IF NOT EXISTS idx_payments_status ON payments (status);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications (user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id_is_read ON notifications (user_id, is_read);
