import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

import User from "../models/User";
import { type AuthenticatedRequest } from "../types/auth";
import ApiError from "../utils/ApiError";
import { toPublicUser } from "../utils/toPublicUser";

type JwtPayload = {
  id?: string;
  _id?: string;
};

export const protect = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

  if (!token) {
    next(new ApiError(401, "Not authorized, no token provided"));
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
    const userId = decoded.id || decoded._id;

    if (!userId) {
      throw new ApiError(401, "Not authorized, invalid token payload");
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(401, "Not authorized, user not found");
    }

    if (user.status === "suspended") {
      throw new ApiError(403, "Your account is suspended. Please contact support.");
    }

    (req as AuthenticatedRequest).user = toPublicUser(user) as AuthenticatedRequest["user"];
    next();
  } catch (error) {
    if (error instanceof ApiError) {
      next(error);
      return;
    }

    console.error("Token verification failed:", error);
    next(new ApiError(401, "Not authorized, invalid token"));
  }
};
