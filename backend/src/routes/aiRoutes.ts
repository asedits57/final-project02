import express from "express";
import { askAI } from "../controllers/aiController";
import { protect } from "../middleware/authMiddleware";
import { aiLimiter } from "../middleware/rateLimiter";

const router = express.Router();

router.post("/ai/generate", protect, aiLimiter, askAI);

export default router;
