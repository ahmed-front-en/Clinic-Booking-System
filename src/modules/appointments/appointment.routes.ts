import { Router } from "express";
import { validate } from "../../shared/middlewares/validation.middleware.js";
import { createAppointmentSchema, updateAppointmentSchema } from "./appointment.validation.js";
import { appointmentController } from "./appointment.controller.js";

const router = Router();

router.post("/", validate(createAppointmentSchema), appointmentController.create);
router.get("/", appointmentController.findAll);
router.get("/patient/:patientId", appointmentController.findByPatientId);
router.get("/doctor/:doctorId", appointmentController.findByDoctorId);
router.get("/:id", appointmentController.findById);
router.patch("/:id", validate(updateAppointmentSchema), appointmentController.update);
router.delete("/:id", appointmentController.delete);

export { router as appointmentRouter };
