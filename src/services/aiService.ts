import { apiClient } from "@services/apiClient";
import { findLocalSpellingIssues, mergeSpellingIssues } from "@lib/spellcheck";

export interface GrammarIssue {
  issue: string;
  suggestion: string;
}

export interface SpellingIssue {
  word: string;
  suggestion: string;
}

export interface WritingEvaluation {
  score: number;
  grammar: number;
  vocabulary: number;
  clarity: number;
  suggestions: string[];
}

export interface SpeakingEvaluation {
  overall: number;
  pronunciation: number;
  fluency: number;
  coherence: number;
  tips: string[];
}

export interface ListeningReview {
  message: string;
  tips: string[];
}

type AIResult = {
  reply?: string;
  fallback?: boolean;
  errorCode?: string;
};

type StudyModule = "grammar" | "reading" | "listening" | "writing" | "speaking";

const requestAI = (prompt: string): Promise<AIResult> => {
  return apiClient<AIResult>("/ai/generate", {
    method: "POST",
    body: JSON.stringify({ prompt }),
  });
};

const getReplyText = (result: AIResult | string | null | undefined): string => {
  if (!result) {
    return "";
  }

  if (typeof result === "string") {
    return result;
  }

  return typeof result.reply === "string" ? result.reply : "";
};

const getAIFailureMessage = (result: AIResult | string | null | undefined): string | null => {
  if (!result || typeof result === "string") {
    return null;
  }

  if (result.fallback || result.errorCode) {
    return getReplyText(result).trim() || "AI is temporarily unavailable.";
  }

  return null;
};

const requireOperationalAI = (result: AIResult | string | null | undefined) => {
  const failureMessage = getAIFailureMessage(result);
  if (failureMessage) {
    throw new Error(failureMessage);
  }

  return result;
};

const extractStructuredChunk = (text: string): string => {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);

  if (fenced?.[1]) {
    return fenced[1].trim();
  }

  const firstArray = trimmed.indexOf("[");
  const lastArray = trimmed.lastIndexOf("]");

  if (firstArray !== -1 && lastArray > firstArray) {
    return trimmed.slice(firstArray, lastArray + 1);
  }

  const firstObject = trimmed.indexOf("{");
  const lastObject = trimmed.lastIndexOf("}");

  if (firstObject !== -1 && lastObject > firstObject) {
    return trimmed.slice(firstObject, lastObject + 1);
  }

  return trimmed;
};

const parseStructuredReply = <T>(result: AIResult | string, fallback: T): T => {
  const replyText = extractStructuredChunk(getReplyText(result));

  try {
    return JSON.parse(replyText) as T;
  } catch {
    return fallback;
  }
};

export const aiService = {
  processAI(tool: string, text: string): Promise<any> {
    return requestAI(`${tool}: ${text}`);
  },

  askAI(prompt: string): Promise<AIResult> {
    return requestAI(prompt);
  },

  async translateText(text: string, fromLanguage: string, toLanguage: string): Promise<string> {
    const result = requireOperationalAI(await requestAI(
      `Translate the following text from ${fromLanguage} to ${toLanguage}. Return only the translated text, nothing else.\n\n"${text.trim()}"`
    ));
    return getReplyText(result).trim();
  },

  async improveSentence(text: string): Promise<string> {
    const result = requireOperationalAI(await requestAI(
      `Improve the following English sentence. Return only the improved sentence, nothing else.\n\n"${text.trim()}"`
    ));
    return getReplyText(result).trim();
  },

  async checkGrammar(text: string): Promise<GrammarIssue[]> {
    const result = requireOperationalAI(await requestAI(
      `Check the grammar of the following text and return a JSON array of objects with "issue" and "suggestion" fields. Only return the JSON array, nothing else.\n\nText: "${text.trim()}"`
    ));
    return parseStructuredReply<GrammarIssue[]>(result, []);
  },

  async checkSpelling(text: string): Promise<SpellingIssue[]> {
    const localIssues = findLocalSpellingIssues(text);
    try {
      const result = await requestAI(
        [
          "Check the spelling of the following text.",
          'Return only a JSON array of objects with "word" and "suggestion" fields.',
          "List every clearly misspelled word.",
          "Treat phonetic spellings, chat spellings, and malformed words as incorrect if they are not valid standard English.",
          'Example: for "gudu morning", return [{"word":"gudu","suggestion":"good"}].',
          `Text: "${text.trim()}"`,
        ].join("\n\n")
      );
      const failureMessage = getAIFailureMessage(result);
      if (failureMessage) {
        if (localIssues.length > 0) {
          return localIssues;
        }

        throw new Error(failureMessage);
      }

      const aiIssues = parseStructuredReply<SpellingIssue[]>(result, []);
      return mergeSpellingIssues(localIssues, Array.isArray(aiIssues) ? aiIssues : []);
    } catch (error) {
      if (localIssues.length > 0) {
        return localIssues;
      }

      throw error;
    }
  },

  async evaluateWriting(prompt: string, submission: string): Promise<WritingEvaluation> {
    const result = requireOperationalAI(await requestAI(
      [
        "Evaluate this English writing response for a learner.",
        'Return only valid JSON with the shape {"score":number,"grammar":number,"vocabulary":number,"clarity":number,"suggestions":["","",""]}.',
        "Scores must be integers from 0 to 100.",
        "Suggestions must be specific, short, encouraging, and actionable.",
        `Task prompt: ${prompt}`,
        `Student submission: ${submission.trim() || "No response submitted."}`,
      ].join("\n\n")
    ));

    return parseStructuredReply<WritingEvaluation>(result, {
      score: 0,
      grammar: 0,
      vocabulary: 0,
      clarity: 0,
      suggestions: [],
    });
  },

  async evaluateSpeaking(prompt: string, transcript: string): Promise<SpeakingEvaluation> {
    const result = requireOperationalAI(await requestAI(
      [
        "Evaluate this spoken English response for a learner.",
        'Return only valid JSON with the shape {"overall":number,"pronunciation":number,"fluency":number,"coherence":number,"tips":["","",""]}.',
        "Scores must be integers from 0 to 100.",
        "Tips must be specific, short, encouraging, and actionable.",
        `Speaking prompt: ${prompt}`,
        `Transcript: ${transcript.trim() || "No speech detected."}`,
      ].join("\n\n")
    ));

    return parseStructuredReply<SpeakingEvaluation>(result, {
      overall: 0,
      pronunciation: 0,
      fluency: 0,
      coherence: 0,
      tips: [],
    });
  },

  async reviewListeningPerformance(params: {
    title: string;
    transcript: string;
    score: number;
    totalQuestions: number;
    incorrectQuestions: string[];
  }): Promise<ListeningReview> {
    const result = requireOperationalAI(await requestAI(
      [
        "You are reviewing a listening exercise for an English learner.",
        'Return only valid JSON with the shape {"message":string,"tips":["","",""]}.',
        "Keep the message concise, encouraging, and focused on listening skills.",
        `Exercise title: ${params.title}`,
        `Transcript or source text: ${params.transcript}`,
        `Score: ${params.score} out of 100 across ${params.totalQuestions} questions.`,
        params.incorrectQuestions.length > 0
          ? `Questions the learner missed: ${params.incorrectQuestions.join(" | ")}`
          : "The learner answered every question correctly.",
      ].join("\n\n")
    ));

    return parseStructuredReply<ListeningReview>(result, {
      message: "",
      tips: [],
    });
  },

  async askModuleCoach(module: StudyModule, context: string, question: string): Promise<string> {
    const result = requireOperationalAI(await requestAI(
      [
        `You are a supportive AI coach for the ${module} module of an English-learning app.`,
        "Answer clearly, keep the explanation concise, and stay focused on improving the learner's English.",
        "Use short paragraphs or bullets only when helpful.",
        `Context:\n${context}`,
        `Learner question: ${question.trim()}`,
      ].join("\n\n")
    ));

    return getReplyText(result).trim();
  },

  async askSupportAssistant(question: string, context = ""): Promise<string> {
    const result = requireOperationalAI(await requestAI(
      [
        "You are a support assistant for an AI-powered English learning platform.",
        "Answer with practical troubleshooting steps, mention product limitations when relevant, and suggest human support only when needed.",
        context ? `Current page context: ${context}` : "",
        `User issue: ${question.trim()}`,
      ]
        .filter(Boolean)
        .join("\n\n")
    ));

    return getReplyText(result).trim();
  },

  async askLearningCoach(area: string, context: string, question: string): Promise<string> {
    const result = requireOperationalAI(await requestAI(
      [
        `You are a study coach for the ${area} area of an AI-powered English learning platform.`,
        "Help the learner understand the material, suggest what to do next, and keep the answer practical and encouraging.",
        "Use the provided context so the learner can ask short follow-up questions.",
        `Context:\n${context}`,
        `Learner question: ${question.trim()}`,
      ].join("\n\n")
    ));

    return getReplyText(result).trim();
  },

  async generateCompletion(prompt: string): Promise<string> {
    try {
      const result = requireOperationalAI(await requestAI(prompt));
      return getReplyText(result);
    } catch (error) {
      console.error("AI Generation Error:", error);
      throw error;
    }
  },

  async evaluateResponse(context: string, answer: string): Promise<string> {
    return this.generateCompletion(`Context: ${context}\nUser Answer: ${answer}\nEvaluate the answer and provide constructive feedback.`);
  }
};
