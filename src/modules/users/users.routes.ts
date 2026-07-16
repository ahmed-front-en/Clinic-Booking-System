import { Router } from "express";
import { validate } from "../../shared/middlewares/validation.middleware.js";
import { updateUserSchema, userFilterSchema } from "./users.validation.js";
import { usersController } from "./users.controller.js";

const router = Router();

router.get("/", validate(userFilterSchema), usersController.findAll);
router.get("/:id", usersController.findById);
router.patch("/:id", validate(updateUserSchema), usersController.update);
router.delete("/:id", usersController.softDelete);

export { router as usersRouter };
