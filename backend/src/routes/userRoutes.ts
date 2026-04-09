import express from "express";
import { getProfile, updateProgress, getLeaderboard, updateProfile } from "../controllers/userController";
import { protect } from "../middleware/authMiddleware";
import { isAdmin } from "../middleware/adminMiddleware";
import { getDashboard } from "../controllers/adminController";

const router = express.Router();

router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);
router.post("/progress", protect, updateProgress);
router.get("/leaderboard", getLeaderboard);

// ✅ ADMIN ONLY
router.get("/admin/stats", protect, isAdmin, getDashboard);

export default router;
