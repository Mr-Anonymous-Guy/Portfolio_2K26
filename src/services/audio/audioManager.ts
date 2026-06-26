import { Howl, Howler } from 'howler';

/**
 * Sound configuration — maps name keys to audio file paths and playback settings.
 * Transferred from Clone-Animation's audioManager.ts.
 */
const soundsConfig = [
  { name: 'hover',      src: '/sound/effects/typing2.mp3',     volume: 0.3 },
  { name: 'transition', src: '/sound/effects/transition.mp3',  volume: 0.5 },
  { name: 'whoosh',     src: '/sound/effects/whoosh.mp3',      volume: 0.15 },
  { name: 'whoosh2',    src: '/sound/effects/whoosh2.mp3',     volume: 0.15 },
  { name: 'whoosh3',    src: '/sound/effects/whoosh3.mp3',     volume: 0.15 },
  { name: 'scroll',     src: '/sound/effects/scroll.mp3',      volume: 0.7 },
  { name: 'scream',     src: '/sound/effects/scream.mp3',      volume: 0.4 },
  { name: 'scene1',     src: '/sound/scene1.mp3', volume: 0.4, loop: true },
  { name: 'scene2',     src: '/sound/scene2.mp3', volume: 0.4, loop: true },
];

class AudioManager {
  private howls: Record<string, Howl> = {};
  private muted = true;

  constructor() {
    // Start globally muted — user must opt-in via loader
    Howler.mute(true);

    soundsConfig.forEach((cfg) => {
      this.howls[cfg.name] = new Howl({
        src: [cfg.src],
        html5: cfg.name === 'scene1' || cfg.name === 'scene2',
        volume: cfg.volume,
        loop: (cfg as any).loop || false,
        preload: true,
      });
    });
  }

  /** Play a sound by name. Scene tracks won't restart if already playing. */
  play(name: string) {
    const howl = this.howls[name];
    if (!howl) return;
    if ((name === 'scene1' || name === 'scene2') && howl.playing()) return;
    howl.play();
  }

  /** Stop a sound by name. */
  stop(name: string) {
    this.howls[name]?.stop();
  }

  /** Fade a sound's volume. */
  fade(name: string, from: number, to: number, ms: number) {
    this.howls[name]?.fade(from, to, ms);
  }

  /** Set global mute state. */
  mute(isMuted: boolean) {
    this.muted = isMuted;
    Howler.mute(isMuted);
  }

  /** Check current mute state. */
  isMuted() {
    return this.muted;
  }
}

/** Singleton — import and use everywhere. */
export const audioManager = new AudioManager();
