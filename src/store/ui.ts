import { create } from "zustand";
import { DEFAULT_PALETTE_ID, getPaletteById } from "@/data/palettes";

interface UIState {
  loaded: boolean;
  setLoaded: (v: boolean) => void;
  contrastMode: boolean;
  isContrast: boolean;
  theme: "normal" | "contrast";
  activePalette: string;
  setTheme: (theme: "normal" | "contrast") => void;
  toggleTheme: () => void;
  setPalette: (paletteId: string) => void;
}

const SAVED_PALETTE_KEY = "portfolio_active_palette";

function getInitialPalette(): string {
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem(SAVED_PALETTE_KEY);
      if (saved && getPaletteById(saved)) {
        return saved;
      }
    } catch {
      // Ignore localStorage read error
    }
  }
  return DEFAULT_PALETTE_ID;
}

export const useUI = create<UIState>((set) => ({
  loaded: false,
  setLoaded: (loaded) => set({ loaded }),
  contrastMode: true,
  isContrast: true,
  theme: "contrast",
  activePalette: getInitialPalette(),
  setTheme: (theme) =>
    set({
      theme,
      isContrast: theme === "contrast",
      contrastMode: theme === "contrast",
    }),
  toggleTheme: () =>
    set((state) => {
      const nextTheme = state.theme === "normal" ? "contrast" : "normal";
      return {
        theme: nextTheme,
        isContrast: nextTheme === "contrast",
        contrastMode: nextTheme === "contrast",
      };
    }),
  setPalette: (paletteId: string) => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(SAVED_PALETTE_KEY, paletteId);
      } catch {
        // Ignore localStorage write error
      }
    }
    set({ activePalette: paletteId });
  },
}));

interface SiteState {
  isIntroComplete: boolean;
  setIntroComplete: () => void;
}

export const useSiteStore = create<SiteState>((set) => ({
  isIntroComplete: false,
  setIntroComplete: () => set({ isIntroComplete: true }),
}));
