import { Router } from "express";
import { validate } from "../../shared/middlewares/validation.middleware.js";
import { authenticate } from "../../shared/middlewares/auth.middleware.js";
import { registerSchema, loginSchema, refreshTokenSchema, logoutSchema } from "./auth.validation.js";
import { authController } from "./auth.controller.js";

const router = Router();

router.post("/register", validate(registerSchema), authController.register);
router.post("/login", validate(loginSchema), authController.login);
router.post("/refresh", validate(refreshTokenSchema), authController.refreshToken);
router.post("/logout", validate(logoutSchema), authenticate, authController.logout);
router.get("/me", authenticate, authController.me);

export { router as authRouter };
