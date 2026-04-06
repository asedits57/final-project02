import { Request, Response } from "express";
import { updateUserProgress, getLeaderboardCached, getUserById, getUserDashboard } from "../services/userService";
import { updateProfileSchema } from "../validators/userValidator";
import { sanitizeObject } from "../utils/sanitization";

// GET PROFILE
export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const user = await getUserById(userId);
    res.json(user);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || "Server error fetching profile" });
  }
};

// UPDATE PROFILE
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    // Validate schema
    const validatedData = updateProfileSchema.parse(req.body);
    // Sanitize object recursively
    const sanitizedData = sanitizeObject(validatedData);
    
    const { fullName, username, dept, level } = sanitizedData;
    const User = (await import("../models/User")).default;
    const user = await User.findByIdAndUpdate(userId, { fullName, username, dept, level }, { new: true });
    res.json(user);
  } catch (err: any) {
    if (err.name === "ZodError") {
      return res.status(400).json({ success: false, message: "Invalid input data", errors: err.errors });
    }
    res.status(500).json({ success: false, message: err.message || "Server error updating profile" });
  }
};

// GET DASHBOARD ANALYTICS
export const getDashboard = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const dashboard = await getUserDashboard(userId);
    res.json(dashboard);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || "Server error fetching dashboard" });
  }
};

// UPDATE SCORE + STREAK
export const updateProgress = async (req: Request, res: Response) => {
  try {
    const user = await updateUserProgress((req as any).user.id, req.body.score);
    res.json(user);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET LEADERBOARD
export const getLeaderboard = async (req: Request, res: Response) => {
  try {
    const users = await getLeaderboardCached();
    res.json(users);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || "Server error fetching leaderboard" });
  }
};
