import express from "express";
import rateLimit from "express-rate-limit";
import { registerUser, loginUser, getUserProfile } from "../controllers/authController";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per window for auth routes
  message: { error: "Too many login attempts, please try again after 15 minutes" }
});

router.post("/register", authLimiter, registerUser);
router.post("/login", authLimiter, loginUser);
router.get("/profile", protect, getUserProfile);

export default router;
