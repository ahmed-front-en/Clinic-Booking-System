import { Router } from "express";
import { validate } from "../../shared/middlewares/validation.middleware.js";
import { authenticate, authorize } from "../../shared/middlewares/auth.middleware.js";
import { createDoctorScheduleSchema, updateDoctorScheduleSchema } from "./doctor-schedule.validation.js";
import { doctorScheduleController } from "./doctor-schedule.controller.js";

const router = Router();

router.use(authenticate, authorize("admin"));

router.post("/", validate(createDoctorScheduleSchema), doctorScheduleController.create);
router.get("/", doctorScheduleController.findAll);
router.get("/doctor/:doctorId", doctorScheduleController.findByDoctorId);
router.get("/:id", doctorScheduleController.findById);
router.patch("/:id", validate(updateDoctorScheduleSchema), doctorScheduleController.update);
router.delete("/:id", doctorScheduleController.delete);

export { router as doctorScheduleRouter };
