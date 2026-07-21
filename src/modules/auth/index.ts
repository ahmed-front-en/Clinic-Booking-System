export { authRouter } from "./auth.routes.js";
export { authController } from "./auth.controller.js";
export { authService } from "./auth.service.js";
export { authRepository } from "./auth.repository.js";

export { registerSchema, loginSchema, refreshTokenSchema, logoutSchema } from "./auth.validation.js";
export type { RegisterDto, LoginDto, TokenPayload, AuthTokens } from "./auth.types.js";
export type { CreateUserInput } from "./auth.interfaces.js";
export type { UserRole, UserRecord, UserPublic } from "../../shared/types/user.types.js";
