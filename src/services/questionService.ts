export interface ReadingQuestion {
  id?: number | string;
  question: string;
  options: string[];
  answer: string;
  explanation?: string;
}

export interface ReadingPassage {
  id?: number | string;
  title: string;
  content: string;
  questions: ReadingQuestion[];
}

export interface ListeningExercise {
  id?: number | string;
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
  id: number | string;
  prompt: string;
  emoji: string;
  timeLimit: string;
  wordLimit: string;
}

export interface SpeakingPrompt {
  id: number | string;
  prompt: string;
  emoji: string;
  category: string;
  prepTime: string;
  speakingTime: string;
}

export interface GrammarQuestion {
  id: number | string;
  question: string;
  options: string[];
  correctAnswer: number | string;
  explanation?: string;
}

export interface PracticeQuestion {
  id: number | string;
  type: string;
  category: string;
  difficulty: string;
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation?: string;
  blanks?: string[];
  audioText?: string;
  imageUrl?: string;
}

export interface MockQuestion {
  id: number | string;
  type: "reading" | "listening" | "writing" | "speaking";
  prompt: string;
  options?: string[];
  answer?: string;
}

export interface QuestionData {
  grammar: GrammarQuestion[];
  reading: ReadingPassage[];
  listening: ListeningExercise[];
  writing: WritingTask[];
  speaking: SpeakingPrompt[];
  practice: PracticeQuestion[];
  mock: MockQuestion[];
}

type LooseRecord = Record<string, unknown>;

const BASE_URL = import.meta.env.VITE_API_URL || "/api/v1";

const emptyQuestionData = (): QuestionData => ({
  grammar: [],
  reading: [],
  listening: [],
  writing: [],
  speaking: [],
  practice: [],
  mock: [],
});

const isRecord = (value: unknown): value is LooseRecord =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

const toText = (value: unknown, fallback = "") =>
  typeof value === "string" ? value : typeof value === "number" ? String(value) : fallback;

const toStringArray = (value: unknown): string[] =>
  Array.isArray(value) ? value.map((item) => toText(item)).filter(Boolean) : [];

const normalizeOptionIndex = (correctAnswer: unknown, options: string[]) => {
  if (typeof correctAnswer === "number" && Number.isFinite(correctAnswer)) {
    return correctAnswer;
  }

  const asText = toText(correctAnswer).trim();
  if (!asText) {
    return 0;
  }

  const numeric = Number(asText);
  if (Number.isFinite(numeric)) {
    return numeric;
  }

  const letterCode = asText.toUpperCase().charCodeAt(0);
  if (letterCode >= 65 && letterCode <= 90 && asText.length === 1) {
    return letterCode - 65;
  }

  const matchedOptionIndex = options.findIndex((option) => option === asText);
  return matchedOptionIndex >= 0 ? matchedOptionIndex : 0;
};

const toPracticeDifficulty = (value: unknown) => {
  const normalized = toText(value, "Beginner").trim().toLowerCase();

  if (normalized === "easy" || normalized === "beginner") return "Beginner";
  if (normalized === "medium" || normalized === "intermediate") return "Intermediate";
  if (normalized === "hard" || normalized === "advanced") return "Advanced";
  if (normalized === "expert") return "Expert";

  return "Beginner";
};

const toModuleName = (item: LooseRecord) =>
  toText(item.module || item.category || item.targetType, "").trim().toLowerCase();

const normalizeGroupedPayload = (input: LooseRecord): QuestionData => {
  const fallback = emptyQuestionData();

  return {
    grammar: Array.isArray(input.grammar) ? (input.grammar as GrammarQuestion[]) : fallback.grammar,
    reading: Array.isArray(input.reading) ? (input.reading as ReadingPassage[]) : fallback.reading,
    listening: Array.isArray(input.listening) ? (input.listening as ListeningExercise[]) : fallback.listening,
    writing: Array.isArray(input.writing) ? (input.writing as WritingTask[]) : fallback.writing,
    speaking: Array.isArray(input.speaking) ? (input.speaking as SpeakingPrompt[]) : fallback.speaking,
    practice: Array.isArray(input.practice) ? (input.practice as PracticeQuestion[]) : fallback.practice,
    mock: Array.isArray(input.mock) ? (input.mock as MockQuestion[]) : fallback.mock,
  };
};

const transformFlatPayload = (items: LooseRecord[]): QuestionData => {
  const grouped = emptyQuestionData();

  items.forEach((item) => {
    const moduleName = toModuleName(item);
    const rawId = item.id ?? item._id ?? `${moduleName}-${grouped.grammar.length + grouped.reading.length + grouped.listening.length + grouped.writing.length + grouped.speaking.length}`;

    if (moduleName === "grammar") {
      const options = toStringArray(item.options);
      grouped.grammar.push({
        id: rawId as number | string,
        question: toText(item.question || item.questionText || item.text, "Untitled grammar question"),
        options,
        correctAnswer: normalizeOptionIndex(item.correctAnswer, options),
        explanation: toText(item.explanation),
      });
      return;
    }

    if (moduleName === "reading" && Array.isArray(item.questions)) {
      grouped.reading.push({
        id: rawId as number | string,
        title: toText(item.title, "Reading passage"),
        content: toText(item.content || item.text, ""),
        questions: item.questions
          .filter(isRecord)
          .map((question, index) => ({
            id: (question.id ?? `${rawId}-q-${index + 1}`) as number | string,
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
      const defaultMcq = options.length > 0
        ? [{
            id: 1,
            part: toText(item.part, "Part 1"),
            question: toText(item.question || item.questionText || item.title, "Listening question"),
            options,
            correctAnswer: normalizeOptionIndex(item.correctAnswer, options),
          }]
        : undefined;

      grouped.listening.push({
        id: rawId as number | string,
        title: toText(item.title, "Listening exercise"),
        description: toText(item.description || item.questionText || item.question || item.text, "Listen carefully and answer the questions."),
        duration: Number(item.duration) > 0 ? Number(item.duration) : 60,
        text: toText(item.text || item.audioText),
        mcqs: Array.isArray(item.mcqs)
          ? item.mcqs
              .filter(isRecord)
              .map((mcq, index) => ({
                id: Number(mcq.id) || index + 1,
                part: toText(mcq.part, "Part 1"),
                question: toText(mcq.question, "Listening question"),
                options: toStringArray(mcq.options),
                correctAnswer: normalizeOptionIndex(mcq.correctAnswer, toStringArray(mcq.options)),
              }))
          : defaultMcq,
      });
      return;
    }

    if (moduleName === "writing") {
      grouped.writing.push({
        id: rawId as number | string,
        prompt: toText(item.prompt || item.questionText || item.question || item.text, "Write a short response."),
        emoji: toText(item.emoji, "WR"),
        timeLimit: toText(item.timeLimit, "5 minutes"),
        wordLimit: toText(item.wordLimit, "100-150 words"),
      });
      return;
    }

    if (moduleName === "speaking") {
      grouped.speaking.push({
        id: rawId as number | string,
        prompt: toText(item.prompt || item.questionText || item.question || item.text, "Speak about the topic below."),
        emoji: toText(item.emoji, "SP"),
        category: toText(item.category, "General"),
        prepTime: toText(item.prepTime, "30s"),
        speakingTime: toText(item.speakingTime, "60s"),
      });
      return;
    }

    if (moduleName === "practice") {
      grouped.practice.push({
        id: rawId as number | string,
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
      grouped.mock.push({
        id: rawId as number | string,
        type: (toText(item.type, "writing") as MockQuestion["type"]),
        prompt: toText(item.prompt || item.questionText || item.question, "Mock test question"),
        options: toStringArray(item.options),
        answer: toText(item.answer || item.correctAnswer),
      });
    }
  });

  return grouped;
};

const normalizeQuestionPayload = (payload: unknown): QuestionData => {
  if (Array.isArray(payload)) {
    return transformFlatPayload(payload.filter(isRecord));
  }

  if (isRecord(payload)) {
    if (isRecord(payload.data)) {
      return normalizeQuestionPayload(payload.data);
    }

    return normalizeGroupedPayload(payload);
  }

  return emptyQuestionData();
};

const buildQuestionsUrl = () =>
  `${BASE_URL.replace(/\/$/, "")}/questions`;

const buildQuestionErrorMessage = (status: number, message?: string) => {
  if (status === 401 || status === 403) {
    return "Task content is public, but the request was blocked. Please refresh and try again.";
  }

  return message || "Failed to load task content. Please try again.";
};

export const questionService = {
  async fetchQuestions(): Promise<QuestionData> {
    let response: Response;

    try {
      response = await fetch(buildQuestionsUrl(), {
        method: "GET",
        credentials: "include",
      });
    } catch {
      throw new Error("Could not reach the task server. Please check that the backend is running.");
    }

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(buildQuestionErrorMessage(response.status, toText((payload as LooseRecord).message || (payload as LooseRecord).error)));
    }

    return normalizeQuestionPayload(payload);
  },
};
