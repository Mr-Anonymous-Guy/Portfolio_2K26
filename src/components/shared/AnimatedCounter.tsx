import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface AnimatedCounterProps {
  value: string; // e.g. "37+" or "98%"
  className?: string;
}

export function AnimatedCounter({ value, className = "" }: AnimatedCounterProps) {
  const elementRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;

    // Parse number and suffix (e.g. "37+" -> 37, "+")
    const match = value.match(/^(\d+)(.*)$/);
    if (!match) {
      el.textContent = value;
      return;
    }

    const targetVal = parseInt(match[1], 10);
    const suffix = match[2] || "";

    // Set screen reader accessibility label
    el.setAttribute("aria-label", `${targetVal}${suffix}`);

    const countObj = { val: 0 };

    const anim = gsap.to(countObj, {
      val: targetVal,
      duration: 2.0,
      ease: "power4.out",
      scrollTrigger: {
        trigger: el,
        start: "top 80%",
        once: true,
      },
      onUpdate: () => {
        el.textContent = Math.round(countObj.val) + suffix;
      },
      onComplete: () => {
        el.textContent = targetVal + suffix;
      }
    });

    return () => {
      if (anim.scrollTrigger) {
        anim.scrollTrigger.kill();
      }
      anim.kill();
    };
  }, [value]);

  return (
    <span ref={elementRef} className={className}>
      0
    </span>
  );
}
