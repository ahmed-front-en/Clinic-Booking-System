import { Router } from "express";
import { validate } from "../../shared/middlewares/validation.middleware.js";
import { authenticate, authorize } from "../../shared/middlewares/auth.middleware.js";
import { createAppointmentSchema, updateAppointmentSchema } from "./appointment.validation.js";
import { appointmentController } from "./appointment.controller.js";

const router = Router();

router.post("/", authenticate, validate(createAppointmentSchema), appointmentController.create);
router.get("/", authenticate, authorize("admin"), appointmentController.findAll);
router.get("/patient/:patientId", authenticate, appointmentController.findByPatientId);
router.get("/doctor/:doctorId", authenticate, appointmentController.findByDoctorId);
router.get("/:id", authenticate, authorize("admin"), appointmentController.findById);
router.patch("/:id", authenticate, authorize("admin"), validate(updateAppointmentSchema), appointmentController.update);
router.delete("/:id", authenticate, authorize("admin"), appointmentController.delete);

export { router as appointmentRouter };
