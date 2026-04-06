import { apiClient } from "@shared/apiClient";

export const aiService = {
  processAI(tool: string, text: string) {
    return apiClient("/ai/generate", { 
      method: "POST", 
      body: JSON.stringify({ prompt: `${tool}: ${text}` }) 
    });
  },

  askAI(prompt: string) {
    return apiClient("/ai/generate", { 
      method: "POST", 
      body: JSON.stringify({ prompt }) 
    });
  },

  async generateCompletion(prompt: string): Promise<string> {
    try {
      const result = await this.askAI(prompt);
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
