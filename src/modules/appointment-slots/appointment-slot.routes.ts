import { Router } from "express";
import { validate } from "../../shared/middlewares/validation.middleware.js";
import { createAppointmentSlotSchema, updateAppointmentSlotSchema } from "./appointment-slot.validation.js";
import { appointmentSlotController } from "./appointment-slot.controller.js";

const router = Router();

router.post("/", validate(createAppointmentSlotSchema), appointmentSlotController.create);
router.get("/", appointmentSlotController.findAll);
router.get("/available", appointmentSlotController.findAvailable);
router.get("/doctor/:doctorId", appointmentSlotController.findByDoctorId);
router.get("/date/:slotDate", appointmentSlotController.findByDate);
router.get("/:id", appointmentSlotController.findById);
router.patch("/:id", validate(updateAppointmentSlotSchema), appointmentSlotController.update);
router.delete("/:id", appointmentSlotController.delete);

export { router as appointmentSlotRouter };
