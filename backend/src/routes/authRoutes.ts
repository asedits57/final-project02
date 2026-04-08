import express from "express";
import { authLimiter } from "../middleware/rateLimiter";
import { registerUser, loginUser, refreshAccessToken, logoutUser } from "../controllers/authController";

const router = express.Router();



router.post("/register", authLimiter, registerUser);
router.post("/login", authLimiter, loginUser);
router.post("/refresh-token", refreshAccessToken);
router.post("/logout", logoutUser);

export default router;
