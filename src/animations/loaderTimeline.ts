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

// Progress timer to animate percent from 0 to 100
export function startProgressCounter(
  onUpdate: (value: number) => void,
  onComplete: () => void
) {
  const progressObj = { value: 0 };
  
  return gsap.to(progressObj, {
    value: 100,
    duration: 3.2,
    ease: "power2.out",
    onUpdate: () => {
      onUpdate(Math.floor(progressObj.value));
    },
    onComplete: () => {
      onComplete();
    }
  });
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
