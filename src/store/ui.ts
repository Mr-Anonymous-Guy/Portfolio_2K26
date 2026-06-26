import { create } from "zustand";

type CursorVariant = "default" | "hover" | "view" | "drag";

interface UIState {
  cursor: CursorVariant;
  cursorLabel: string;
  setCursor: (variant: CursorVariant, label?: string) => void;
  resetCursor: () => void;
  loaded: boolean;
  setLoaded: (v: boolean) => void;
  contrastMode: boolean;
  isContrast: boolean;
  theme: "normal" | "contrast";
  setTheme: (theme: "normal" | "contrast") => void;
  toggleTheme: () => void;
}

export const useUI = create<UIState>((set) => ({
  cursor: "default",
  cursorLabel: "",
  setCursor: (cursor, cursorLabel = "") => set({ cursor, cursorLabel }),
  resetCursor: () => set({ cursor: "default", cursorLabel: "" }),
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
