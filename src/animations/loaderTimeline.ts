import gsap from "gsap";
import { Decoder } from "./heroTimeline";

// Infinite loop scrolling timeline for loading phrases
export function startPhrasesScroll(
  listEl: HTMLElement,
  items: HTMLElement[],
  onUpdateActive: (activeIndex: number) => void
) {
  const tl = gsap.timeline({ repeat: -1 });
  
  tl.to(listEl, {
    y: "-50%",
    duration: 3,
    ease: "none",
    onUpdate: () => {
      const parent = listEl.parentElement;
      if (!parent) return;

      const parentHeight = parent.offsetHeight;
      const parentRect = parent.getBoundingClientRect();
      let activeIdx = -1;

      items.forEach((item, index) => {
        const itemRect = item.getBoundingClientRect();
        const itemHeight = itemRect.height;
        
        // Match the center-alignment formula from original source:
        // vt = itemRect.top - parentRect.top - itemHeight - parentHeight / 2;
        // vt <= 0 && vt > -itemHeight * 2 => active
        const vt = itemRect.top - parentRect.top - itemHeight - parentHeight / 2;
        
        if (vt <= 0 && vt > -itemHeight * 2) {
          activeIdx = index;
        }
      });

      if (activeIdx !== -1) {
        onUpdateActive(activeIdx);
      }
    }
  });

  // Loop reset
  tl.to(listEl, {
    y: "0%",
    duration: 0
  });

  return tl;
}

/**
 * Smoothly interpolate a displayed progress value toward a real target.
 * Returns a controller object with `update(target)` and `kill()` methods.
 *
 * Unlike the old startProgressCounter which faked 0→100 on a timer,
 * this follows real preloader progress with smooth GSAP tweening.
 */
export function createProgressInterpolator(
  onUpdate: (displayValue: number) => void
) {
  const state = { display: 0 };
  let currentTween: gsap.core.Tween | null = null;

  return {
    /** Push a new target value (0–100). The display will smoothly catch up. */
    update(target: number) {
      const clamped = Math.min(100, Math.max(0, target));

      // Don't re-tween if already at target
      if (Math.abs(state.display - clamped) < 0.5 && clamped < 100) return;

      if (currentTween) currentTween.kill();

      currentTween = gsap.to(state, {
        display: clamped,
        duration: clamped === 100 ? 0.6 : 0.4,
        ease: "power2.out",
        onUpdate: () => {
          onUpdate(Math.floor(state.display));
        },
      });
    },

    /** Get the current displayed value */
    get value() { return Math.floor(state.display); },

    /** Clean up */
    kill() {
      if (currentTween) currentTween.kill();
    },
  };
}

// Transition from progress loader to Sound Options
export function transitionToSoundOptions(
  items: HTMLElement[],
  loaderText: HTMLElement,
  progressEl: HTMLElement,
  soundIcon: HTMLElement | SVGElement,
  soundText: HTMLElement,
  buttonsWrapper: HTMLElement,
  soundTextDecoder: Decoder | null
) {
  const tl = gsap.timeline();

  // 1. Fade & scale out loader phrases
  tl.to(items, { duration: 0.3, scale: 1.1, opacity: 0 }, 0);
  
  // 2. Fade & scale out loader text and progress number
  tl.to(loaderText, { duration: 0.3, scale: 1.1, opacity: 0 }, 0.15);
  tl.to(progressEl, { duration: 0.3, scale: 1.1, opacity: 0 }, 0.15);
  
  // 3. Fade in sound warning icon
  tl.to(soundIcon, { duration: 0.3, opacity: 1, visibility: "visible" }, 0.4);
  
  // 4. Set sound warning text to visible and start character decode
  tl.set(soundText, { visibility: "visible" }, 0.4);
  
  tl.add(() => {
    if (soundTextDecoder) {
      soundTextDecoder.animate({ withSound: false, delay: 0 });
    }
  }, 0.4);

  // 5. Fade/scale in the entry buttons wrapper
  tl.to(buttonsWrapper, {
    duration: 0.6,
    opacity: 1,
    visibility: "visible",
    scale: 1,
    ease: "power3.out"
  }, 1.4);

  return tl;
}

// Exit animation of the Loader container
export function exitLoader(
  loaderContainer: HTMLElement,
  onComplete: () => void
) {
  return gsap.to(loaderContainer, {
    duration: 0.3,
    opacity: 0,
    ease: "power2.inOut",
    onComplete: onComplete
  });
}
