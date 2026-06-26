import { useEffect, useRef } from "react";
import gsap from "gsap";
import { audioManager } from "@/services/audio/audioManager";

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) {
      return;
    }

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    let dotX = -100, dotY = -100;
    let ringX = -100, ringY = -100;
    const LERP = 0.14;
    let isVisible = false;

    // Initially hide cursor elements
    gsap.set([dot, ring], { opacity: 0 });

    const onMouseMove = (e: MouseEvent) => {
      dotX = e.clientX;
      dotY = e.clientY;
      gsap.set(dot, { x: dotX, y: dotY });

      if (!isVisible) {
        isVisible = true;
        gsap.to([dot, ring], { opacity: 1, duration: 0.3, ease: "power2.out" });
      }
    };

    const onTick = () => {
      ringX += (dotX - ringX) * LERP;
      ringY += (dotY - ringY) * LERP;
      gsap.set(ring, { x: ringX, y: ringY });
    };

    const onMouseLeave = () => {
      gsap.to([dot, ring], { opacity: 0, duration: 0.4, ease: "power2.out" });
      isVisible = false;
    };

    const onMouseEnter = () => {
      if (!isVisible) {
        gsap.to([dot, ring], { opacity: 1, duration: 0.3, ease: "power2.out" });
        isVisible = true;
      }
    };

    const onMouseDown = () => {
      gsap.to(dot, { scale: 0.6, duration: 0.15, ease: "power3.out" });
      gsap.to(ring, { scale: 0.8, duration: 0.2, ease: "power3.out" });
      audioManager.play("transition");
    };

    const onMouseUp = () => {
      gsap.to(dot, { scale: 1, duration: 0.3, ease: "elastic.out(1, 0.4)" });
      gsap.to(ring, { scale: 1, duration: 0.4, ease: "elastic.out(1, 0.4)" });
    };

    const interactiveSelectors = "a, button, [data-cursor-hover], input, textarea, label, [role='button'], .js-menu-link, .js-hover";

    const onMouseOverInteractive = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest(interactiveSelectors) as HTMLElement;
      if (!target) return;

      if (target.classList.contains("carousel") || target.dataset.cursorHover === "drag") {
        if (!ring.classList.contains("cursor__ring--drag")) {
          ring.classList.add("cursor__ring--drag");
          audioManager.play("hover");
        }
      } else {
        if (!ring.classList.contains("cursor__ring--link")) {
          ring.classList.add("cursor__ring--link");
          audioManager.play("hover");
        }
      }
    };

    const onMouseOutInteractive = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest(interactiveSelectors) as HTMLElement;
      if (!target) return;
      ring.classList.remove("cursor__ring--link", "cursor__ring--drag");
    };

    window.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseleave", onMouseLeave);
    document.addEventListener("mouseenter", onMouseEnter);
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("mouseup", onMouseUp);
    document.addEventListener("mouseover", onMouseOverInteractive);
    document.addEventListener("mouseout", onMouseOutInteractive);
    gsap.ticker.add(onTick);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseleave", onMouseLeave);
      document.removeEventListener("mouseenter", onMouseEnter);
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("mouseover", onMouseOverInteractive);
      document.removeEventListener("mouseout", onMouseOutInteractive);
      gsap.ticker.remove(onTick);
    };
  }, []);

  return (
    <>
      <div ref={dotRef} className="cursor__dot" />
      <div ref={ringRef} className="cursor__ring" />
    </>
  );
}
