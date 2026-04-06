import { apiClient, setAccessToken } from "@shared/apiClient";

export const authService = {
  async register(email: string, password: string, fullName?: string, username?: string, dept?: string) {
    const data = await apiClient("/register", { 
      method: "POST", 
      body: JSON.stringify({ email, password, fullName, username, dept }) 
    });
    setAccessToken(data.accessToken);
    return data;
  },

  async login(email: string, password: string) {
    const data = await apiClient("/login", { 
      method: "POST", 
      body: JSON.stringify({ email, password }) 
    });
    setAccessToken(data.accessToken);
    return data;
  },

  async logout() {
    await apiClient("/logout", { method: "POST" });
    setAccessToken(null);
  }
};
