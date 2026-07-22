import { Router } from "express";
import { validate } from "../../shared/middlewares/validation.middleware.js";
import { authenticate, authorize } from "../../shared/middlewares/auth.middleware.js";
import { Permissions } from "../../shared/constants/permissions.js";
import { createSpecialtySchema, updateSpecialtySchema } from "./specialty.validation.js";
import { specialtyController } from "./specialty.controller.js";

const publicRouter = Router();
const adminRouter = Router();

publicRouter.get("/", specialtyController.findAll);
publicRouter.get("/:id", specialtyController.findById);

adminRouter.use(authenticate, authorize(Permissions.MANAGE_SPECIALTIES));

adminRouter.get("/", specialtyController.findAll);
adminRouter.get("/:id", specialtyController.findById);
adminRouter.post("/", validate(createSpecialtySchema), specialtyController.create);
adminRouter.patch("/:id", validate(updateSpecialtySchema), specialtyController.update);
adminRouter.delete("/:id", specialtyController.delete);

export { publicRouter as specialtyRouter, adminRouter as specialtyAdminRouter };
