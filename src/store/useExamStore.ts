import { create } from "zustand";
import { apiService as api } from "@services/apiService";
import type { QuestionData } from "@services/questionService";

const emptyQuestionData = (): QuestionData => ({
    grammar: [],
    reading: [],
    listening: [],
    writing: [],
    speaking: [],
    practice: [],
    mock: [],
});

interface ExamState {
    questions: QuestionData;
    loading: boolean;
    current: number;
    selected: Record<number, string>;
    timeLeft: number;
    finished: boolean;
    error: string | null;

    // Actions
    setQuestions: (questions: QuestionData) => void;
    setLoading: (loading: boolean) => void;
    setCurrent: (index: number) => void;
    handleSelect: (index: number, option: string) => void;
    tickTimer: () => void;
    tick: () => void;
    finishTest: () => void;
    nextQuestion: (total: number) => void;
    resetTest: (totalTime: number) => void;
    loadQuestions: () => Promise<void>;
}

export const useExamStore = create<ExamState>((set, get) => ({
    questions: emptyQuestionData(),
    loading: true,
    current: 0,
    selected: {},
    timeLeft: 1800, // Default 30 mins
    finished: false,
    error: null,

    setQuestions: (questions) => set({ questions }),
    setLoading: (loading) => set({ loading }),
    setCurrent: (index) => set({ current: index }),
    handleSelect: (index, option) => {
        if (get().finished) return;
        set((state) => ({
            selected: { ...state.selected, [index]: option }
        }));
    },
    tickTimer: () => {
        set((state) => {
            if (state.timeLeft <= 1) {
                return { timeLeft: 0, finished: true };
            }
            return { timeLeft: state.timeLeft - 1 };
        });
    },
    finishTest: () => set({ finished: true }),
    resetTest: (totalTime) => set({
        current: 0,
        selected: {},
        timeLeft: totalTime,
        finished: false,
        error: null
    }),
    loadQuestions: async () => {
        set({ loading: true, error: null });
        try {
            const data = await api.fetchQuestions();
            // Data is expected to be an object with categories (mock, practice, etc.)
            // We'll store the whole object and let components slice/filter as needed
            set({ questions: data, loading: false });
        } catch (err) {
            console.error("Failed to load questions:", err);
            set({ error: "Failed to load questions", loading: false });
        }
    },
    tick: () => {
        const state = get();
        if (state.finished || state.timeLeft <= 0) return;
        set({ timeLeft: state.timeLeft - 1 });
        if (state.timeLeft <= 1) set({ finished: true });
    },
    nextQuestion: (total: number) => {
        const state = get();
        if (state.current < total - 1) {
            set({ current: state.current + 1 });
        } else {
            set({ finished: true });
        }
    }
}));
