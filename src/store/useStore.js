import { create } from "zustand";

export const useStore = create((set) => ({
    score: 0,
    increase: () => set((state) => ({ score: state.score + 1 }))
}));