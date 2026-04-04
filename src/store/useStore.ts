import { create } from "zustand";
import { api } from "../services/api";

interface User {
    id: string;
    email: string;
    name?: string;
    level?: number;
    score?: number;
    streak?: number;
    role?: string;
    createdAt?: string;
}

interface AppState {
    user: User | null;
    loading: boolean;
    error: string | null;
    setUser: (user: User | null) => void;
    fetchUser: () => Promise<void>;
    clearUser: () => void;
}

export const useStore = create<AppState>((set) => ({
    user: null,
    loading: false,
    error: null,

    setUser: (user) => set({ user }),

    fetchUser: async () => {
        set({ loading: true, error: null });
        try {
            const data = await api.getProfile();
            set({ user: data, loading: false });
        } catch (err: any) {
            set({ error: err.message, loading: false });
        }
    },

    clearUser: () => {
        localStorage.removeItem("token");
        set({ user: null, error: null });
    },
}));
