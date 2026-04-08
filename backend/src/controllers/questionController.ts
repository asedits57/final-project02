import { Request, Response } from "express";
import * as questionService from "../services/questionService";
import catchAsync from "../utils/catchAsync";

export const getQuestions = catchAsync(async (req: Request, res: Response) => {
  const questions = await questionService.getAllQuestions();
  res.json(questions);
});
