import { Router } from "express";
import { validate } from "../../shared/middlewares/validation.middleware.js";
import { authenticate, authorize } from "../../shared/middlewares/auth.middleware.js";
import { Permissions } from "../../shared/constants/permissions.js";
import { createAppointmentSchema, createAppointmentSelfSchema, updateAppointmentSchema } from "./appointment.validation.js";
import { appointmentController } from "./appointment.controller.js";

const router = Router();

router.post("/", authenticate, authorize(Permissions.BOOK_APPOINTMENT, Permissions.MANAGE_OWN_APPOINTMENTS), validate(createAppointmentSelfSchema), appointmentController.createAsPatient);
router.get("/mine", authenticate, authorize(Permissions.MANAGE_OWN_APPOINTMENTS), appointmentController.findMyAppointments);
router.patch("/mine/:id", authenticate, authorize(Permissions.MANAGE_OWN_APPOINTMENTS), appointmentController.cancelMyAppointment);

router.get("/patient/:patientId", authenticate, authorize(Permissions.MANAGE_APPOINTMENTS), appointmentController.findByPatientId);
router.get("/doctor/:doctorId", authenticate, authorize(Permissions.MANAGE_APPOINTMENTS), appointmentController.findByDoctorId);
router.get("/", authenticate, authorize(Permissions.MANAGE_APPOINTMENTS), appointmentController.findAll);
router.get("/:id", authenticate, authorize(Permissions.MANAGE_APPOINTMENTS), appointmentController.findById);
router.patch("/:id", authenticate, authorize(Permissions.MANAGE_APPOINTMENTS), validate(updateAppointmentSchema), appointmentController.update);
router.delete("/:id", authenticate, authorize(Permissions.MANAGE_APPOINTMENTS), appointmentController.delete);

export { router as appointmentRouter };
