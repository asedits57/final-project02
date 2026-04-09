import { create } from "zustand";
import { authService } from "@services/authService";
import { clearOtpSession } from "@lib/otpSession";

interface User {
    id: string;
    email: string;
    name?: string;
    fullName?: string;
    username?: string;
    dept?: string;
    avatar?: string;
    level?: number;
    score?: number;
    streak?: number;
    role?: string;
    oauthProvider?: "local" | "google" | "github";
    isVerified?: boolean;
    hasPassword?: boolean;
    verifiedAt?: string;
    createdAt?: string;
}

interface AuthState {
    user: User | null;
    loading: boolean;
    error: string | null;
    setUser: (user: User | null) => void;
    clearUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    loading: false,
    error: null,

    setUser: (user) => set({ user }),

    clearUser: async () => {
        set({ loading: true });
        try {
            await authService.logout();
            localStorage.removeItem("token");
        } catch (err) {
            console.warn("Logout failed:", err);
            localStorage.removeItem("token"); // clear it anyway
        }
        clearOtpSession();
        set({ user: null, loading: false, error: null });
    },
}));

// Legacy alias to reduce initial breakage
export const useStore = useAuthStore;

// Listen for session expiry from API utility
if (typeof window !== "undefined") {
  window.addEventListener("session-expired", () => {
    clearOtpSession();
    useAuthStore.getState().setUser(null);
  });
}
