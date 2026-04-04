import express from "express";
import { getProfile, updateProgress, getLeaderboard, getDashboard } from "../controllers/userController";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/profile", protect, getProfile);
router.get("/user/dashboard", protect, getDashboard);
router.post("/progress", protect, updateProgress);
router.get("/leaderboard", getLeaderboard);

export default router;
