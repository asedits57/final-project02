import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

import User from "../models/User";

export const protect = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

  if (!token) {
    return res.status(401).json({ success: false, message: "Not authorized, no token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;
    
    // Check if the user still exists in the database
    const user = await User.findById(decoded.id || decoded._id).select("-password");
    if (!user) {
      return res.status(401).json({ success: false, message: "Not authorized, user not found" });
    }

    (req as any).user = user;
    next();
  } catch (error) {
    console.error("Token verification failed:", error);
    res.status(401).json({ success: false, message: "Not authorized, invalid token" });
  }
};
