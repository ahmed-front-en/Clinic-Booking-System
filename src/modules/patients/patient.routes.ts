import { Router } from "express";
import { validate } from "../../shared/middlewares/validation.middleware.js";
import { authenticate, authorize } from "../../shared/middlewares/auth.middleware.js";
import { createPatientSchema, updatePatientSchema } from "./patient.validation.js";
import { patientController } from "./patient.controller.js";

const router = Router();

router.post("/", authenticate, validate(createPatientSchema), patientController.create);
router.get("/", authenticate, authorize("admin"), patientController.findAll);
router.get("/user/:userId", authenticate, patientController.findByUserId);
router.get("/:id", authenticate, authorize("admin"), patientController.findById);
router.patch("/:id", authenticate, authorize("admin"), validate(updatePatientSchema), patientController.update);
router.delete("/:id", authenticate, authorize("admin"), patientController.delete);

export { router as patientRouter };
