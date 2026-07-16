import type { UUID } from "./common.types.js";

export type UserRole = "patient" | "doctor" | "admin";

export interface UserRecord {
  id: UUID;
  email: string;
  passwordHash: string;
  role: UserRole;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}
