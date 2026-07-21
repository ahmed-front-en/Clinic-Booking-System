import { Router } from "express";
import { validate } from "../../shared/middlewares/validation.middleware.js";
import { authenticate, authorize } from "../../shared/middlewares/auth.middleware.js";
import { createAppointmentSlotSchema, updateAppointmentSlotSchema } from "./appointment-slot.validation.js";
import { appointmentSlotController } from "./appointment-slot.controller.js";

const router = Router();

router.post("/", authenticate, authorize("admin"), validate(createAppointmentSlotSchema), appointmentSlotController.create);
router.get("/", authenticate, authorize("admin"), appointmentSlotController.findAll);
router.get("/available", authenticate, appointmentSlotController.findAvailable);
router.get("/doctor/:doctorId", authenticate, appointmentSlotController.findByDoctorId);
router.get("/date/:slotDate", authenticate, appointmentSlotController.findByDate);
router.get("/:id", authenticate, authorize("admin"), appointmentSlotController.findById);
router.patch("/:id", authenticate, authorize("admin"), validate(updateAppointmentSlotSchema), appointmentSlotController.update);
router.delete("/:id", authenticate, authorize("admin"), appointmentSlotController.delete);

export { router as appointmentSlotRouter };
