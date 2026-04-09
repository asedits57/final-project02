import crypto from "crypto";
import { safeGet, safeSet } from "../config/redis";
import { OpenAIProvider } from "../providers/openai.provider";
import { IAIProvider } from "../providers/aiProvider.interface";
import { logger } from "../utils/logger";
import { classifyAIError, getFriendlyAIErrorReply, isRetryableAIError } from "../utils/aiError";

const aiEngine: IAIProvider = new OpenAIProvider();

const SYSTEM_PROMPT = `
You are Sandy, an expert English language tutor.
Your goal is to help students learn English vocabulary, grammar, and pronunciation.
Always respond in an encouraging, clear, and concise manner.
If the user asks an irrelevant question, gently guide them back to learning English.
`;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const askAI = async (prompt: string, retries = 3) => {
  const startTime = performance.now();
  const hash = crypto.createHash("md5").update(prompt).digest("hex");
  const cacheKey = `ai_response:${hash}`;

  const cached = await safeGet(cacheKey);
  if (cached) {
    const elapsed = Math.round(performance.now() - startTime);
    logger.info("AI cache hit", { ms: elapsed, hash });
    return JSON.parse(cached);
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      logger.info("Sending request to AI engine", { attempt, hash });

      const replyText = await aiEngine.generateText({
        systemPrompt: SYSTEM_PROMPT,
        userPrompt: prompt,
        temperature: 0.7,
      });

      const elapsed = Math.round(performance.now() - startTime);
      logger.info("AI engine success", { ms: elapsed, attempt, cacheKey });

      const result = { reply: replyText };
      await safeSet(cacheKey, JSON.stringify(result), { EX: 86400 });
      return result;
    } catch (error: any) {
      const errorCode = classifyAIError(error);
      logger.error("AI engine error", {
        message: error?.message,
        status: error?.status,
        errorCode,
        attempt,
        maxRetries: retries,
      });

      if (!isRetryableAIError(error) || attempt === retries) {
        if (attempt === retries) {
          logger.error("AI engine exhausted all retries. Falling back.");
        }

        return {
          reply: getFriendlyAIErrorReply(error),
          fallback: true,
          errorCode,
        };
      }

      await sleep(1000 * attempt);
    }
  }
};
