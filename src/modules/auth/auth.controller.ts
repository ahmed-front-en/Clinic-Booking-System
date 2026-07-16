import type { Request, Response, NextFunction } from "express";
import { BaseController } from "../../shared/controllers/base.controller.js";
import { authService } from "./auth.service.js";

export class AuthController extends BaseController {
  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tokens = await authService.register(req.body);
      this.created(res, tokens, "User registered successfully");
    } catch (error) {
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tokens = await authService.login(req.body);
      this.ok(res, tokens);
    } catch (error) {
      next(error);
    }
  };

  refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tokens = await authService.refreshToken(req.body.refreshToken);
      this.ok(res, tokens);
    } catch (error) {
      next(error);
    }
  };

  logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // TODO: implement when authService.logout is ready
      this.noContent(res);
    } catch (error) {
      next(error);
    }
  };

  me = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // TODO: implement when authService.me is ready
      this.noContent(res);
    } catch (error) {
      next(error);
    }
  };
}

export const authController = new AuthController();
