import { safeGet, safeSet } from "../config/redis";
import crypto from "crypto";
import { OpenAIProvider } from "../providers/openai.provider";
import { IAIProvider } from "../providers/aiProvider.interface";

// 1. Initialize the Provider Engine. 
// Standardized so we can easily swap to `new GeminiProvider()` here later without touching logic!
const aiEngine: IAIProvider = new OpenAIProvider();

const SYSTEM_PROMPT = `
You are Sandy, an expert English language tutor. 
Your goal is to help students learn English vocabulary, grammar, and pronunciation. 
Always respond in an encouraging, clear, and concise manner.
If the user asks an irrelevant question, gently guide them back to learning English.
`;

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const askAI = async (prompt: string, retries = 3) => {
  const hash = crypto.createHash("md5").update(prompt).digest("hex");
  const cacheKey = `ai_response:${hash}`;

  const cached = await safeGet(cacheKey);
  if (cached) {
    console.log("Serving AI response from Cache 🤖");
    return JSON.parse(cached);
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      // 2. We no longer care IF this is OpenAI or Gemini. 
      // We just pass the strict IAIPayload down to the engine layer!
      const replyText = await aiEngine.generateText({
        systemPrompt: SYSTEM_PROMPT,
        userPrompt: prompt,
        temperature: 0.7
      });

      const result = { reply: replyText };
      
      await safeSet(cacheKey, JSON.stringify(result), { EX: 86400 });
      return result;

    } catch (error: any) {
      console.error(`AI Engine Error (Attempt ${attempt}/${retries}):`, error.message);
      
      if (attempt === retries) {
        return {
          reply: "I'm having a little trouble thinking of an answer right now. Could you please check your internet connection or try asking again in a few moments?",
        };
      }
      
      await sleep(1000 * attempt);
    }
  }
};
