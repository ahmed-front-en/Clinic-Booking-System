import { Router } from "express";
import { validate } from "../../shared/middlewares/validation.middleware.js";
import { authenticate, authorize } from "../../shared/middlewares/auth.middleware.js";
import { Permissions } from "../../shared/constants/permissions.js";
import { createDoctorSchema, updateDoctorSchema } from "./doctor.validation.js";
import { doctorController } from "./doctor.controller.js";

const router = Router();

router.get("/", doctorController.findAll);
router.get("/:id", doctorController.findById);

router.post("/", authenticate, authorize(Permissions.MANAGE_DOCTORS), validate(createDoctorSchema), doctorController.create);
router.patch("/:id", authenticate, authorize(Permissions.MANAGE_DOCTORS), validate(updateDoctorSchema), doctorController.update);
router.delete("/:id", authenticate, authorize(Permissions.MANAGE_DOCTORS), doctorController.delete);

export { router as doctorRouter };
