import { Router } from "express";
import { validate } from "../../shared/middlewares/validation.middleware.js";
import { authenticate, authorize } from "../../shared/middlewares/auth.middleware.js";
import { createPaymentSchema, updatePaymentSchema } from "./payment.validation.js";
import { paymentController } from "./payment.controller.js";

const router = Router();

router.post("/", authenticate, validate(createPaymentSchema), paymentController.create);
router.get("/", authenticate, authorize("admin"), paymentController.findAll);
router.get("/appointment/:appointmentId", authenticate, paymentController.findByAppointmentId);
router.get("/:id", authenticate, authorize("admin"), paymentController.findById);
router.patch("/:id", authenticate, authorize("admin"), validate(updatePaymentSchema), paymentController.update);
router.delete("/:id", authenticate, authorize("admin"), paymentController.delete);

export { router as paymentRouter };
