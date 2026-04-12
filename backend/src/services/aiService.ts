import { safeGet, safeSet } from "../config/redis";
import crypto from "crypto";
import { OpenAIProvider } from "../providers/openai.provider";
import { IAIProvider } from "../providers/aiProvider.interface";
import { logger } from "../utils/logger";

// 1. Initialize the Provider Engine. 
const aiEngine: IAIProvider = new OpenAIProvider();

const SYSTEM_PROMPT = `
You are Sandy, an expert English language tutor. 
Your goal is to help students learn English vocabulary, grammar, and pronunciation. 
Always respond in an encouraging, clear, and concise manner.
If the user asks an irrelevant question, gently guide them back to learning English.
`;

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const getFriendlyAIErrorReply = (error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  const lowerMessage = message.toLowerCase();

  if (message.includes("OPENAI_API_KEY_MISSING")) {
    return "AI is not configured yet. Add OPENAI_API_KEY to backend/.env and restart the backend server.";
  }

  if (lowerMessage.includes("incorrect api key") || lowerMessage.includes("invalid api key")) {
    return "The configured OpenAI API key looks invalid. Update OPENAI_API_KEY in backend/.env and restart the backend server.";
  }

  return "I'm having a little trouble thinking of an answer right now. Could you please check your internet connection or try asking again in a few moments?";
};

export const askAI = async (prompt: string, retries = 3) => {
  const startTime = performance.now();
  const hash = crypto.createHash("md5").update(prompt).digest("hex");
  const cacheKey = `ai_response:${hash}`;

  const cached = await safeGet(cacheKey);
  if (cached) {
    const elapsed = Math.round(performance.now() - startTime);
    logger.info("AI Cache Hit ✅", { ms: elapsed, hash });
    return JSON.parse(cached);
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      logger.info(`Sending Request to AI Engine ⏳`, { attempt, hash });
      
      const replyText = await aiEngine.generateText({
        systemPrompt: SYSTEM_PROMPT,
        userPrompt: prompt,
        temperature: 0.7
      });

      const elapsed = Math.round(performance.now() - startTime);
      logger.info("AI Engine Success 🤖", { ms: elapsed, attempt, cacheKey });

      const result = { reply: replyText };
      
      await safeSet(cacheKey, JSON.stringify(result), { EX: 86400 });
      return result;

    } catch (caughtError: unknown) {
      const error = caughtError instanceof Error ? caughtError : new Error(String(caughtError));
      logger.error(`AI Engine Error ❌`, { message: error.message, attempt, maxRetries: retries });
      
      if (attempt === retries) {
        logger.error("AI Engine exhausted all retries. Falling back.");
        return {
          reply: getFriendlyAIErrorReply(error),
        };
      }
      
      await sleep(1000 * attempt);
    }
  }
};
