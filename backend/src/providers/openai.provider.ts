import OpenAI from "openai";
import { IAIProvider, IAIPayload } from "./aiProvider.interface";

export class OpenAIProvider implements IAIProvider {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || "dummy_key_to_prevent_local_crash",
    });
  }

  async generateText(payload: IAIPayload): Promise<string> {
    const response = await this.openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: payload.systemPrompt },
        { role: "user", content: payload.userPrompt },
      ],
      temperature: payload.temperature ?? 0.7,
    }, { timeout: 8000 }); // Abort request after 8 seconds of hanging

    return response.choices[0].message?.content || "No response generated.";
  }
}
