import { Router } from "express";
import { validate } from "../../shared/middlewares/validation.middleware.js";
import { authenticate, authorize } from "../../shared/middlewares/auth.middleware.js";
import { Permissions } from "../../shared/constants/permissions.js";
import { createPatientSchema, updatePatientSchema } from "./patient.validation.js";
import { patientController } from "./patient.controller.js";

const router = Router();

router.get("/me", authenticate, authorize(Permissions.VIEW_OWN_PROFILE), patientController.findMyProfile);
router.patch("/me", authenticate, authorize(Permissions.MANAGE_OWN_PROFILE), validate(updatePatientSchema), patientController.updateMyProfile);

router.post("/", authenticate, authorize(Permissions.MANAGE_PATIENTS), validate(createPatientSchema), patientController.create);
router.get("/user/:userId", authenticate, authorize(Permissions.MANAGE_PATIENTS), patientController.findByUserId);
router.patch("/:id", authenticate, authorize(Permissions.MANAGE_PATIENTS), validate(updatePatientSchema), patientController.update);
router.get("/", authenticate, authorize(Permissions.MANAGE_PATIENTS), patientController.findAll);
router.get("/:id", authenticate, authorize(Permissions.MANAGE_PATIENTS), patientController.findById);
router.delete("/:id", authenticate, authorize(Permissions.MANAGE_PATIENTS), patientController.delete);

export { router as patientRouter };
