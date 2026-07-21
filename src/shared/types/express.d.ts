import "express";
import type { AuthenticatedUser } from "./user.types.js";

declare module "express" {
  export interface Request {
    user?: AuthenticatedUser;
  }
}
