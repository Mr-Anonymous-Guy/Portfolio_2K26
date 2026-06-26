import gsap from "gsap";
import SplitType from "split-type";

// List of random characters for decoding effect
const CHAR_LIST = [
  "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m",
  "n", "o", "p", "q", "r", "s", "t", "u", "v", "x", "y", "z",
  "!", "$", "^", "&", "*", "-", "_", "+", "=", ";", ":", "<", ">", ","
];

export class Decoder {
  textElement: HTMLElement;
  splitter: SplitType | null = null;
  originalChars: string[] = [];

  constructor(element: HTMLElement) {
    this.textElement = element;
    this.textElement.classList.add("text-decode");
    this.splitText();
  }

  splitText() {
    this.splitter = new SplitType(this.textElement, { types: ["lines", "words", "chars"] });
    if (this.splitter.chars) {
      this.originalChars = this.splitter.chars.map((char) => char.innerHTML);
    }
  }

  animate(options: { withSound?: boolean; delay?: number; duration?: number; durationMultiplier?: number } = {}) {
    const delay = options.delay ?? 0;
    const durationMultiplier = options.durationMultiplier ?? 1;
    let charDuration = (options.duration ?? 0.03) * durationMultiplier;
    let staggerTime = 0.01 * durationMultiplier;

    this.reset();

    if (!this.splitter || !this.splitter.chars) return;

    const chars = this.splitter.chars;
    const tl = gsap.timeline({ delay: delay });

    chars.forEach((char: HTMLElement, index: number) => {
      const originalHTML = char.innerHTML;
      let repeats = 0;

      // Tween each character
      tl.fromTo(char,
        { opacity: 0, "--progress": 0 },
        {
          duration: charDuration,
          opacity: 1,
          onStart: () => {
            char.style.setProperty("--progress", "1");
          },
          onComplete: () => {
            char.innerHTML = originalHTML;
            char.style.setProperty("--progress", "0");
          },
          onRepeat: () => {
            repeats++;
            if (repeats === 1) {
              char.style.setProperty("--progress", "0");
            }
          },
          repeat: 3,
          repeatRefresh: true,
          innerHTML: () => CHAR_LIST[Math.floor(Math.random() * CHAR_LIST.length)],
        },
        (index + 1) * staggerTime
      );
    });
  }

  reset() {
    if (!this.splitter || !this.splitter.chars) return;
    this.splitter.chars.forEach((char: HTMLElement, index: number) => {
      gsap.killTweensOf(char);
      char.innerHTML = this.originalChars[index] || "";
      char.style.setProperty("--progress", "0");
      char.style.opacity = "0";
    });
  }

  destroy() {
    if (this.splitter) {
      this.splitter.revert();
    }
  }
}

// Pre-splits text into rows and wraps each row in a line mask wrapper (.line-inner)
export function setTextLines(element: HTMLElement, direction: "up" | "down" = "up") {
  if (!element) return null;

  const splitter = new SplitType(element, {
    types: ["lines", "words"],
    tagName: "span",
    lineClass: "e-line-2"
  });

  if (splitter.lines) {
    splitter.lines.forEach((line, index) => {
      line.innerHTML = `<span class="line-inner">${line.innerHTML}</span>`;
      line.setAttribute("data-line", line.innerText);
      line.setAttribute("data-line-idx", index.toString());
    });
  }

  element.classList.add("splitted", "splitted-lines");

  const lineInners = element.querySelectorAll(".line-inner");
  gsap.set(lineInners, {
    y: direction === "up" ? "110%" : "-110%",
    display: "inline-block",
    willChange: "transform"
  });

  return splitter;
}

// Reveal animation for line-by-line text emergence
export function byTextLines(
  element: HTMLElement,
  options: { delay?: number; stagger?: number; duration?: number; reversed?: boolean; onComplete?: () => void } = {}
) {
  const delay = options.delay ?? 0;
  const stagger = options.stagger ?? 0.1;
  const duration = options.duration ?? 0.7;
  const reversed = options.reversed ?? false;

  const lineInners = element.querySelectorAll(".line-inner");

  const tl = gsap.timeline();

  if (reversed) {
    tl.to(lineInners, {
      y: "-105%",
      duration: duration,
      stagger: stagger,
      overwrite: true,
      ease: "power4.out",
      onComplete: () => {
        gsap.killTweensOf(lineInners);
        gsap.set(lineInners, { y: "105%" });
        if (options.onComplete) options.onComplete();
      }
    }, delay);
  } else {
    tl.to(lineInners, {
      y: 0,
      duration: duration,
      stagger: stagger,
      overwrite: true,
      ease: "power4.out",
      onComplete: () => {
        gsap.killTweensOf(lineInners);
        if (options.onComplete) options.onComplete();
      }
    }, delay);
    
    // Make wrapper visible instantly
    tl.to(element, { duration: 0.01, opacity: 1, overwrite: true }, 0);
  }

  return tl;
}

// Fade animations
export function setOpacityHidden(element: HTMLElement) {
  gsap.set(element, { opacity: 0, visibility: "hidden", willChange: "opacity" });
}

export function animateOpacity(
  element: HTMLElement,
  options: { delay?: number; duration?: number; reversed?: boolean } = {}
) {
  const delay = options.delay ?? 0;
  const duration = options.duration ?? 1.0;
  const reversed = options.reversed ?? false;

  const tl = gsap.timeline();
  
  if (reversed) {
    tl.to(element, {
      duration: duration,
      opacity: 0,
      overwrite: true,
      visibility: "hidden",
      ease: "power3.out"
    }, delay);
  } else {
    tl.to(element, {
      duration: duration,
      opacity: 1,
      overwrite: true,
      visibility: "visible",
      ease: "power3.out"
    }, delay);
  }

  return tl;
}

// Scale animations
export function setScaleHidden(element: HTMLElement) {
  gsap.set(element, { scale: 0.8, opacity: 0, willChange: "transform", visibility: "hidden" });
}

export function animateScale(
  element: HTMLElement,
  options: { delay?: number; duration?: number; reversed?: boolean } = {}
) {
  const delay = options.delay ?? 0;
  const duration = options.duration ?? 1.0;
  const reversed = options.reversed ?? false;

  const tl = gsap.timeline();

  if (reversed) {
    tl.to(element, {
      duration: duration,
      opacity: 0,
      scale: 0.8,
      overwrite: true,
      visibility: "hidden",
      ease: "power3.out"
    }, delay);
  } else {
    tl.to(element, {
      duration: duration,
      opacity: 1,
      scale: 1,
      overwrite: true,
      visibility: "visible",
      ease: "power3.out"
    }, delay);
  }

  return tl;
}
