import Question from "../models/Question";

export const getAllQuestions = async () => {
  return await Question.find({});
};
