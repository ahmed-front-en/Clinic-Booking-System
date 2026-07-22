import { Router } from "express";
import { validate } from "../../shared/middlewares/validation.middleware.js";
import { authenticate, authorize } from "../../shared/middlewares/auth.middleware.js";
import { Permissions } from "../../shared/constants/permissions.js";
import { createSpecialtySchema, updateSpecialtySchema } from "./specialty.validation.js";
import { specialtyController } from "./specialty.controller.js";

const router = Router();

router.get("/", specialtyController.findAll);
router.get("/:id", specialtyController.findById);

router.post("/", authenticate, authorize(Permissions.MANAGE_SPECIALTIES), validate(createSpecialtySchema), specialtyController.create);
router.patch("/:id", authenticate, authorize(Permissions.MANAGE_SPECIALTIES), validate(updateSpecialtySchema), specialtyController.update);
router.delete("/:id", authenticate, authorize(Permissions.MANAGE_SPECIALTIES), specialtyController.delete);

export { router as specialtyRouter };
