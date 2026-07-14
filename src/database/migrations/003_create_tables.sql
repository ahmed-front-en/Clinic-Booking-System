CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'patient',
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    CONSTRAINT users_email_unique UNIQUE (email)
);

CREATE TABLE clinics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    address TEXT,
    city VARCHAR(100),
    description TEXT
);

CREATE TABLE specialties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    CONSTRAINT specialties_name_unique UNIQUE (name)
);

CREATE TABLE doctors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    clinic_id UUID NOT NULL,
    specialty_id UUID NOT NULL,
    consultation_fee NUMERIC(10,2) NOT NULL,
    bio TEXT,
    experience_years SMALLINT NOT NULL DEFAULT 0,
    CONSTRAINT doctors_user_id_unique UNIQUE (user_id),
    CONSTRAINT doctors_consultation_fee_check CHECK (consultation_fee >= 0),
    CONSTRAINT doctors_experience_years_check CHECK (experience_years >= 0),
    CONSTRAINT doctors_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT doctors_clinic_id_fkey FOREIGN KEY (clinic_id) REFERENCES clinics(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT doctors_specialty_id_fkey FOREIGN KEY (specialty_id) REFERENCES specialties(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE doctor_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_id UUID NOT NULL,
    weekday SMALLINT NOT NULL,
    start_time TIME WITHOUT TIME ZONE NOT NULL,
    end_time TIME WITHOUT TIME ZONE NOT NULL,
    slot_duration SMALLINT NOT NULL,
    CONSTRAINT doctor_schedules_weekday_check CHECK (weekday BETWEEN 0 AND 6),
    CONSTRAINT doctor_schedules_end_time_check CHECK (end_time > start_time),
    CONSTRAINT doctor_schedules_slot_duration_check CHECK (slot_duration > 0),
    CONSTRAINT doctor_schedules_doctor_id_fkey FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT doctor_schedules_doctor_id_weekday_start_time_unique UNIQUE (doctor_id, weekday, start_time)
);

CREATE TABLE appointment_slots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_id UUID NOT NULL,
    doctor_schedule_id UUID NOT NULL,
    slot_date DATE NOT NULL,
    start_time TIME WITHOUT TIME ZONE NOT NULL,
    end_time TIME WITHOUT TIME ZONE NOT NULL,
    status slot_status NOT NULL DEFAULT 'available',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    CONSTRAINT appointment_slots_end_time_check CHECK (end_time > start_time),
    CONSTRAINT appointment_slots_doctor_id_fkey FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT appointment_slots_doctor_schedule_id_fkey FOREIGN KEY (doctor_schedule_id) REFERENCES doctor_schedules(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT appointment_slots_doctor_id_slot_date_start_time_unique UNIQUE (doctor_id, slot_date, start_time)
);

CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    gender VARCHAR(20),
    birth_date DATE,
    CONSTRAINT patients_user_id_unique UNIQUE (user_id),
    CONSTRAINT patients_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL,
    slot_id UUID NOT NULL,
    status appointment_status NOT NULL DEFAULT 'scheduled',
    notes TEXT,
    CONSTRAINT appointments_slot_id_unique UNIQUE (slot_id),
    CONSTRAINT appointments_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT appointments_slot_id_fkey FOREIGN KEY (slot_id) REFERENCES appointment_slots(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id UUID NOT NULL,
    amount NUMERIC(10,2) NOT NULL,
    method payment_method NOT NULL,
    status payment_status NOT NULL DEFAULT 'pending',
    transaction_reference VARCHAR(255),
    CONSTRAINT payments_appointment_id_unique UNIQUE (appointment_id),
    CONSTRAINT payments_transaction_reference_unique UNIQUE (transaction_reference),
    CONSTRAINT payments_amount_check CHECK (amount > 0),
    CONSTRAINT payments_appointment_id_fkey FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id UUID NOT NULL,
    rating SMALLINT NOT NULL,
    comment TEXT,
    CONSTRAINT reviews_appointment_id_unique UNIQUE (appointment_id),
    CONSTRAINT reviews_rating_check CHECK (rating BETWEEN 1 AND 5),
    CONSTRAINT reviews_appointment_id_fkey FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
);
