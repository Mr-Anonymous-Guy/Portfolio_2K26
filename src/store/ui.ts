import { create } from "zustand";

type CursorVariant = "default" | "hover" | "view" | "drag";

interface UIState {
  loaded: boolean;
  setLoaded: (v: boolean) => void;
  contrastMode: boolean;
  isContrast: boolean;
  theme: "normal" | "contrast";
  setTheme: (theme: "normal" | "contrast") => void;
  toggleTheme: () => void;
}

export const useUI = create<UIState>((set) => ({
  loaded: false,
  setLoaded: (loaded) => set({ loaded }),
  contrastMode: true,
  isContrast: true,
  theme: "contrast",
  setTheme: (theme) => set({
    theme,
    isContrast: theme === "contrast",
    contrastMode: theme === "contrast"
  }),
  toggleTheme: () => set((state) => {
    const nextTheme = state.theme === "normal" ? "contrast" : "normal";
    return {
      theme: nextTheme,
      isContrast: nextTheme === "contrast",
      contrastMode: nextTheme === "contrast"
    };
  }),
}));

interface SiteState {
  isIntroComplete: boolean;
  setIntroComplete: () => void;
}

export const useSiteStore = create<SiteState>((set) => ({
  isIntroComplete: false,
  setIntroComplete: () => set({ isIntroComplete: true }),
}));
