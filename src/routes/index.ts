import { Router } from "express";
import { authRouter } from "../modules/auth/index.js";
import { clinicRouter } from "../modules/clinics/index.js";
import { specialtyRouter } from "../modules/specialties/index.js";
import { doctorRouter } from "../modules/doctors/index.js";
import { doctorScheduleRouter } from "../modules/doctor-schedules/index.js";
import { appointmentSlotRouter } from "../modules/appointment-slots/index.js";
import { appointmentRouter } from "../modules/appointments/index.js";
import { paymentRouter } from "../modules/payments/index.js";
import { reviewRouter } from "../modules/reviews/index.js";
import { patientRouter } from "../modules/patients/index.js";

const router = Router();

router.use("/auth", authRouter);
router.use("/admin/clinics", clinicRouter);
router.use("/admin/specialties", specialtyRouter);
router.use("/admin/doctors", doctorRouter);
router.use("/admin/doctor-schedules", doctorScheduleRouter);
router.use("/admin/appointment-slots", appointmentSlotRouter);
router.use("/admin/appointments", appointmentRouter);
router.use("/admin/payments", paymentRouter);
router.use("/admin/reviews", reviewRouter);
router.use("/admin/patients", patientRouter);

export default router;
