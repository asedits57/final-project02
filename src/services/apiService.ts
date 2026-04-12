import { authService } from "@services/authService";
import { questionService } from "@services/questionService";
import { userService } from "@services/userService";
import { aiService } from "@services/aiService";
import { adminService } from "@services/adminService";
import { finalTestService } from "@services/finalTestService";
import { learningContentService } from "@services/learningContentService";
import { notificationService } from "@services/notificationService";
import { apiClient, API_BASE_URL } from "@services/apiClient";

export const apiService = {
  ...authService,
  ...questionService,
  ...userService,
  ...aiService,
  ...adminService,
  ...finalTestService,
  ...learningContentService,
  ...notificationService,
  fetch: <T>(endpoint: string, options?: RequestInit): Promise<T> => {
    return apiClient<T>(endpoint, options);
  }
};

// Also export 'api' if legacy code used `import { api } from "@services/apiService"`
export const api = apiService;

// For any code that still needs the raw BASE_URL
export const BASE_URL = API_BASE_URL;
