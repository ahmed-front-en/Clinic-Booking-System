import { Router } from "express";
import { validate } from "../../shared/middlewares/validation.middleware.js";
import { authenticate, authorize } from "../../shared/middlewares/auth.middleware.js";
import { Permissions } from "../../shared/constants/permissions.js";
import { createDoctorSchema, updateDoctorSchema } from "./doctor.validation.js";
import { doctorController } from "./doctor.controller.js";

const publicRouter = Router();
const adminRouter = Router();

publicRouter.get("/", doctorController.findAll);
publicRouter.get("/:id", doctorController.findById);

adminRouter.use(authenticate, authorize(Permissions.MANAGE_DOCTORS));

adminRouter.get("/", doctorController.findAll);
adminRouter.get("/:id", doctorController.findById);
adminRouter.post("/", validate(createDoctorSchema), doctorController.create);
adminRouter.patch("/:id", validate(updateDoctorSchema), doctorController.update);
adminRouter.delete("/:id", doctorController.delete);

export { publicRouter as doctorRouter, adminRouter as doctorAdminRouter };
