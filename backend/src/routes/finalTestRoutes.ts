import express from "express";

import { protect } from "../middleware/authMiddleware";
import { submitFinalTest } from "../controllers/finalTestController";

const router = express.Router();

router.post("/final-tests", protect, submitFinalTest);

export default router;
