import { Request, Response } from "express";
import User from "../models/User";
import { updateUserProgress, getLeaderboardCached } from "../services/userService";

// GET PROFILE
export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const user = await User.findById(userId).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// UPDATE SCORE + STREAK
export const updateProgress = async (req: Request, res: Response) => {
  try {
    const user = await updateUserProgress((req as any).user.id, req.body.score);
    res.json(user);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// GET LEADERBOARD
export const getLeaderboard = async (req: Request, res: Response) => {
  try {
    const users = await getLeaderboardCached();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

