import { authService } from "@core/authService";
import { questionService } from "@shared/questionService";
import { userService } from "@core/userService";
import { aiService } from "@modules/ai/aiService";
import { apiClient } from "@shared/apiClient";

export const apiService = {
  ...authService,
  ...questionService,
  ...userService,
  ...aiService,
  fetch: <T>(endpoint: string, options?: RequestInit): Promise<T> => {
    return apiClient<T>(endpoint, options);
  }
};

// Also export 'api' if legacy code used `import { api } from "@shared/api"`
export const api = apiService;

// For any code that still needs the raw BASE_URL
export const BASE_URL = import.meta.env.VITE_API_URL || "https://your-production-api.com/api";
