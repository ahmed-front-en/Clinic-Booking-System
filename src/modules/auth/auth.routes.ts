import { Router } from "express";
import { validate } from "../../shared/middlewares/validation.middleware.js";
import { registerSchema, loginSchema, refreshTokenSchema } from "./auth.validation.js";
import { authController } from "./auth.controller.js";

const router = Router();

router.post("/register", validate(registerSchema), authController.register);
router.post("/login", validate(loginSchema), authController.login);
router.post("/refresh", validate(refreshTokenSchema), authController.refreshToken);
router.post("/logout", authController.logout);
router.get("/me", authController.me);

export { router as authRouter };
