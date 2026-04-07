import { apiClient, setAccessToken } from "@shared/apiClient";

export interface User {
  id: string;
  _id?: string;
  email: string;
  fullName?: string;
  username?: string;
  dept?: string;
  score: number;
  streak: number;
  level: number;
  createdAt?: string;
}

export interface AuthResponse {
  success: boolean;
  user: User;
  accessToken: string;
  message?: string;
}

export const authService = {
  async register(email: string, password: string, fullName?: string, username?: string, dept?: string): Promise<AuthResponse> {
    const data = await apiClient<AuthResponse>("/register", { 
      method: "POST", 
      body: JSON.stringify({ email, password, fullName, username, dept }) 
    });
    setAccessToken(data.accessToken);
    return data;
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const data = await apiClient<AuthResponse>("/login", { 
      method: "POST", 
      body: JSON.stringify({ email, password }) 
    });
    setAccessToken(data.accessToken);
    return data;
  },

  async logout(): Promise<void> {
    await apiClient<void>("/logout", { method: "POST" });
    setAccessToken(null);
  }
};
