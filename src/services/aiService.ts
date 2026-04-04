import { api } from "./api";

export const aiService = {
  async generateCompletion(prompt: string): Promise<string> {
    try {
      const result = await api.askAI(prompt);
      return result.reply || result;
    } catch (error) {
      console.error("AI Generation Error:", error);
      throw error;
    }
  },

  async evaluateResponse(context: string, answer: string): Promise<string> {
    return this.generateCompletion(`Context: ${context}\nUser Answer: ${answer}\nEvaluate the answer and provide constructive feedback.`);
  }
};
