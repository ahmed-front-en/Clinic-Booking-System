import { Router } from "express";
import { validate } from "../../shared/middlewares/validation.middleware.js";
import { authenticate, authorize } from "../../shared/middlewares/auth.middleware.js";
import { createReviewSchema, updateReviewSchema } from "./review.validation.js";
import { reviewController } from "./review.controller.js";

const router = Router();

router.post("/", authenticate, validate(createReviewSchema), reviewController.create);
router.get("/", authenticate, authorize("admin"), reviewController.findAll);
router.get("/appointment/:appointmentId", authenticate, reviewController.findByAppointmentId);
router.get("/:id", authenticate, authorize("admin"), reviewController.findById);
router.patch("/:id", authenticate, authorize("admin"), validate(updateReviewSchema), reviewController.update);
router.delete("/:id", authenticate, authorize("admin"), reviewController.delete);

export { router as reviewRouter };
