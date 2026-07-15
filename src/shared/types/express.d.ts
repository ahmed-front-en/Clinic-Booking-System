/* eslint-disable @typescript-eslint/no-empty-interface */
import "express";

declare module "express" {
  export interface Request {
    /** Authenticated user payload — populated by auth middleware. */
    user?: Record<string, unknown>;
  }
}
