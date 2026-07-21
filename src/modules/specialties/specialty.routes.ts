import { Router } from "express";
import { validate } from "../../shared/middlewares/validation.middleware.js";
import { authenticate, authorize } from "../../shared/middlewares/auth.middleware.js";
import { createSpecialtySchema, updateSpecialtySchema } from "./specialty.validation.js";
import { specialtyController } from "./specialty.controller.js";

const router = Router();

router.use(authenticate, authorize("admin"));

router.post("/", validate(createSpecialtySchema), specialtyController.create);
router.get("/", specialtyController.findAll);
router.get("/:id", specialtyController.findById);
router.patch("/:id", validate(updateSpecialtySchema), specialtyController.update);
router.delete("/:id", specialtyController.delete);

export { router as specialtyRouter };
