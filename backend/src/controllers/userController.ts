import { Request, Response } from "express";
import { updateUserProgress, getLeaderboardCached, getUserById, getUserDashboard, updateProfileData } from "../services/userService";
import { updateProfileSchema } from "../validators/userValidator";
import { sanitizeObject } from "../utils/sanitization";
import catchAsync from "../utils/catchAsync";

// GET PROFILE
export const getProfile = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const user = await getUserById(userId);
  res.json(user);
});

// UPDATE PROFILE
export const updateProfile = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  // Validate schema (will throw naturally if fails)
  const validatedData = updateProfileSchema.parse(req.body);
  // Sanitize object recursively
  const sanitizedData = sanitizeObject(validatedData);
  
  // Delegate to service
  const user = await updateProfileData(userId, sanitizedData);
  res.json(user);
});

// GET DASHBOARD ANALYTICS
export const getDashboard = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const dashboard = await getUserDashboard(userId);
  res.json(dashboard);
});

// UPDATE SCORE + STREAK
export const updateProgress = catchAsync(async (req: Request, res: Response) => {
  const user = await updateUserProgress((req as any).user.id, req.body.score);
  res.json(user);
});

// GET LEADERBOARD
export const getLeaderboard = catchAsync(async (req: Request, res: Response) => {
  const users = await getLeaderboardCached();
  res.json(users);
});

// ADMIN: GET STATS
export const getAdminStats = catchAsync(async (req: Request, res: Response) => {
  // In a real app, this would query some aggregated stats service
  res.json({ message: "Admin stats accessed successfully 🔐", totalUsers: 1337 });
});
