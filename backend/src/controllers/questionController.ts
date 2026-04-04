import { Request, Response } from "express";
import Question from "../models/Question";

export const getQuestions = async (req: Request, res: Response) => {
  try {
    const questions = await Question.find({});
    res.json(questions);
  } catch (error) {
    console.error("Error fetching questions:", error);
    res.status(500).json({ error: "Server error fetching questions" });
  }
};
