import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserProfile {
  id: string;
  username: string;
  fullName?: string | null;
  dept?: string | null;
  email?: string | null;
  avatar_url?: string;
  xp: number;
  level: number;
  streak: number;
  lastActive?: string;
}

interface AppState {
  user: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  
  // Actions
  setUser: (user: UserProfile | null) => void;
  updateXP: (amount: number) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: false,
      isAuthenticated: false,

      setUser: (user) => set({ 
        user, 
        isAuthenticated: !!user,
        isLoading: false 
      }),

      updateXP: (amount) => set((state) => {
        if (!state.user) return state;
        const newXP = state.user.xp + amount;
        const newLevel = Math.floor(newXP / 1000) + 1; // Simple level logic
        
        return {
          user: {
            ...state.user,
            xp: newXP,
            level: newLevel
          }
        };
      }),

      setLoading: (loading) => set({ isLoading: loading }),

      logout: () => set({ 
        user: null, 
        isAuthenticated: false 
      }),
    }),
    {
      name: 'language-intelligence-storage',
    }
  )
);
