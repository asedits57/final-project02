import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import Question from "../models/Question";
import { safeGet, safeSet } from "../config/redis";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

type QuestionPayload = {
  grammar: unknown[];
  reading: unknown[];
  listening: unknown[];
  writing: unknown[];
  speaking: unknown[];
  practice: unknown[];
  mock: unknown[];
};

type LooseQuestionRecord = Record<string, unknown> & {
  _id?: unknown;
  id?: unknown;
  category?: unknown;
  module?: unknown;
  status?: unknown;
  question?: unknown;
  questionText?: unknown;
  text?: unknown;
  prompt?: unknown;
  title?: unknown;
  content?: unknown;
  description?: unknown;
  duration?: unknown;
  timeLimit?: unknown;
  wordLimit?: unknown;
  prepTime?: unknown;
  speakingTime?: unknown;
  emoji?: unknown;
  type?: unknown;
  options?: unknown;
  correctAnswer?: unknown;
  answer?: unknown;
  explanation?: unknown;
  difficulty?: unknown;
  questions?: unknown;
  mcqs?: unknown;
  audioText?: unknown;
  blanks?: unknown;
  imageUrl?: unknown;
};

const emptyPayload = (): QuestionPayload => ({
  grammar: [],
  reading: [],
  listening: [],
  writing: [],
  speaking: [],
  practice: [],
  mock: [],
});

const isRecord = (value: unknown): value is LooseQuestionRecord =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

const toText = (value: unknown, fallback = "") =>
  typeof value === "string" ? value : typeof value === "number" ? String(value) : fallback;

const toStringArray = (value: unknown): string[] =>
  Array.isArray(value) ? value.map((item) => toText(item)).filter(Boolean) : [];

const normalizeOptionIndex = (correctAnswer: unknown, options: string[]) => {
  if (typeof correctAnswer === "number" && Number.isFinite(correctAnswer)) {
    return correctAnswer;
  }

  const text = toText(correctAnswer).trim();
  if (!text) {
    return 0;
  }

  const numeric = Number(text);
  if (Number.isFinite(numeric)) {
    return numeric;
  }

  const upper = text.toUpperCase();
  if (upper.length === 1 && upper >= "A" && upper <= "Z") {
    return upper.charCodeAt(0) - 65;
  }

  const matchedIndex = options.findIndex((option) => option === text);
  return matchedIndex >= 0 ? matchedIndex : 0;
};

const toPracticeDifficulty = (value: unknown) => {
  const normalized = toText(value, "Beginner").trim().toLowerCase();

  if (normalized === "easy" || normalized === "beginner") return "Beginner";
  if (normalized === "medium" || normalized === "intermediate") return "Intermediate";
  if (normalized === "hard" || normalized === "advanced") return "Advanced";
  if (normalized === "expert") return "Expert";

  return "Beginner";
};

const loadSeededQuestions = (): QuestionPayload | null => {
  const questionsPath = path.join(__dirname, "../../data/questions.json");
  if (!fs.existsSync(questionsPath)) {
    return null;
  }

  const parsed = JSON.parse(fs.readFileSync(questionsPath, "utf-8")) as Partial<QuestionPayload>;
  return {
    grammar: Array.isArray(parsed.grammar) ? parsed.grammar : [],
    reading: Array.isArray(parsed.reading) ? parsed.reading : [],
    listening: Array.isArray(parsed.listening) ? parsed.listening : [],
    writing: Array.isArray(parsed.writing) ? parsed.writing : [],
    speaking: Array.isArray(parsed.speaking) ? parsed.speaking : [],
    practice: Array.isArray(parsed.practice) ? parsed.practice : [],
    mock: Array.isArray(parsed.mock) ? parsed.mock : [],
  };
};

const transformQuestionsFromDatabase = (items: LooseQuestionRecord[]): QuestionPayload => {
  const payload = emptyPayload();

  items.forEach((item, index) => {
    const moduleName = toText(item.module || item.category, "").trim().toLowerCase();
    const questionId = item.id ?? item._id ?? `${moduleName || "question"}-${index + 1}`;

    if (moduleName === "grammar") {
      const options = toStringArray(item.options);
      payload.grammar.push({
        id: questionId,
        question: toText(item.question || item.questionText || item.text, "Untitled grammar question"),
        options,
        correctAnswer: normalizeOptionIndex(item.correctAnswer, options),
        explanation: toText(item.explanation),
      });
      return;
    }

    if (moduleName === "reading" && Array.isArray(item.questions)) {
      payload.reading.push({
        id: questionId,
        title: toText(item.title, "Reading passage"),
        content: toText(item.content || item.text, ""),
        questions: item.questions
          .filter(isRecord)
          .map((question, questionIndex) => ({
            id: question.id ?? `${questionId}-q-${questionIndex + 1}`,
            question: toText(question.question, "Reading question"),
            options: toStringArray(question.options),
            answer: toText(question.answer, "A"),
            explanation: toText(question.explanation),
          })),
      });
      return;
    }

    if (moduleName === "listening") {
      const options = toStringArray(item.options);
      const fallbackMcqs = options.length > 0
        ? [{
            id: 1,
            part: toText(item.part, "Part 1"),
            question: toText(item.question || item.questionText || item.title, "Listening question"),
            options,
            correctAnswer: normalizeOptionIndex(item.correctAnswer, options),
          }]
        : [];

      payload.listening.push({
        id: questionId,
        title: toText(item.title, "Listening exercise"),
        description: toText(item.description || item.questionText || item.question || item.text, "Listen and answer the questions."),
        duration: Number(item.duration) > 0 ? Number(item.duration) : 60,
        text: toText(item.text || item.audioText),
        mcqs: Array.isArray(item.mcqs)
          ? item.mcqs
              .filter(isRecord)
              .map((mcq, mcqIndex) => {
                const mcqOptions = toStringArray(mcq.options);
                return {
                  id: Number(mcq.id) || mcqIndex + 1,
                  part: toText(mcq.part, "Part 1"),
                  question: toText(mcq.question, "Listening question"),
                  options: mcqOptions,
                  correctAnswer: normalizeOptionIndex(mcq.correctAnswer, mcqOptions),
                };
              })
          : fallbackMcqs,
      });
      return;
    }

    if (moduleName === "writing") {
      payload.writing.push({
        id: questionId,
        prompt: toText(item.prompt || item.questionText || item.question || item.text, "Write a response."),
        emoji: toText(item.emoji, "WR"),
        timeLimit: toText(item.timeLimit, "5 minutes"),
        wordLimit: toText(item.wordLimit, "100-150 words"),
      });
      return;
    }

    if (moduleName === "speaking") {
      payload.speaking.push({
        id: questionId,
        prompt: toText(item.prompt || item.questionText || item.question || item.text, "Speak about the topic."),
        emoji: toText(item.emoji, "SP"),
        category: toText(item.category, "General"),
        prepTime: toText(item.prepTime, "30s"),
        speakingTime: toText(item.speakingTime, "60s"),
      });
      return;
    }

    if (moduleName === "practice") {
      payload.practice.push({
        id: questionId,
        type: toText(item.type, "multiple-choice"),
        category: toText(item.category, "General"),
        difficulty: toPracticeDifficulty(item.difficulty),
        question: toText(item.question || item.questionText || item.prompt || item.text, "Practice question"),
        options: toStringArray(item.options),
        correctAnswer: toText(item.correctAnswer, ""),
        explanation: toText(item.explanation),
        blanks: toStringArray(item.blanks),
        audioText: toText(item.audioText || item.text),
        imageUrl: toText(item.imageUrl),
      });
      return;
    }

    if (moduleName === "mock") {
      payload.mock.push({
        id: questionId,
        type: toText(item.type, "writing"),
        prompt: toText(item.prompt || item.questionText || item.question, "Mock test question"),
        options: toStringArray(item.options),
        answer: toText(item.answer || item.correctAnswer),
      });
    }
  });

  return payload;
};

export const getAllQuestions = async () => {
  const cacheKey = "public_questions_payload_v2";

  const cached = await safeGet(cacheKey);
  if (cached) {
    return JSON.parse(cached) as QuestionPayload;
  }

  const databaseQuestions = await Question.find({
    status: "published",
    targetType: { $in: ["both", "all"] },
  }).lean();

  if (databaseQuestions.length === 0) {
    const seededQuestions = loadSeededQuestions();
    if (seededQuestions) {
      await safeSet(cacheKey, JSON.stringify(seededQuestions), {
        EX: 86400,
      });
      return seededQuestions;
    }
  }

  const payload = transformQuestionsFromDatabase(databaseQuestions as LooseQuestionRecord[]);

  await safeSet(cacheKey, JSON.stringify(payload), {
    EX: 86400,
  });

  return payload;
};
