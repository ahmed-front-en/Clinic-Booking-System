import type { UUID } from "../../shared/types/common.types.js";
import type { UserRole, UserRecord } from "../../shared/types/user.types.js";

export type { UserRecord };

export interface UpdateUserInput {
  email?: string;
  role?: UserRole;
  isVerified?: boolean;
}
