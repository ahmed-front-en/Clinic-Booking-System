import { Router } from "express";
import { validate } from "../../shared/middlewares/validation.middleware.js";
import { authenticate, authorize } from "../../shared/middlewares/auth.middleware.js";
import { Permissions } from "../../shared/constants/permissions.js";
import { createAppointmentSlotSchema, updateAppointmentSlotSchema } from "./appointment-slot.validation.js";
import { appointmentSlotController } from "./appointment-slot.controller.js";

const publicRouter = Router();
const adminRouter = Router();

publicRouter.get("/available", appointmentSlotController.findAvailable);
publicRouter.get("/doctor/:doctorId", appointmentSlotController.findByDoctorId);
publicRouter.get("/date/:slotDate", appointmentSlotController.findByDate);

adminRouter.use(authenticate, authorize(Permissions.MANAGE_SLOTS));

adminRouter.get("/available", appointmentSlotController.findAvailable);
adminRouter.get("/doctor/:doctorId", appointmentSlotController.findByDoctorId);
adminRouter.get("/date/:slotDate", appointmentSlotController.findByDate);
adminRouter.get("/", appointmentSlotController.findAll);
adminRouter.get("/:id", appointmentSlotController.findById);
adminRouter.post("/", validate(createAppointmentSlotSchema), appointmentSlotController.create);
adminRouter.patch("/:id", validate(updateAppointmentSlotSchema), appointmentSlotController.update);
adminRouter.delete("/:id", appointmentSlotController.delete);

export { publicRouter as appointmentSlotRouter, adminRouter as appointmentSlotAdminRouter };
