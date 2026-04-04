const BASE_URL = import.meta.env.VITE_API_URL || "/api";

export const api = {
  async request(endpoint: string, method = "GET", body?: any) {
    const token = localStorage.getItem("token");

    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      ...(body && { body: JSON.stringify(body) }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Something went wrong");
    }

    return data;
  },

  register(email: string, password: string) {
    return this.request("/register", "POST", { email, password });
  },

  login(email: string, password: string) {
    return this.request("/login", "POST", { email, password });
  },

  getProfile() {
    return this.request("/profile");
  },

  updateProgress(score: number) {
    return this.request("/progress", "POST", { score });
  },

  fetchQuestions() {
    return this.request("/questions");
  },

  getLeaderboard() {
    return this.request("/leaderboard");
  },

  async processAI(tool: string, text: string) {
    return this.request("/ai/generate", "POST", { prompt: `${tool}: ${text}` });
  },

  askAI(prompt: string) {
    return this.request("/ai/generate", "POST", { prompt });
  }
};
