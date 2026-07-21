import { Router } from "express";
import { validate } from "../../shared/middlewares/validation.middleware.js";
import { authenticate, authorize } from "../../shared/middlewares/auth.middleware.js";
import { createDoctorSchema, updateDoctorSchema } from "./doctor.validation.js";
import { doctorController } from "./doctor.controller.js";

const router = Router();

router.use(authenticate, authorize("admin"));

router.post("/", validate(createDoctorSchema), doctorController.create);
router.get("/", doctorController.findAll);
router.get("/:id", doctorController.findById);
router.patch("/:id", validate(updateDoctorSchema), doctorController.update);
router.delete("/:id", doctorController.delete);

export { router as doctorRouter };
