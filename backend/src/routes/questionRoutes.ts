import express from "express";
import { getQuestions } from "../controllers/questionController";

const router = express.Router();

router.get("/questions", getQuestions);

export default router;
