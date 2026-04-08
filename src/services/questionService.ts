import { apiClient } from "./apiClient";

export interface ReadingQuestion {
  question: string;
  options: string[];
  answer: string;
  explanation?: string;
}

export interface ReadingPassage {
  title: string;
  content: string;
  questions: ReadingQuestion[];
}

export interface ListeningExercise {
  title: string;
  description: string;
  duration: number;
  text?: string;
  mcqs?: Array<{
    id: number;
    part: string;
    question: string;
    options: string[];
    correctAnswer: number;
  }>;
}

export interface WritingTask {
  id: string;
  prompt: string;
  emoji: string;
  timeLimit: string;
  wordLimit: string;
}

export interface GrammarQuestion {
  id: number | string;
  question: string;
  options: string[];
  correctAnswer: number | string;
}

export interface QuestionData {
  grammar: GrammarQuestion[];
  reading: ReadingPassage[];
  listening: ListeningExercise[];
  writing: WritingTask[];
}

export const questionService = {
  fetchQuestions(): Promise<QuestionData> {
    return apiClient<QuestionData>("/questions");
  }
};
