import { create } from 'zustand';
import { assetPreloader, type PreloadPhase } from '@/services/assetPreloader';

interface PreloadState {
  /** Real loading progress 0–100 */
  progress: number;
  /** Current loading phase label */
  phase: PreloadPhase;
  /** True when all critical + high-priority assets are loaded */
  isReady: boolean;
  /** Map of original video src → cached blob URL */
  videoBlobUrls: Map<string, string>;

  // ─── Actions ─────────────────────────────────────
  /** Update progress from the preloader service */
  setProgress: (percent: number, phase: PreloadPhase) => void;
  /** Mark critical assets as ready */
  setReady: (ready: boolean) => void;
  /** Sync blob URLs from the preloader service */
  syncBlobUrls: () => void;
  /** Get the best available URL for a video (blob if cached, original otherwise) */
  getVideoUrl: (originalSrc: string) => string;
}

export const usePreloadStore = create<PreloadState>((set, get) => ({
  progress: 0,
  phase: 'Initializing...',
  isReady: false,
  videoBlobUrls: new Map(),

  setProgress: (percent, phase) => set({ progress: percent, phase }),

  setReady: (ready) => set({ isReady: ready }),

  syncBlobUrls: () => {
    set({ videoBlobUrls: new Map(assetPreloader.loadedVideoBlobs) });
  },

  getVideoUrl: (originalSrc: string) => {
    const cached = get().videoBlobUrls.get(originalSrc);
    return cached || originalSrc;
  },
}));

/**
 * Initialize the preload store listener.
 * Call once at app startup to wire the AssetPreloader → Zustand bridge.
 */
export function initPreloadBridge() {
  assetPreloader.onProgress((percent, phase) => {
    usePreloadStore.getState().setProgress(percent, phase);

    // Periodically sync blob URLs so React components can pick them up
    if (percent % 10 === 0 || percent >= 95) {
      usePreloadStore.getState().syncBlobUrls();
    }
  });
}
