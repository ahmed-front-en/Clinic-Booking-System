import { Router } from "express";
import { authRouter } from "../modules/auth/index.js";
import { usersRouter } from "../modules/users/index.js";

const router = Router();

router.use("/auth", authRouter);
router.use("/users", usersRouter);

export default router;
