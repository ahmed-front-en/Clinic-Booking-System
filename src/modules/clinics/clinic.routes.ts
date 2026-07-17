import { Router } from "express";
import { validate } from "../../shared/middlewares/validation.middleware.js";
import { createClinicSchema, updateClinicSchema } from "./clinic.validation.js";
import { clinicController } from "./clinic.controller.js";

const router = Router();

router.post("/", validate(createClinicSchema), clinicController.create);
router.get("/", clinicController.findAll);
router.get("/:id", clinicController.findById);
router.patch("/:id", validate(updateClinicSchema), clinicController.update);
router.delete("/:id", clinicController.delete);

export { router as clinicRouter };
