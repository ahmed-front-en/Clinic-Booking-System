# Screen Implementation Plan — Clinic Booking System

---

## Public Screens (No Auth Required)

### 1. Home Page

| Property | Value |
|----------|-------|
| **Route** | `/` |
| **Purpose** | Landing page with hero, CTA, featured doctors |
| **Role** | Anyone |
| **RSC/RCC** | Server Component (RSC) |
| **Components** | HeroSection, FeaturedDoctors, HowItWorks, Footer |
| **API Endpoints** | `GET /doctors` (featured subset) |
| **Data Displayed** | Hero image, 3-6 featured doctors, platform stats |
| **User Actions** | Click "Book Appointment" → `/doctors`, Click "Sign Up" → `/register` |
| **Loading State** | Skeleton hero, doctor card skeletons |
| **Empty State** | N/A (static page) |
| **Error State** | Static page still renders, doctor section shows "Unavailable" |

---

### 2. Doctor Listing

| Property | Value |
|----------|-------|
| **Route** | `/doctors` |
| **Purpose** | Browse and filter all doctors |
| **Role** | Anyone |
| **RSC/RCC** | RSC with client filter controls |
| **Components** | DoctorCard, FilterBar (Client), SearchInput (Client), Pagination |
| **API Endpoints** | `GET /doctors`, `GET /clinics` (for filter), `GET /specialties` (for filter) |
| **Data Displayed** | Doctor cards: name, specialty, clinic, city, fee, experience, rating |
| **User Actions** | Search, filter by clinic/specialty, click doctor → detail |
| **Loading State** | 8 skeleton cards in grid |
| **Empty State** | "No doctors found matching your criteria" + "Clear filters" |
| **Error State** | Error message + "Retry" button |

---

### 3. Doctor Detail

| Property | Value |
|----------|-------|
| **Route** | `/doctors/[id]` |
| **Purpose** | View full doctor profile and availability |
| **Role** | Anyone |
| **RSC/RCC** | RSC (ISR, revalidate every 5 min) |
| **Components** | DoctorProfile, SchedulePreview, ReviewList (if public), BookAppointmentCTA |
| **API Endpoints** | `GET /doctors/:id`, `GET /doctor-schedules/doctor/:doctorId` |
| **Data Displayed** | Full doctor info, weekly schedule template, bio, fee |
| **User Actions** | Click "Book Appointment" → `/login` (if unauthenticated) or `/book?doctorId=:id` |
| **Loading State** | Profile skeleton |
| **Empty State** | N/A (404 if not found) |
| **Error State** | 404 page or error retry |

---

### 4. Clinic Listing

| Property | Value |
|----------|-------|
| **Route** | `/clinics` |
| **Purpose** | Browse clinic locations |
| **Role** | Anyone |
| **RSC/RCC** | RSC |
| **Components** | ClinicCard, SearchInput |
| **API Endpoints** | `GET /clinics` |
| **Data Displayed** | Clinic name, city, phone, address |
| **User Actions** | Click clinic → filter doctors by clinic |
| **Loading State** | 6 skeleton cards |
| **Empty State** | "No clinics registered yet" |
| **Error State** | Error message + retry |

---

### 5. Specialty Listing

| Property | Value |
|----------|-------|
| **Route** | `/specialties` |
| **Purpose** | Browse medical specialties |
| **Role** | Anyone |
| **RSC/RCC** | RSC |
| **Components** | SpecialtyCard, SpecialtyGrid |
| **API Endpoints** | `GET /specialties` |
| **Data Displayed** | Specialty names, doctor count (future) |
| **User Actions** | Click specialty → filter doctors by specialty |
| **Loading State** | Skeleton grid |
| **Empty State** | "No specialties available" |
| **Error State** | Error retry |

---

### 6. Available Appointment Slots (Public)

| Property | Value |
|----------|-------|
| **Route** | `/doctors/[id]/slots` (or inline on doctor detail) |
| **Purpose** | View available time slots for a doctor |
| **Role** | Anyone (but booking requires auth) |
| **RSC/RCC** | RCC (date picker interaction) |
| **Components** | DatePicker, SlotGrid, SlotButton |
| **API Endpoints** | `GET /appointment-slots/available?doctorId=:id&date=:date` |
| **Data Displayed** | Available time slots for selected date |
| **User Actions** | Select date, view slots (booking requires login) |
| **Loading State** | Date picker ready, slot area skeleton |
| **Empty State** | "No available slots for this date" + date picker to try another |
| **Error State** | Error toast + retry |

---

## Auth Screens

### 7. Login

| Property | Value |
|----------|-------|
| **Route** | `/login` |
| **Purpose** | User authentication |
| **Role** | Unauthenticated only |
| **RSC/RCC** | RCC |
| **Components** | LoginForm, SocialLogin (future), AuthCard |
| **API Endpoints** | `POST /auth/login` |
| **Data Displayed** | Login form |
| **User Actions** | Enter email + password, submit, redirect to intended page |
| **Loading State** | Submit button spinner |
| **Empty State** | N/A |
| **Error State** | "Invalid email or password" form error |

---

### 8. Registration

| Property | Value |
|----------|-------|
| **Route** | `/register` |
| **Purpose** | New patient account creation |
| **Role** | Unauthenticated only |
| **RSC/RCC** | RCC |
| **Components** | RegisterForm, AuthCard |
| **API Endpoints** | `POST /auth/register` |
| **Data Displayed** | Registration form |
| **User Actions** | Enter email + password + name, submit, auto-login and redirect |
| **Loading State** | Submit button spinner |
| **Empty State** | N/A |
| **Error State** | Inline field errors (validation, email taken) |

---

## Patient Screens (Authenticated + Patient Role)

### 9. Patient Dashboard

| Property | Value |
|----------|-------|
| **Route** | `/dashboard` |
| **Purpose** | Patient home with overview |
| **Role** | Patient |
| **RSC/RCC** | RSC + client sub-components |
| **Components** | UpcomingAppointments, QuickActions, RecentActivity |
| **API Endpoints** | `GET /appointments/mine`, `GET /patients/me` |
| **Data Displayed** | Next appointment, count of upcoming, quick book CTA |
| **User Actions** | View upcoming, navigate to booking, view appointments |
| **Loading State** | Dashboard skeleton |
| **Empty State** | "No upcoming appointments" + "Book your first appointment" CTA |
| **Error State** | Error toast + retry for each section |

---

### 10. Book Appointment Flow

| Property | Value |
|----------|-------|
| **Route** | `/book?doctorId=xxx` |
| **Purpose** | Select doctor, date, slot, and confirm booking |
| **Role** | Patient |
| **RSC/RCC** | RCC (multi-step form) |
| **Components** | StepIndicator, DoctorSelector, DatePicker, SlotGrid, BookingSummary, ConfirmButton |
| **API Endpoints** | `GET /doctors/:id`, `GET /appointment-slots/available`, `POST /appointments` |
| **Data Displayed** | Doctor info, date picker, available slots, booking summary |
| **User Actions** | Select date → view slots → select slot → confirm → redirect to appointments |
| **Loading State** | Step-by-step skeleton loading |
| **Empty State** | "No slots available" per date |
| **Error State** | Slot conflict toast + refresh, validation errors |
| **Optimistic** | Slot shows "selected" immediately, "booked" on success |

---

### 11. Patient Appointments List

| Property | Value |
|----------|-------|
| **Route** | `/appointments` |
| **Purpose** | View all own appointments |
| **Role** | Patient |
| **RSC/RCC** | RCC (TanStack Query, tabs) |
| **Components** | AppointmentCard, StatusBadge, FilterTabs, CancelDialog |
| **API Endpoints** | `GET /appointments/mine` |
| **Data Displayed** | Appointment list: doctor, clinic, date, time, status, payment, review |
| **User Actions** | Cancel appointment, navigate to detail, pay, review |
| **Loading State** | 5 skeleton appointment cards |
| **Empty State** | "No appointments yet" + "Book an Appointment" CTA |
| **Error State** | Error toast + retry |

---

### 12. Patient Appointment Detail

| Property | Value |
|----------|-------|
| **Route** | `/appointments/[id]` |
| **Purpose** | View single appointment with actions |
| **Role** | Patient |
| **RSC/RCC** | RCC |
| **Components** | AppointmentInfo, PaymentSection, ReviewSection, CancelButton |
| **API Endpoints** | `GET /appointments/mine` (filter client-side), `POST /payments`, `POST /reviews` |
| **Data Displayed** | Full appointment info, payment status, review if exists |
| **User Actions** | Pay (if unpaid), write review (if completed), cancel (if cancellable) |
| **Loading State** | Appointment detail skeleton |
| **Empty State** | N/A (404 if not found) |
| **Error State** | 404 or error retry |

---

### 13. Patient Payments

| Property | Value |
|----------|-------|
| **Route** | `/payments` |
| **Purpose** | View own payment history |
| **Role** | Patient |
| **RSC/RCC** | RCC |
| **Components** | PaymentCard, PaymentStatusBadge |
| **API Endpoints** | `GET /payments/mine` |
| **Data Displayed** | Payment list: appointment, amount, method, status, date |
| **User Actions** | View payment details |
| **Loading State** | 5 skeleton cards |
| **Empty State** | "No payments yet" |
| **Error State** | Error retry |

---

### 14. Patient Reviews

| Property | Value |
|----------|-------|
| **Route** | `/reviews` |
| **Purpose** | View own reviews |
| **Role** | Patient |
| **RSC/RCC** | RCC |
| **Components** | ReviewCard, StarRating, ReviewForm (dialog) |
| **API Endpoints** | `GET /reviews/mine` |
| **Data Displayed** | Review list: appointment, rating, comment, date |
| **User Actions** | Write new review (from completed appointment) |
| **Loading State** | Skeleton cards |
| **Empty State** | "No reviews yet" |
| **Error State** | Error retry |

---

### 15. Patient Profile

| Property | Value |
|----------|-------|
| **Route** | `/profile` |
| **Purpose** | View and edit own profile |
| **Role** | Patient |
| **RSC/RCC** | RCC |
| **Components** | ProfileForm, ProfileDisplay |
| **API Endpoints** | `GET /patients/me`, `PATCH /patients/me` |
| **Data Displayed** | Name, phone, gender, birth date |
| **User Actions** | Edit fields, save |
| **Loading State** | Form skeleton |
| **Empty State** | N/A |
| **Error State** | Validation errors inline, save error toast |

---

## Doctor Screens (Authenticated + Doctor Role)

### 16. Doctor Dashboard

| Property | Value |
|----------|-------|
| **Route** | `/dashboard` |
| **Purpose** | Doctor overview |
| **Role** | Doctor |
| **RSC/RCC** | RSC + client sub-components |
| **Components** | TodayAppointments, UpcomingAppointments, ScheduleSummary |
| **API Endpoints** | `GET /appointments/mine`, `GET /doctor-schedules/me` |
| **Data Displayed** | Today's appointments, upcoming count, schedule summary |
| **User Actions** | View appointment details |
| **Loading State** | Dashboard skeleton |
| **Empty State** | "No appointments today" |
| **Error State** | Error retry |

---

### 17. Doctor Appointments

| Property | Value |
|----------|-------|
| **Route** | `/appointments` |
| **Purpose** | View appointments for own slots |
| **Role** | Doctor |
| **RSC/RCC** | RCC |
| **Components** | AppointmentCard, StatusBadge, FilterTabs |
| **API Endpoints** | `GET /appointments/mine` |
| **Data Displayed** | Appointment list: patient name, date, time, status |
| **User Actions** | Cancel appointment (if cancellable) |
| **Loading State** | Skeleton cards |
| **Empty State** | "No appointments assigned" |
| **Error State** | Error retry |

---

### 18. Doctor Schedule

| Property | Value |
|----------|-------|
| **Route** | `/schedule` |
| **Purpose** | View own weekly schedule |
| **Role** | Doctor |
| **RSC/RCC** | RCC |
| **Components** | WeeklyScheduleView, ScheduleDayCard |
| **API Endpoints** | `GET /doctor-schedules/me` |
| **Data Displayed** | Weekly schedule: days worked, time ranges, slot duration |
| **User Actions** | Read-only (admin manages schedules) |
| **Loading State** | Weekly grid skeleton |
| **Empty State** | "No schedule defined. Contact admin." |
| **Error State** | Error retry |

---

## Admin Screens (Authenticated + Admin Role)

### 19. Admin Dashboard

| Property | Value |
|----------|-------|
| **Route** | `/admin` or `/admin/dashboard` |
| **Purpose** | Admin overview with stats |
| **Role** | Admin |
| **RSC/RCC** | RSC + client |
| **Components** | StatCard (doctors, patients, appts, revenue), RecentAppointments, QuickActions |
| **API Endpoints** | `GET /admin/doctors`, `GET /admin/patients`, `GET /appointments`, `GET /admin/payments` (with aggregations) |
| **Data Displayed** | Counts, recent appointments, revenue summary |
| **User Actions** | Click stat cards → management pages |
| **Loading State** | 4 stat skeleton cards, table skeleton |
| **Empty State** | "No data yet" per card |
| **Error State** | Error per stat card |

---

### 20. Admin — Doctor Management

| Property | Value |
|----------|-------|
| **Route** | `/admin/doctors` |
| **Purpose** | Full CRUD for doctors |
| **Role** | Admin |
| **RSC/RCC** | RCC |
| **Components** | DataTable, DoctorForm (dialog), ConfirmDeleteDialog, SearchInput, FilterDropdown |
| **API Endpoints** | `GET /admin/doctors`, `POST /admin/doctors`, `PATCH /admin/doctors/:id`, `DELETE /admin/doctors/:id` |
| **Data Displayed** | Table: name, specialty, clinic, fee, experience, actions |
| **User Actions** | Create, edit, delete, search, filter |
| **Loading State** | Table skeleton |
| **Empty State** | "No doctors registered" + "Add Doctor" CTA |
| **Error State** | Error toast + retry |

---

### 21. Admin — Clinic Management

| Property | Value |
|----------|-------|
| **Route** | `/admin/clinics` |
| **Purpose** | Full CRUD for clinics |
| **Role** | Admin |
| **RSC/RCC** | RCC |
| **Components** | DataTable, ClinicForm (dialog), ConfirmDeleteDialog |
| **API Endpoints** | `GET /admin/clinics`, `POST /admin/clinics`, `PATCH /admin/clinics/:id`, `DELETE /admin/clinics/:id` |
| **Data Displayed** | Table: name, city, phone, doctors count |
| **User Actions** | Create, edit, delete (RESTRICT if doctors assigned) |
| **Loading State** | Table skeleton |
| **Empty State** | "No clinics registered" |
| **Error State** | Toast + retry |

---

### 22. Admin — Specialty Management

| Property | Value |
|----------|-------|
| **Route** | `/admin/specialties` |
| **Purpose** | Full CRUD for specialties |
| **Role** | Admin |
| **RSC/RCC** | RCC |
| **Components** | DataTable, SpecialtyForm (dialog), ConfirmDeleteDialog |
| **API Endpoints** | `GET /admin/specialties`, `POST /admin/specialties`, `PATCH /admin/specialties/:id`, `DELETE /admin/specialties/:id` |
| **Data Displayed** | Table: name, doctor count |
| **User Actions** | Create, edit, delete |
| **Loading State** | Table skeleton |
| **Empty State** | "No specialties registered" |
| **Error State** | Toast + retry |

---

### 23. Admin — User Management

| Property | Value |
|----------|-------|
| **Route** | `/admin/users` |
| **Purpose** | Manage user accounts |
| **Role** | Admin |
| **RSC/RCC** | RCC |
| **Components** | DataTable, UserEditForm, ConfirmDeleteDialog, FilterDropdown |
| **API Endpoints** | `GET /admin/users`, `PATCH /admin/users/:id`, `DELETE /admin/users/:id` |
| **Data Displayed** | Table: email, role, verified, created, deleted status |
| **User Actions** | Edit role/email/verified, soft-delete |
| **Loading State** | Table skeleton |
| **Empty State** | "No users" |
| **Error State** | Toast + retry |

---

### 24. Admin — Appointment Management

| Property | Value |
|----------|-------|
| **Route** | `/admin/appointments` |
| **Purpose** | Manage all appointments |
| **Role** | Admin |
| **RSC/RCC** | RCC |
| **Components** | DataTable, AppointmentDetail, StatusDropdown, ConfirmCancelDialog, FilterTabs |
| **API Endpoints** | `GET /appointments`, `PATCH /appointments/:id`, `DELETE /appointments/:id` |
| **Data Displayed** | Table: patient, doctor, date, time, status, payment |
| **User Actions** | Change status, cancel, delete, filter by status/date/doctor |
| **Loading State** | Table skeleton |
| **Empty State** | "No appointments found" |
| **Error State** | Toast + retry |

---

### 25. Admin — Schedule Management

| Property | Value |
|----------|-------|
| **Route** | `/admin/schedules` |
| **Purpose** | Manage doctor schedules and slots |
| **Role** | Admin |
| **RSC/RCC** | RCC |
| **Components** | DataTable, ScheduleForm (dialog), SlotForm (dialog), DoctorSelect |
| **API Endpoints** | `GET /doctor-schedules`, `POST /doctor-schedules`, `PATCH /doctor-schedules/:id`, `DELETE /doctor-schedules/:id`, `GET /admin/appointment-slots`, `POST /admin/appointment-slots` |
| **Data Displayed** | Schedule entries: doctor, weekday, hours, slot duration. Slots: doctor, date, time, status |
| **User Actions** | Create/edit/delete schedules, create individual slots |
| **Loading State** | Table skeleton |
| **Empty State** | "No schedules defined" |
| **Error State** | Toast + retry |

---

### 26. Admin — Payment Management

| Property | Value |
|----------|-------|
| **Route** | `/admin/payments` |
| **Purpose** | View all payment records |
| **Role** | Admin |
| **RSC/RCC** | RCC |
| **Components** | DataTable, PaymentDetail, FilterTabs |
| **API Endpoints** | `GET /payments`, `PATCH /payments/:id`, `DELETE /payments/:id` |
| **Data Displayed** | Table: patient, appointment, amount, method, status |
| **User Actions** | Update payment status, delete |
| **Loading State** | Table skeleton |
| **Empty State** | "No payments recorded" |
| **Error State** | Toast + retry |

---

### 27. Admin — Review Management

| Property | Value |
|----------|-------|
| **Route** | `/admin/reviews` |
| **Purpose** | View all reviews |
| **Role** | Admin |
| **RSC/RCC** | RCC |
| **Components** | DataTable, ReviewDetail |
| **API Endpoints** | `GET /reviews`, `PATCH /reviews/:id`, `DELETE /reviews/:id` |
| **Data Displayed** | Table: patient, appointment, rating, comment, date |
| **User Actions** | Edit review, delete review |
| **Loading State** | Table skeleton |
| **Empty State** | "No reviews yet" |
| **Error State** | Toast + retry |

---

## Screen Summary

| # | Screen | Route | Role | RSC/RCC |
|---|--------|-------|------|---------|
| 1 | Home | `/` | Public | RSC |
| 2 | Doctor Listing | `/doctors` | Public | RSC+Client |
| 3 | Doctor Detail | `/doctors/[id]` | Public | RSC (ISR) |
| 4 | Clinic Listing | `/clinics` | Public | RSC |
| 5 | Specialty Listing | `/specialties` | Public | RSC |
| 6 | Available Slots | `/doctors/[id]/slots` | Public | RCC |
| 7 | Login | `/login` | Unauth | RCC |
| 8 | Register | `/register` | Unauth | RCC |
| 9 | Patient Dashboard | `/dashboard` | Patient | RSC+Client |
| 10 | Book Appointment | `/book` | Patient | RCC |
| 11 | Patient Appointments | `/appointments` | Patient | RCC |
| 12 | Patient Appointment Detail | `/appointments/[id]` | Patient | RCC |
| 13 | Patient Payments | `/payments` | Patient | RCC |
| 14 | Patient Reviews | `/reviews` | Patient | RCC |
| 15 | Patient Profile | `/profile` | Patient | RCC |
| 16 | Doctor Dashboard | `/dashboard` | Doctor | RSC+Client |
| 17 | Doctor Appointments | `/appointments` | Doctor | RCC |
| 18 | Doctor Schedule | `/schedule` | Doctor | RCC |
| 19 | Admin Dashboard | `/admin` | Admin | RSC+Client |
| 20 | Admin Doctors | `/admin/doctors` | Admin | RCC |
| 21 | Admin Clinics | `/admin/clinics` | Admin | RCC |
| 22 | Admin Specialties | `/admin/specialties` | Admin | RCC |
| 23 | Admin Users | `/admin/users` | Admin | RCC |
| 24 | Admin Appointments | `/admin/appointments` | Admin | RCC |
| 25 | Admin Schedules | `/admin/schedules` | Admin | RCC |
| 26 | Admin Payments | `/admin/payments` | Admin | RCC |
| 27 | Admin Reviews | `/admin/reviews` | Admin | RCC |

**Total Screens: 27**
- Public: 6
- Auth: 2
- Patient: 7
- Doctor: 3
- Admin: 9
