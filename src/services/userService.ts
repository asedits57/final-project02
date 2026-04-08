import { apiClient } from "@services/apiClient";
import { User } from "./authService";

export const userService = {
  fetchProfile(): Promise<User> {
    return apiClient<User>("/profile");
  },

  updateProfile(data: Partial<User>): Promise<User> {
    return apiClient<User>("/profile", { 
      method: "PUT", 
      body: JSON.stringify(data) 
    });
  },

  updateProgress(score: number): Promise<User> {
    return apiClient<User>("/progress", { 
      method: "POST", 
      body: JSON.stringify({ score }) 
    });
  },

  fetchLeaderboard(): Promise<User[]> {
    return apiClient<User[]>("/leaderboard");
  }
};
