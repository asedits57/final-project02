export interface IAIPayload {
  systemPrompt: string;
  userPrompt: string;
  temperature?: number;
}

export interface IAIProvider {
  /**
   * Abstracted method that generates text output from the implemented AI provider.
   * @param payload Standardized payload across all engine types
   */
  generateText(payload: IAIPayload): Promise<string>;
}
