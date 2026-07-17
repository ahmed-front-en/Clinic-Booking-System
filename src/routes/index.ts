import { Router } from "express";
import { authRouter } from "../modules/auth/index.js";
import { usersRouter } from "../modules/users/index.js";
import { clinicRouter } from "../modules/clinics/index.js";
import { specialtyRouter } from "../modules/specialties/index.js";
import { doctorRouter } from "../modules/doctors/index.js";
import { doctorScheduleRouter } from "../modules/doctor-schedules/index.js";

const router = Router();

router.use("/auth", authRouter);
router.use("/users", usersRouter);
router.use("/admin/clinics", clinicRouter);
router.use("/admin/specialties", specialtyRouter);
router.use("/admin/doctors", doctorRouter);
router.use("/admin/doctor-schedules", doctorScheduleRouter);

export default router;
