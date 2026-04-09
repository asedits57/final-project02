import { NextFunction, Request, Response } from "express";

import { type AuthenticatedRequest, type UserRole } from "../types/auth";
import ApiError from "../utils/ApiError";

export const requireRole = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as AuthenticatedRequest).user;

    if (!user) {
      next(new ApiError(401, "Not authorized, user context missing"));
      return;
    }

    if (!roles.includes(user.role)) {
      next(new ApiError(403, "Forbidden: Admin access required"));
      return;
    }

    next();
  };
};

export const isAdmin = requireRole("admin");
