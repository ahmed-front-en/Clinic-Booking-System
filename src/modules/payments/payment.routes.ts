import { Router } from "express";
import { validate } from "../../shared/middlewares/validation.middleware.js";
import { authenticate, authorize } from "../../shared/middlewares/auth.middleware.js";
import { Permissions } from "../../shared/constants/permissions.js";
import { createPaymentSchema, updatePaymentSchema } from "./payment.validation.js";
import { paymentController } from "./payment.controller.js";

const router = Router();

router.post("/", authenticate, authorize(Permissions.PAY_APPOINTMENT, Permissions.MANAGE_PAYMENTS), validate(createPaymentSchema), paymentController.createAsPatient);
router.get("/mine", authenticate, authorize(Permissions.PAY_APPOINTMENT), paymentController.findMyPayments);

router.get("/appointment/:appointmentId", authenticate, authorize(Permissions.MANAGE_PAYMENTS), paymentController.findByAppointmentId);
router.get("/", authenticate, authorize(Permissions.MANAGE_PAYMENTS), paymentController.findAll);
router.get("/:id", authenticate, authorize(Permissions.MANAGE_PAYMENTS), paymentController.findById);
router.patch("/:id", authenticate, authorize(Permissions.MANAGE_PAYMENTS), validate(updatePaymentSchema), paymentController.update);
router.delete("/:id", authenticate, authorize(Permissions.MANAGE_PAYMENTS), paymentController.delete);

export { router as paymentRouter };
