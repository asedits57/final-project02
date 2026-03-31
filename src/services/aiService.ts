import { toast } from "sonner";

export type AITool = "translate" | "grammar" | "improve" | "spelling" | "evaluate";

export interface AIResponse {
  result: string;
  suggestions?: string[];
  score?: number;
  error?: string;
}

export interface AIRequest {
  tool: AITool;
  text: string;
  fromLang?: string;
  toLang?: string;
}

/**
 * AI Service for Language Intelligence
 * This handles all communication with AI models for translation and evaluation.
 */
export const aiService = {
  /**
   * Calls the AI backend with a specific tool and text input.
   */
  async process(request: AIRequest): Promise<string> {
    try {
      // In a real app, this would be an API call to your backend or Edge Function
      // For now, we wrap the existing custom LLM tool logic if it exists, 
      // or provide a clear interface for future expansion.
      
      const response = await fetch("/api/ai-process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`AI service failed with status ${response.status}`);
      }

      const data = await response.json();
      return data.result || "";

    } catch (error) {
      console.error("AI Service Error:", error);
      toast.error("AI service is currently unavailable. Please try again later.");
      throw error;
    }
  },

  /**
   * Specifically for translating text between languages.
   */
  async translate(text: string, from: string, to: string): Promise<string> {
    return this.process({ tool: "translate", text, fromLang: from, toLang: to });
  },

  /**
   * Specifically for grammar and spelling evaluation.
   */
  async evaluate(text: string): Promise<string> {
    return this.process({ tool: "evaluate", text });
  }
};
