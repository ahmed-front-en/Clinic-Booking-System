import type { UserRole } from "../enums";

export interface UserRecord {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface UserUpdateRequest {
  email?: string;
  role?: UserRole;
  isVerified?: boolean;
}

export interface UserFilters {
  role?: UserRole;
  isVerified?: boolean;
  search?: string;
}
