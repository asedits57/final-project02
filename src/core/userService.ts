import { apiClient } from "@shared/apiClient";

export const userService = {
  getProfile() {
    return apiClient("/profile");
  },

  updateProfile(data: any) {
    return apiClient("/profile", { method: "PUT", body: JSON.stringify(data) });
  },

  updateProgress(score: number) {
    return apiClient("/progress", { method: "POST", body: JSON.stringify({ score }) });
  },

  getLeaderboard() {
    return apiClient("/leaderboard");
  }
};
