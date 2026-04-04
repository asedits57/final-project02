import OpenAI from "openai";
import { safeGet, safeSet } from "../config/redis";
import crypto from "crypto";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "dummy_key_to_prevent_local_crash",
});

export const askAI = async (prompt: string) => {
  const hash = crypto.createHash("md5").update(prompt).digest("hex");
  const cacheKey = `ai_response:${hash}`;

  const cached = await safeGet(cacheKey);
  if (cached) {
    console.log("Serving AI response from Cache 🤖");
    return JSON.parse(cached);
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    const result = {
      reply: response.choices[0].message?.content || "No response generated.",
    };

    await safeSet(cacheKey, JSON.stringify(result), {
      EX: 86400, // 24 hours
    });

    return result;
  } catch (error) {
    console.error("AI Service Error:", error);
    return {
      reply: "AI temporarily unavailable. Please make sure your API key is configured.",
    };
  }
};
