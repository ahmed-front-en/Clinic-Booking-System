import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { authRepository } from "./auth.repository.js";
import { jwt as jwtConfig } from "../../config/index.js";
import { AppError } from "../../shared/errors/app-error.js";
import { HttpStatus } from "../../shared/constants/http-status.js";
import type { RegisterDto, LoginDto, AuthTokens } from "./auth.types.js";
import type { UserRecord } from "./auth.interfaces.js";
import type { UUID } from "../../shared/types/common.types.js";

export class AuthService {
  async register(dto: RegisterDto): Promise<AuthTokens> {
    const existing = await authRepository.findByEmail(dto.email);

    if (existing) {
      throw new AppError(HttpStatus.CONFLICT, "Email already exists");
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const user = await authRepository.create({
      email: dto.email,
      passwordHash,
      role: "patient",
    });

    const accessToken = jwt.sign(
      { sub: user.id, role: user.role },
      jwtConfig.secret,
      { expiresIn: jwtConfig.expiresIn },
    );

    const refreshToken = jwt.sign(
      { sub: user.id },
      jwtConfig.refreshSecret,
      { expiresIn: jwtConfig.refreshExpiresIn },
    );

    return { accessToken, refreshToken };
  }

  async login(dto: LoginDto): Promise<AuthTokens> {
    const user = await authRepository.findByEmail(dto.email);

    if (!user) {
      throw new AppError(HttpStatus.UNAUTHORIZED, "Invalid email or password");
    }

    const passwordValid = await bcrypt.compare(dto.password, user.passwordHash);

    if (!passwordValid) {
      throw new AppError(HttpStatus.UNAUTHORIZED, "Invalid email or password");
    }

    const accessToken = jwt.sign(
      { sub: user.id, role: user.role },
      jwtConfig.secret,
      { expiresIn: jwtConfig.expiresIn },
    );

    const refreshToken = jwt.sign(
      { sub: user.id },
      jwtConfig.refreshSecret,
      { expiresIn: jwtConfig.refreshExpiresIn },
    );

    return { accessToken, refreshToken };
  }

  async refreshToken(_refreshToken: string): Promise<AuthTokens> {
    throw new AppError(HttpStatus.NOT_IMPLEMENTED, "Not implemented");
  }

  async logout(_userId: UUID): Promise<void> {
    throw new AppError(HttpStatus.NOT_IMPLEMENTED, "Not implemented");
  }

  async me(_userId: UUID): Promise<UserRecord> {
    throw new AppError(HttpStatus.NOT_IMPLEMENTED, "Not implemented");
  }
}

export const authService = new AuthService();
