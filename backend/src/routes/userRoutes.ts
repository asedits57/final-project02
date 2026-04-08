import express from "express";
import { getProfile, updateProgress, getLeaderboard, getDashboard, updateProfile, getAdminStats } from "../controllers/userController";
import { protect } from "../middleware/authMiddleware";
import { isAdmin } from "../middleware/adminMiddleware";

const router = express.Router();

router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);
router.get("/user/dashboard", protect, getDashboard);
router.post("/progress", protect, updateProgress);
router.get("/leaderboard", getLeaderboard);

// ✅ ADMIN ONLY
router.get("/admin/stats", protect, isAdmin, getAdminStats);

export default router;
