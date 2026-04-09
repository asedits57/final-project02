import { Request, Response } from "express";
import { updateUserProgress, getLeaderboardSnapshot, getUserById, updateProfileData } from "../services/userService";
import { updateProfileSchema } from "../validators/userValidator";
import { sanitizeObject } from "../utils/sanitization";
import catchAsync from "../utils/catchAsync";
import { getAuthenticatedUserId } from "../utils/authRequest";
import { toPublicUser } from "../utils/toPublicUser";

// GET PROFILE
export const getProfile = catchAsync(async (req: Request, res: Response) => {
  const user = await getUserById(getAuthenticatedUserId(req));
  res.json(user);
});

// UPDATE PROFILE
export const updateProfile = catchAsync(async (req: Request, res: Response) => {
  const userId = getAuthenticatedUserId(req);
  // Validate schema (will throw naturally if fails)
  const validatedData = updateProfileSchema.parse(req.body);
  // Sanitize object recursively
  const sanitizedData = sanitizeObject(validatedData);
  
  // Delegate to service
  const user = await updateProfileData(userId, sanitizedData);
  res.json(user ? toPublicUser(user) : null);
});

// UPDATE SCORE + STREAK
export const updateProgress = catchAsync(async (req: Request, res: Response) => {
  const user = await updateUserProgress(getAuthenticatedUserId(req), req.body.score);
  res.json(toPublicUser(user));
});

// GET LEADERBOARD
export const getLeaderboard = catchAsync(async (req: Request, res: Response) => {
  const snapshot = await getLeaderboardSnapshot();
  res.json(snapshot);
});

// ADMIN: GET STATS
export const getAdminStats = catchAsync(async (req: Request, res: Response) => {
  // In a real app, this would query some aggregated stats service
  res.json({ message: "Admin stats accessed successfully 🔐", totalUsers: 1337 });
});
