import type { UUID } from "../../shared/types/common.types.js";
import type { UserRole } from "../../shared/types/user.types.js";

export interface RegisterDto {
  email: string;
  password: string;
  fullName: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface TokenPayload {
  sub: UUID;
  role: UserRole;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}
