import { Router } from "express";
import { validate } from "../../shared/middlewares/validation.middleware.js";
import { authenticate, authorize } from "../../shared/middlewares/auth.middleware.js";
import { Permissions } from "../../shared/constants/permissions.js";
import { createClinicSchema, updateClinicSchema } from "./clinic.validation.js";
import { clinicController } from "./clinic.controller.js";

const publicRouter = Router();
const adminRouter = Router();

publicRouter.get("/", clinicController.findAll);
publicRouter.get("/:id", clinicController.findById);

adminRouter.use(authenticate, authorize(Permissions.MANAGE_CLINICS));

adminRouter.get("/", clinicController.findAll);
adminRouter.get("/:id", clinicController.findById);
adminRouter.post("/", validate(createClinicSchema), clinicController.create);
adminRouter.patch("/:id", validate(updateClinicSchema), clinicController.update);
adminRouter.delete("/:id", clinicController.delete);

export { publicRouter as clinicRouter, adminRouter as clinicAdminRouter };
