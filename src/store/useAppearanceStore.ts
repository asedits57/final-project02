import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface CustomAppearancePalette {
  background: string;
  surface: string;
  primary: string;
  accent: string;
}

interface AppearanceState {
  customPalette: CustomAppearancePalette;
  setCustomPalette: (updates: Partial<CustomAppearancePalette>) => void;
  resetCustomPalette: () => void;
}

export const defaultCustomPalette: CustomAppearancePalette = {
  background: "#f4efe4",
  surface: "#fffdf8",
  primary: "#0ea5e9",
  accent: "#f59e0b",
};

export const useAppearanceStore = create<AppearanceState>()(
  persist(
    (set) => ({
      customPalette: defaultCustomPalette,
      setCustomPalette: (updates) => set((state) => ({
        customPalette: {
          ...state.customPalette,
          ...updates,
        },
      })),
      resetCustomPalette: () => set({ customPalette: defaultCustomPalette }),
    }),
    {
      name: "atlas-appearance",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
