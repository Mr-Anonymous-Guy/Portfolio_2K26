import Emitter from '@/utils/Emitter';

/**
 * AssetPreloader — Real-time asset preloading service.
 *
 * Orchestrates preloading of fonts, images, and videos with real progress
 * tracking. Videos are fetched as blobs and cached via URL.createObjectURL()
 * so they play instantly when the user scrolls to the Work section.
 *
 * Priority tiers:
 *   critical — fonts, hero images (must finish before loader can exit)
 *   high     — first N work videos (loaded during loader phase)
 *   normal   — remaining videos + gallery images (loaded after loader exit)
 */

export type AssetPriority = 'critical' | 'high' | 'normal';
export type PreloadPhase =
  | 'Initializing...'
  | 'Loading Neural Architectures...'
  | 'Connecting Local Language Models...'
  | 'Indexing Vector Memories...'
  | 'Synchronizing Intelligent Agents...'
  | 'Compiling Interactive Experiences...'
  | 'Entering Anonymous\'s Digital Universe...'
  | 'done';

interface AssetEntry {
  url: string;
  type: 'image' | 'video' | 'font';
  priority: AssetPriority;
  loaded: boolean;
  bytes: number;    // total bytes (estimated if unknown)
  received: number; // bytes received so far
}

type ProgressCallback = (percent: number, phase: PreloadPhase) => void;

/** How many videos to fetch in parallel */
const VIDEO_CONCURRENCY = 2;

/** Phase label mapping based on progress ranges */
function phaseForProgress(percent: number): PreloadPhase {
  if (percent < 10)  return 'Initializing...';
  if (percent < 25)  return 'Loading Neural Architectures...';
  if (percent < 40)  return 'Connecting Local Language Models...';
  if (percent < 55)  return 'Indexing Vector Memories...';
  if (percent < 70)  return 'Synchronizing Intelligent Agents...';
  if (percent < 90)  return 'Compiling Interactive Experiences...';
  if (percent < 100) return 'Entering Anonymous\'s Digital Universe...';
  return 'done';
}

class AssetPreloader {
  private assets: AssetEntry[] = [];
  private videoBlobUrls: Map<string, string> = new Map();
  private progressCallbacks: ProgressCallback[] = [];
  private _progress = 0;
  private _phase: PreloadPhase = 'Initializing...';
  private destroyed = false;

  // ─── Public getters ────────────────────────────────
  get progress() { return this._progress; }
  get phase() { return this._phase; }
  get loadedVideoBlobs() { return this.videoBlobUrls; }

  // ─── Registration ──────────────────────────────────

  registerImages(urls: string[], priority: AssetPriority = 'normal') {
    urls.forEach(url => {
      if (!url || this.assets.some(a => a.url === url)) return;
      this.assets.push({ url, type: 'image', priority, loaded: false, bytes: 50_000, received: 0 });
    });
  }

  registerVideos(urls: string[], priority: AssetPriority = 'normal') {
    urls.forEach(url => {
      if (!url || this.assets.some(a => a.url === url)) return;
      // Estimate ~15 MB per video until we get real Content-Length
      this.assets.push({ url, type: 'video', priority, loaded: false, bytes: 15_000_000, received: 0 });
    });
  }

  registerFonts() {
    // Fonts are loaded by the browser; we just track document.fonts.ready
    this.assets.push({ url: '__fonts__', type: 'font', priority: 'critical', loaded: false, bytes: 200_000, received: 0 });
  }

  // ─── Progress ──────────────────────────────────────

  onProgress(cb: ProgressCallback) {
    this.progressCallbacks.push(cb);
  }

  private emitProgress() {
    if (this.destroyed) return;

    const totalBytes = this.assets.reduce((sum, a) => sum + a.bytes, 0);
    const receivedBytes = this.assets.reduce((sum, a) => sum + a.received, 0);

    this._progress = totalBytes > 0 ? Math.min(100, Math.round((receivedBytes / totalBytes) * 100)) : 0;
    this._phase = phaseForProgress(this._progress);

    this.progressCallbacks.forEach(cb => cb(this._progress, this._phase));
    Emitter.emit('preload:progress', this._progress, this._phase);
  }

  // ─── Loading: Core ─────────────────────────────────

  /**
   * Start preloading critical + high priority assets.
   * Returns a promise that resolves when both tiers are done.
   */
  async start(): Promise<void> {
    if (this.destroyed) return;

    // Phase 1: fonts + critical images in parallel
    const fontPromise = this.loadFonts();
    const criticalImages = this.assets.filter(a => a.type === 'image' && a.priority === 'critical');
    const criticalImagePromises = criticalImages.map(a => this.loadImage(a));

    await Promise.all([fontPromise, ...criticalImagePromises]);

    if (this.destroyed) return;

    // Phase 2: high-priority videos (first batch)
    const highVideos = this.assets.filter(a => a.type === 'video' && a.priority === 'high');
    await this.loadVideoQueue(highVideos);

    // Mark progress as 100 for critical+high tier
    this.emitProgress();
  }

  /**
   * Continue loading normal-priority assets in the background.
   * Call this after the loader exits.
   */
  continueBackground() {
    if (this.destroyed) return;

    // Load remaining images
    const normalImages = this.assets.filter(a => a.type === 'image' && a.priority === 'normal' && !a.loaded);
    normalImages.forEach(a => this.loadImage(a));

    // Load remaining videos in queue
    const normalVideos = this.assets.filter(a => a.type === 'video' && a.priority === 'normal' && !a.loaded);
    this.loadVideoQueue(normalVideos);
  }

  // ─── Loading: Fonts ────────────────────────────────

  private async loadFonts(): Promise<void> {
    const entry = this.assets.find(a => a.url === '__fonts__');
    if (!entry) return;

    try {
      if (typeof document !== 'undefined' && document.fonts) {
        await document.fonts.ready;
      }
    } catch {
      // Font loading failed — not critical enough to block
    }

    entry.loaded = true;
    entry.received = entry.bytes;
    this.emitProgress();
  }

  // ─── Loading: Images ───────────────────────────────

  private loadImage(entry: AssetEntry): Promise<void> {
    return new Promise<void>(resolve => {
      if (typeof window === 'undefined') { resolve(); return; }

      const img = new Image();
      img.onload = () => {
        entry.loaded = true;
        entry.received = entry.bytes;
        this.emitProgress();
        resolve();
      };
      img.onerror = () => {
        // Still mark as "loaded" so it doesn't block progress
        entry.loaded = true;
        entry.received = entry.bytes;
        this.emitProgress();
        resolve();
      };
      img.src = entry.url;
    });
  }

  // ─── Loading: Videos (queue-based) ─────────────────

  private async loadVideoQueue(entries: AssetEntry[]): Promise<void> {
    // Process in batches of VIDEO_CONCURRENCY
    const queue = [...entries];

    const workers: Promise<void>[] = [];
    for (let i = 0; i < Math.min(VIDEO_CONCURRENCY, queue.length); i++) {
      workers.push(this.videoWorker(queue));
    }

    await Promise.all(workers);
  }

  private async videoWorker(queue: AssetEntry[]): Promise<void> {
    while (queue.length > 0 && !this.destroyed) {
      const entry = queue.shift();
      if (!entry) break;
      await this.loadVideo(entry);
    }
  }

  private loadVideo(entry: AssetEntry): Promise<void> {
    return new Promise<void>(resolve => {
      if (typeof window === 'undefined') { resolve(); return; }

      const xhr = new XMLHttpRequest();
      xhr.open('GET', entry.url, true);
      xhr.responseType = 'blob';

      xhr.onprogress = (e) => {
        if (e.lengthComputable) {
          entry.bytes = e.total;
          entry.received = e.loaded;
        } else {
          // Estimate progress based on time if content-length is missing
          entry.received = Math.min(entry.received + 500_000, entry.bytes * 0.95);
        }
        this.emitProgress();
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const blob = xhr.response as Blob;
          const blobUrl = URL.createObjectURL(blob);
          this.videoBlobUrls.set(entry.url, blobUrl);
          entry.bytes = blob.size || entry.bytes;
          entry.received = entry.bytes;
        } else {
          // Failed — still mark done to not block
          entry.received = entry.bytes;
        }
        entry.loaded = true;
        this.emitProgress();
        resolve();
      };

      xhr.onerror = () => {
        entry.loaded = true;
        entry.received = entry.bytes;
        this.emitProgress();
        resolve();
      };

      xhr.send();
    });
  }

  // ─── Utilities ─────────────────────────────────────

  /** Get cached blob URL for a video, or return original src */
  getVideoUrl(originalSrc: string): string {
    return this.videoBlobUrls.get(originalSrc) || originalSrc;
  }

  /** Check if all critical+high priority assets are loaded */
  isCriticalReady(): boolean {
    return this.assets
      .filter(a => a.priority === 'critical' || a.priority === 'high')
      .every(a => a.loaded);
  }

  /** Revoke all blob URLs and clean up */
  destroy() {
    this.destroyed = true;
    this.videoBlobUrls.forEach(url => URL.revokeObjectURL(url));
    this.videoBlobUrls.clear();
    this.assets = [];
    this.progressCallbacks = [];
  }
}

/** Singleton instance */
export const assetPreloader = new AssetPreloader();
