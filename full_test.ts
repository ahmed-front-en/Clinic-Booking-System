import app from "./src/app.js";
import { pool } from "./src/services/database.service.js";
import { runMigrations } from "./src/services/migration.service.js";
import bcrypt from "bcrypt";
import http from "node:http";

async function req(method: string, path: string, body?: unknown, token?: string) {
  return new Promise<{ status: number; body: any }>((resolve) => {
    const opts: http.RequestOptions = {
      hostname: "localhost",
      port: 3001,
      path,
      method,
      headers: { "Content-Type": "application/json" },
    };
    if (token) opts.headers!["Authorization"] = `Bearer ${token}`;
    const r = http.request(opts, (res) => {
      let data = "";
      res.on("data", (c) => (data += c));
      res.on("end", () => {
        try { resolve({ status: res.statusCode!, body: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode!, body: { raw: data } }); }
      });
    });
    r.on("error", (e) => resolve({ status: 0, body: { error: e.message } }));
    if (body) r.write(JSON.stringify(body));
    r.end();
  });
}

async function main() {
  console.log("Starting server...");
  await runMigrations(pool);
  app.listen(3001, async () => {
    console.log("Server running on 3001");

    const pass = await bcrypt.hash("AdminPass123!", 12);
    await pool.query(
      "INSERT INTO users (email, password_hash, role, is_verified) VALUES ($1, $2, 'admin', true) ON CONFLICT (email) DO UPDATE SET password_hash = $2",
      ["admin@clinic.com", pass]
    );
    console.log("Admin seeded/updated");

    const results: any[] = [];
    function test(name: string, actual: number, expected: number, note?: string) {
      const ok = actual === expected;
      results.push({ name, ok, actual, expected, note });
      console.log(`  ${ok ? "PASS" : "FAIL"} [${actual}] ${name}${note ? " - " + note : ""}`);
    }

    // AUTH
    console.log("\n=== AUTH ===");
    let r = await req("POST", "/api/v1/auth/login", { email: "admin@clinic.com", password: "AdminPass123!" });
    test("Login", r.status, 200);
    const token = r.body?.data?.accessToken || "";
    const refresh = r.body?.data?.refreshToken || "";

    r = await req("GET", "/api/v1/auth/me", null, token);
    test("GET /auth/me", r.status, 200);

    // CLINICS
    console.log("\n=== CLINICS ===");
    r = await req("POST", "/api/v1/admin/clinics", { name: "Test Clinic", city: "NYC" }, token);
    test("Create Clinic", r.status, 201);
    const clinicId = r.body?.data?.id;

    r = await req("GET", "/api/v1/admin/clinics", null, token);
    test("Get All Clinics", r.status, 200);
    r = await req("GET", `/api/v1/admin/clinics/${clinicId}`, null, token);
    test("Get Clinic By ID", r.status, 200);
    r = await req("PATCH", `/api/v1/admin/clinics/${clinicId}`, { name: "Updated" }, token);
    test("Update Clinic", r.status, 200);
    r = await req("DELETE", `/api/v1/admin/clinics/${clinicId}`, null, token);
    test("Delete Clinic", r.status, 200, `Got ${r.status}, 200 or 204 acceptable`);

    // SPECIALTIES
    console.log("\n=== SPECIALTIES ===");
    r = await req("POST", "/api/v1/admin/specialties", { name: "Cardiology" }, token);
    test("Create Specialty", r.status, 201);
    const specId = r.body?.data?.id;
    r = await req("GET", "/api/v1/admin/specialties", null, token);
    test("Get All Specialties", r.status, 200);
    r = await req("GET", `/api/v1/admin/specialties/${specId}`, null, token);
    test("Get Specialty By ID", r.status, 200);
    r = await req("PATCH", `/api/v1/admin/specialties/${specId}`, { name: "Neurology" }, token);
    test("Update Specialty", r.status, 200);

    // DOCTORS
    console.log("\n=== DOCTORS ===");
    r = await req("POST", "/api/v1/admin/doctors", {
      email: "dr@test.com", password: "Pass123!", fullName: "Dr Test",
      clinicId, specialtyId: specId, consultationFee: 150, experienceYears: 5
    }, token);
    test("Create Doctor", r.status, 201);
    const docId = r.body?.data?.id;

    r = await req("GET", "/api/v1/admin/doctors", null, token);
    test("Get All Doctors", r.status, 200);
    r = await req("GET", `/api/v1/admin/doctors/${docId}`, null, token);
    test("Get Doctor By ID", r.status, 200);
    r = await req("PATCH", `/api/v1/admin/doctors/${docId}`, { consultationFee: 200 }, token);
    test("Update Doctor", r.status, 200);

    // DOCTOR SCHEDULES
    console.log("\n=== SCHEDULES ===");
    r = await req("POST", "/api/v1/admin/doctor-schedules", {
      doctorId: docId, weekday: 1, startTime: "09:00", endTime: "17:00", slotDuration: 30
    }, token);
    test("Create Schedule", r.status, 201);
    const schedId = r.body?.data?.id;

    r = await req("GET", "/api/v1/admin/doctor-schedules", null, token);
    test("Get All Schedules", r.status, 200);
    r = await req("GET", `/api/v1/admin/doctor-schedules/${schedId}`, null, token);
    test("Get Schedule By ID", r.status, 200);
    r = await req("GET", `/api/v1/admin/doctor-schedules/doctor/${docId}`, null, token);
    test("Get Schedules By Doctor", r.status, 200);
    r = await req("PATCH", `/api/v1/admin/doctor-schedules/${schedId}`, { slotDuration: 45 }, token);
    test("Update Schedule", r.status, 200);

    // APPOINTMENT SLOTS - SOFT DELETE
    console.log("\n=== APPOINTMENT SLOTS (SOFT DELETE) ===");
    r = await req("POST", "/api/v1/admin/appointment-slots", {
      doctorId: docId, doctorScheduleId: schedId, slotDate: "2026-07-20", startTime: "09:00", endTime: "09:30"
    }, token);
    test("Create Slot 1", r.status, 201);
    const slot1Id = r.body?.data?.id;

    r = await req("POST", "/api/v1/admin/appointment-slots", {
      doctorId: docId, doctorScheduleId: schedId, slotDate: "2026-07-20", startTime: "10:00", endTime: "10:30"
    }, token);
    test("Create Slot 2", r.status, 201);
    const slot2Id = r.body?.data?.id;

    // Pre-delete count
    r = await req("GET", "/api/v1/admin/appointment-slots", null, token);
    const preCount = Array.isArray(r.body?.data) ? r.body.data.length : 0;
    console.log(`  Pre-delete count: ${preCount}`);

    // Update slot
    r = await req("PATCH", `/api/v1/admin/appointment-slots/${slot1Id}`, { startTime: "09:15", endTime: "09:45" }, token);
    test("Update Slot", r.status, 200);

    // SOFT DELETE
    r = await req("DELETE", `/api/v1/admin/appointment-slots/${slot2Id}`, null, token);
    test("Soft Delete Slot 2", r.status, 200);

    // POST-DELETE VERIFICATION
    // 1. findById on deleted -> 404
    r = await req("GET", `/api/v1/admin/appointment-slots/${slot2Id}`, null, token);
    test("findById(deleted) -> 404", r.status, 404);

    // 2. findAll excludes deleted
    r = await req("GET", "/api/v1/admin/appointment-slots", null, token);
    const postCount = Array.isArray(r.body?.data) ? r.body.data.length : 0;
    test(`Count decreased (${preCount} -> ${postCount})`, postCount, preCount - 1);

    // 3. findByDoctor excludes deleted
    r = await req("GET", `/api/v1/admin/appointment-slots/doctor/${docId}`, null, token);
    const docCount = Array.isArray(r.body?.data) ? r.body.data.length : 0;
    test(`findByDoctor count (${docCount})`, docCount, preCount - 1);

    // 4. findByDate excludes deleted
    r = await req("GET", "/api/v1/admin/appointment-slots/date/2026-07-20", null, token);
    const dateCount = Array.isArray(r.body?.data) ? r.body.data.length : 0;
    test(`findByDate count (${dateCount})`, dateCount, preCount - 1);

    // 5. findAvailable excludes deleted
    r = await req("GET", `/api/v1/admin/appointment-slots/available?doctorId=${docId}`, null, token);
    const availCount = Array.isArray(r.body?.data) ? r.body.data.length : 0;
    test(`findAvailable count (${availCount})`, availCount, preCount - 1);

    // 6. Update deleted slot -> 404
    r = await req("PATCH", `/api/v1/admin/appointment-slots/${slot2Id}`, { startTime: "11:00" }, token);
    test("Update deleted slot -> 404", r.status, 404);

    // 7. Duplicate detection ignores soft-deleted slots
    r = await req("POST", "/api/v1/admin/appointment-slots", {
      doctorId: docId, doctorScheduleId: schedId, slotDate: "2026-07-20", startTime: "10:00", endTime: "10:30"
    }, token);
    test("Create duplicate of deleted (should succeed)", r.status, 201);

    // PATIENT REGISTRATION
    console.log("\n=== PATIENT ===");
    r = await req("POST", "/api/v1/auth/register", { email: "patient@test.com", password: "PatientPass123!", fullName: "John Patient" });
    test("Register Patient", r.status, 201);

    // APPOINTMENTS
    console.log("\n=== APPOINTMENTS ===");
    r = await req("POST", "/api/v1/admin/appointments", { patientId: "00000000-0000-0000-0000-000000000000", slotId: slot1Id, notes: "Test" }, token);
    // Need real patient ID - get it
    const pLogin = await req("POST", "/api/v1/auth/login", { email: "patient@test.com", password: "PatientPass123!" });
    const pToken = pLogin.body?.data?.accessToken || "";
    const pMe = await req("GET", "/api/v1/auth/me", null, pToken);
    let patientId = pMe.body?.data?.patientId || pMe.body?.data?.id || "";

    r = await req("POST", "/api/v1/admin/appointments", { patientId, slotId: slot1Id, notes: "Checkup" }, token);
    test("Create Appointment", r.status, 201);
    const apptId = r.body?.data?.id;

    r = await req("GET", "/api/v1/admin/appointments", null, token);
    test("Get All Appointments", r.status, 200);
    r = await req("GET", `/api/v1/admin/appointments/${apptId}`, null, token);
    test("Get Appointment By ID", r.status, 200);
    r = await req("GET", `/api/v1/admin/appointments/patient/${patientId}`, null, token);
    test("Get Appointments By Patient", r.status, 200);
    r = await req("GET", `/api/v1/admin/appointments/doctor/${docId}`, null, token);
    test("Get Appointments By Doctor", r.status, 200);
    r = await req("PATCH", `/api/v1/admin/appointments/${apptId}`, { notes: "Updated" }, token);
    test("Update Appointment", r.status, 200);
    r = await req("DELETE", `/api/v1/admin/appointments/${apptId}`, null, token);
    test("Delete Appointment", r.status, 200);

    // ERROR CASES
    console.log("\n=== ERROR CASES ===");
    r = await req("POST", "/api/v1/auth/register", { email: "patient@test.com", password: "PatientPass123!", fullName: "Dup" });
    test("Duplicate email -> 409", r.status, 409);
    r = await req("POST", "/api/v1/auth/login", { email: "admin@clinic.com", password: "wrong" });
    test("Wrong password -> 401", r.status, 401);
    r = await req("GET", "/api/v1/admin/appointment-slots", null, null);
    test("No auth -> 401", r.status, 401);
    r = await req("GET", "/api/v1/admin/appointment-slots", null, "invalid");
    test("Invalid token -> 401", r.status, 401);

    // REPORT
    console.log("\n" + "=".repeat(60));
    const passed = results.filter((r) => r.ok).length;
    const failed = results.filter((r) => !r.ok).length;
    console.log(`TOTAL: ${results.length} | PASSED: ${passed} | FAILED: ${failed}`);
    console.log("=".repeat(60));
    if (failed > 0) {
      console.log("\nFAILURES:");
      results.filter((r) => !r.ok).forEach((r) =>
        console.log(`  ${r.name}: got ${r.actual}, expected ${r.expected}${r.note ? " (" + r.note + ")" : ""}`)
      );
    }

    // DATABASE VERIFICATION
    console.log("\n=== DATABASE VERIFICATION ===");
    const dbCheck = await pool.query(`
      SELECT id, status, deleted_at IS NOT NULL AS is_deleted,
             updated_at > created_at AS updated_after_create
      FROM appointment_slots ORDER BY created_at
    `);
    console.table(dbCheck.rows);

    await pool.end();
    process.exit(failed > 0 ? 1 : 0);
  });
}

main().catch((e) => { console.error(e); process.exit(1); });
