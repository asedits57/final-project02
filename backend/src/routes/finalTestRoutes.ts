import express from "express";

import { protect } from "../middleware/authMiddleware";
import { getFinalTestConfig, submitFinalTest } from "../controllers/finalTestController";

const router = express.Router();

router.get("/final-tests/config", protect, getFinalTestConfig);
router.post("/final-tests", protect, submitFinalTest);

export default router;
