import { Router } from "express";
import { validate } from "../../shared/middlewares/validation.middleware.js";
import { authenticate, authorize } from "../../shared/middlewares/auth.middleware.js";
import { Permissions } from "../../shared/constants/permissions.js";
import { createReviewSchema, updateReviewSchema } from "./review.validation.js";
import { reviewController } from "./review.controller.js";

const router = Router();

router.post("/", authenticate, authorize(Permissions.MANAGE_OWN_REVIEWS), validate(createReviewSchema), reviewController.createAsPatient);
router.get("/mine", authenticate, authorize(Permissions.MANAGE_OWN_REVIEWS, Permissions.VIEW_OWN_REVIEWS), reviewController.findMyReviews);

router.get("/appointment/:appointmentId", authenticate, authorize(Permissions.MANAGE_REVIEWS), reviewController.findByAppointmentId);
router.get("/", authenticate, authorize(Permissions.MANAGE_REVIEWS), reviewController.findAll);
router.get("/:id", authenticate, authorize(Permissions.MANAGE_REVIEWS), reviewController.findById);
router.patch("/:id", authenticate, authorize(Permissions.MANAGE_REVIEWS), validate(updateReviewSchema), reviewController.update);
router.delete("/:id", authenticate, authorize(Permissions.MANAGE_REVIEWS), reviewController.delete);

export { router as reviewRouter };
