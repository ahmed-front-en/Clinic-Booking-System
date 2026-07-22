import { Router } from "express";
import { validate } from "../../shared/middlewares/validation.middleware.js";
import { authenticate, authorize } from "../../shared/middlewares/auth.middleware.js";
import { Permissions } from "../../shared/constants/permissions.js";
import { createAppointmentSlotSchema, updateAppointmentSlotSchema } from "./appointment-slot.validation.js";
import { appointmentSlotController } from "./appointment-slot.controller.js";

const router = Router();

router.get("/available", appointmentSlotController.findAvailable);
router.get("/doctor/:doctorId", appointmentSlotController.findByDoctorId);
router.get("/date/:slotDate", appointmentSlotController.findByDate);

router.get("/", authenticate, authorize(Permissions.MANAGE_SLOTS), appointmentSlotController.findAll);
router.get("/:id", authenticate, authorize(Permissions.MANAGE_SLOTS), appointmentSlotController.findById);

router.post("/", authenticate, authorize(Permissions.MANAGE_SLOTS), validate(createAppointmentSlotSchema), appointmentSlotController.create);
router.patch("/:id", authenticate, authorize(Permissions.MANAGE_SLOTS), validate(updateAppointmentSlotSchema), appointmentSlotController.update);
router.delete("/:id", authenticate, authorize(Permissions.MANAGE_SLOTS), appointmentSlotController.delete);

export { router as appointmentSlotRouter };
