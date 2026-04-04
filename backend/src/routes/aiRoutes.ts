import express from "express";
import { askAI } from "../controllers/aiController";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/ai/generate", protect, askAI);

export default router;
