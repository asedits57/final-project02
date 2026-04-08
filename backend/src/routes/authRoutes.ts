import express from "express";
import rateLimit from "express-rate-limit";
import { registerUser, loginUser, refreshAccessToken, logoutUser } from "../controllers/authController";

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === "production" ? 10 : 1000, // relax in dev/test for k6
  message: { error: "Too many login attempts, please try again after 15 minutes" }
});

router.post("/register", authLimiter, registerUser);
router.post("/login", authLimiter, loginUser);
router.post("/refresh-token", refreshAccessToken);
router.post("/logout", logoutUser);

export default router;
