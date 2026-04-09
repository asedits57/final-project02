import express from "express";

import { protect } from "../middleware/authMiddleware";
import { getActiveDailyTask, getUserDailyTask, submitDailyTask } from "../controllers/dailyTaskController";

const router = express.Router();

router.get("/daily-tasks/active", protect, getActiveDailyTask);
router.get("/daily-tasks/:id", protect, getUserDailyTask);
router.post("/daily-tasks/:id/submit", protect, submitDailyTask);

export default router;
