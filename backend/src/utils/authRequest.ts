import { Request } from "express";

import { type AuthenticatedRequest, type AuthenticatedUser } from "../types/auth";
import ApiError from "./ApiError";

export const getAuthenticatedUser = (req: Request): AuthenticatedUser => {
  const user = (req as AuthenticatedRequest).user;

  if (!user) {
    throw new ApiError(401, "Not authorized, user context missing");
  }

  return user;
};

export const getAuthenticatedUserId = (req: Request) => getAuthenticatedUser(req).id;
