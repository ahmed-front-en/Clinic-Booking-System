import type { Request, Response, NextFunction } from "express";

export function validate(_schema: unknown) {
  return (_req: Request, _res: Response, next: NextFunction): void => {
    next();
  };
}
