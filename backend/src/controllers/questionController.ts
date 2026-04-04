import { Request, Response } from "express";
import * as questionService from "../services/questionService";

export const getQuestions = async (req: Request, res: Response) => {
  try {
    const questions = await questionService.getAllQuestions();
    res.json(questions);
  } catch (error: any) {
    console.error("Error fetching questions:", error);
    res.status(500).json({ success: false, message: error.message || "Server error fetching questions" });
  }
};
