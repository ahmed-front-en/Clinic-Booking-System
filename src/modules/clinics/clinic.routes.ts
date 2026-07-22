import { Router } from "express";
import { validate } from "../../shared/middlewares/validation.middleware.js";
import { authenticate, authorize } from "../../shared/middlewares/auth.middleware.js";
import { Permissions } from "../../shared/constants/permissions.js";
import { createClinicSchema, updateClinicSchema } from "./clinic.validation.js";
import { clinicController } from "./clinic.controller.js";

const router = Router();

router.get("/", clinicController.findAll);
router.get("/:id", clinicController.findById);

router.post("/", authenticate, authorize(Permissions.MANAGE_CLINICS), validate(createClinicSchema), clinicController.create);
router.patch("/:id", authenticate, authorize(Permissions.MANAGE_CLINICS), validate(updateClinicSchema), clinicController.update);
router.delete("/:id", authenticate, authorize(Permissions.MANAGE_CLINICS), clinicController.delete);

export { router as clinicRouter };
