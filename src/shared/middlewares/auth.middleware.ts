import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { jwt as jwtConfig } from "../../config/jwt.js";
import { AppError } from "../errors/app-error.js";
import { HttpStatus } from "../constants/http-status.js";
import type { AuthenticatedUser, UserRole } from "../types/user.types.js";

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;

  if (!header) {
    throw new AppError(HttpStatus.UNAUTHORIZED, "Missing authorization header");
  }

  const parts = header.split(" ");

  if (parts.length !== 2 || parts[0] !== "Bearer") {
    throw new AppError(HttpStatus.UNAUTHORIZED, "Invalid authorization header format");
  }

  const token = parts[1];

  try {
    const payload = jwt.verify(token, jwtConfig.secret) as AuthenticatedUser;
    req.user = { sub: payload.sub, role: payload.role };
    next();
  } catch {
    throw new AppError(HttpStatus.UNAUTHORIZED, "Invalid or expired token");
  }
}

export function authorize(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new AppError(HttpStatus.UNAUTHORIZED, "Authentication required");
    }

    if (!roles.includes(req.user.role)) {
      throw new AppError(HttpStatus.FORBIDDEN, "Insufficient permissions");
    }

    next();
  };
}
