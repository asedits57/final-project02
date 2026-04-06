import { apiClient } from "./apiClient";

export const questionService = {
  fetchQuestions() {
    return apiClient("/questions");
  }
};
