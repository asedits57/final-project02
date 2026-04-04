const BASE_URL = import.meta.env.VITE_API_URL || "/api";

export const api = {
  async request(endpoint: string, method = "GET", body?: any) {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      ...(body && { body: JSON.stringify(body) }),
    });

    const data = await res.json();

    let errorMessage = data.message || data.error || "Something went wrong";
    
    // Try to parse Zod-style array errors if they arrive as strings
    if (typeof errorMessage === "string" && errorMessage.startsWith("[")) {
      try {
        const parsed = JSON.parse(errorMessage);
        if (Array.isArray(parsed)) {
          errorMessage = parsed.map((e: any) => e.message).join(", ");
        }
      } catch (e) {
        // Fallback to original message
      }
    }

    if (!res.ok) {
      throw new Error(errorMessage);
    }

    return data;
  },

  register(email: string, password: string, fullName?: string, username?: string, dept?: string) {
    return this.request("/register", "POST", { email, password, fullName, username, dept });
  },

  login(email: string, password: string) {
    return this.request("/login", "POST", { email, password });
  },

  getProfile() {
    return this.request("/profile");
  },

  updateProfile(data: any) {
    return this.request("/profile", "PUT", data);
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
