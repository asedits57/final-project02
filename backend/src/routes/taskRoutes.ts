import express from "express";

import { protect } from "../middleware/authMiddleware";
import { getUserVisibleTask, listUserVisibleTasks, submitTask } from "../controllers/taskController";

const router = express.Router();

router.get("/tasks", protect, listUserVisibleTasks);
router.get("/tasks/:id", protect, getUserVisibleTask);
router.post("/tasks/:id/submit", protect, submitTask);

export default router;
