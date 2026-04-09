import express from "express";

import { protect } from "../middleware/authMiddleware";
import {
  completeLearningGuide,
  completeLearningVideo,
  getLearningProgress,
} from "../controllers/learningController";

const router = express.Router();

router.get("/learning/progress", protect, getLearningProgress);
router.post("/learning/guides/:guideKey/complete", protect, completeLearningGuide);
router.post("/learning/videos/:id/complete", protect, completeLearningVideo);

export default router;
