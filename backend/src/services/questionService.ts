import Question from "../models/Question";
import { safeGet, safeSet } from "../config/redis";

export const getAllQuestions = async () => {
  const cacheKey = "daily_questions";

  const cached = await safeGet(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  const questions = await Question.find({});
  
  await safeSet(cacheKey, JSON.stringify(questions), {
    EX: 86400, // 24 hours
  });

  return questions;
};
