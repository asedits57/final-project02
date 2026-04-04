import express from "express";
import rateLimit from "express-rate-limit";
import { registerUser, loginUser } from "../controllers/authController";

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per window for auth routes
  message: { error: "Too many login attempts, please try again after 15 minutes" }
});

router.post("/register", authLimiter, registerUser);
router.post("/login", authLimiter, loginUser);

export default router;
