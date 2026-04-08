import { authService } from "@services/authService";
import { questionService } from "@services/questionService";
import { userService } from "@services/userService";
import { aiService } from "@services/aiService";
import { apiClient } from "@services/apiClient";

export const apiService = {
  ...authService,
  ...questionService,
  ...userService,
  ...aiService,
  fetch: <T>(endpoint: string, options?: RequestInit): Promise<T> => {
    return apiClient<T>(endpoint, options);
  }
};

// Also export 'api' if legacy code used `import { api } from "@services/apiService"`
export const api = apiService;

// For any code that still needs the raw BASE_URL
export const BASE_URL = import.meta.env.VITE_API_URL || "https://your-production-api.com/api";
