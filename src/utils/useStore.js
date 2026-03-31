import { create } from "zustand";

export const useStore = create((set) => ({
    score: 0,
    level: 1,

    addScore: () =>
        set((state) => {
            const newScore = state.score + 10;
            return {
                score: newScore,
                level: Math.floor(newScore / 100)
            };
        })
}));
