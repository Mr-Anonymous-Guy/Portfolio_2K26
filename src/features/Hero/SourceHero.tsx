import { useRef, type CSSProperties } from "react";
import { useGSAPContext } from "@/hooks/useGSAP";
import { useUI } from "@/store/ui";
const heroPortrait = "/images/Image.webp";

export const Asterisk = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <g stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <line x1="12" y1="3" x2="12" y2="21" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="5.5" y1="5.5" x2="18.5" y2="18.5" />
      <line x1="18.5" y1="5.5" x2="5.5" y2="18.5" />
    </g>
  </svg>
);

export const Arrow = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M7 17L17 7" />
    <path d="M9 7h8v8" />
  </svg>
);

export function SourceHero() {
  const heroRef = useRef<HTMLDivElement>(null);
  const portraitWrapRef = useRef<HTMLDivElement>(null);
  const portraitRef = useRef<HTMLImageElement>(null);
  const loaded = useUI((s) => s.loaded);

  useGSAPContext(({ gsap, ScrollTrigger }) => {
    if (!loaded) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* ───── Entrance timeline ───── */
    const tl = gsap.timeline();

    // Initial state setup (prevent FOUC)
    gsap.set("#hero-title-main", { opacity: 1 });
    gsap.set(".hero-title-outline", { opacity: 0 });
    gsap.set(".hero-title-fill", { clipPath: "inset(0 100% 0 0)", opacity: 1 });
    gsap.set(".hero-desc-item", { y: 16, opacity: 0 });
    gsap.set(".hero-social-item", { y: 10, opacity: 0 });
    gsap.set(".hero-portrait", { scale: 1.03, opacity: 0 });
    gsap.set(".hero-copyright", { opacity: 0 });
    gsap.set(".hero__bg-text", { opacity: 0 });

    // 0.0s — Background watermark fades in subtly
    tl.to(".hero__bg-text", {
      opacity: 0.03,
      duration: 1.4,
      ease: "power3.out",
    }, 0);

    // 0.2s — Outline text fades in
    tl.to(".hero-title-outline", {
      opacity: 1,
      duration: 0.6,
      ease: "power3.out",
      stagger: 0.08,
    }, 0.2);

    // 0.5s — Fill wipes left-to-right
    tl.to(".hero-title-fill", {
      clipPath: "inset(0 0% 0 0)",
      duration: 0.5,
      ease: "power2.out",
      stagger: 0.15,
    }, 0.5);

    // 0.7s — Description items slide up
    tl.to(".hero-desc-item", {
      y: 0,
      opacity: 1,
      duration: 0.5,
      ease: "power3.out",
      stagger: 0.08,
    }, 0.7);

    // 0.78s — Social/CTA items slide up
    tl.to(".hero-social-item", {
      y: 0,
      opacity: 1,
      duration: 0.5,
      ease: "power3.out",
      stagger: 0.06,
    }, 0.78);

    // 0.9s — Portrait scales in
    tl.to(".hero-portrait", {
      scale: 1,
      opacity: 1,
      duration: 0.7,
      ease: "power2.out",
    }, 0.9);

    // 1.1s — Copyright fades in
    tl.to(".hero-copyright", {
      opacity: 0.7,
      duration: 0.5,
    }, 1.1);

    if (prefersReducedMotion) {
      tl.progress(1);
    }

    /* ─────────────────────────────────────────────
       HERO EXIT — scrubbed "page collision" timeline
       ───────────────────────────────────────────── */
    const heroSection = heroRef.current;
    if (heroSection && !prefersReducedMotion) {
      const exitTl = gsap.timeline({
        scrollTrigger: {
          trigger: heroSection,
          start: "bottom bottom",   // begins when hero bottom hits viewport bottom
          end: "+=60%",             // 60% of viewport = compression travel
          scrub: 0.6,               // smooth scrub
          pin: false,               // no pin — hero compresses naturally
        },
      });

      // Hero container compresses upward
      exitTl.to(heroSection, {
        y: "-18vh",
        ease: "none",
      }, 0);

      // Headline lifts
      exitTl.to("#hero-title-main", {
        y: -120,
        ease: "none",
      }, 0);

      // Portrait scales down and lifts
      exitTl.to(".hero-portrait", {
        scale: 0.93,
        y: -80,
        ease: "none",
      }, 0);

      // Background text accelerates upward
      exitTl.to(".hero__bg-text", {
        y: -100,
        opacity: 0,
        ease: "none",
      }, 0);

      // Description fades out
      exitTl.to(".hero-desc-item", {
        opacity: 0,
        y: -30,
        ease: "none",
      }, 0);

      // Social buttons fade out
      exitTl.to(".hero-social-item", {
        opacity: 0,
        y: -20,
        ease: "none",
      }, 0);

      // Copyright fades out
      exitTl.to(".hero-copyright", {
        opacity: 0,
        ease: "none",
      }, 0);

      // Scroll-driven portrait color reveal
      const portrait = portraitRef.current;
      if (portrait) {
        gsap.fromTo(portrait,
          { filter: "grayscale(100%)" },
          {
            filter: "grayscale(0%)",
            scrollTrigger: {
              trigger: heroSection,
              start: "top top",
              end: "bottom center",
              scrub: 0.6,
            }
          }
        );
      }
    }

    /* ───── Grayscale / Color hover on portrait ───── */
    const el = portraitRef.current;
    const wrap = portraitWrapRef.current;
    if (el && wrap) {
      const toColor = () => {
        if (prefersReducedMotion) {
          gsap.set(el, { filter: "grayscale(0%)" });
        } else {
          gsap.to(el, { filter: "grayscale(0%)", duration: 0.7, ease: "power2.out", overwrite: "auto" });
        }
      };

      const toGray = () => {
        if (prefersReducedMotion) {
          gsap.set(el, { filter: "grayscale(100%)" });
        } else {
          gsap.to(el, { filter: "grayscale(100%)", duration: 0.5, ease: "power2.inOut", overwrite: "auto" });
        }
      };

      wrap.addEventListener("mouseenter", toColor);
      wrap.addEventListener("mouseleave", toGray);
      wrap.addEventListener("touchstart", toColor, { passive: true });
      wrap.addEventListener("touchend", toGray);
      wrap.addEventListener("touchcancel", toGray);

      return () => {
        wrap.removeEventListener("mouseenter", toColor);
        wrap.removeEventListener("mouseleave", toGray);
        wrap.removeEventListener("touchstart", toColor);
        wrap.removeEventListener("touchend", toGray);
        wrap.removeEventListener("touchcancel", toGray);
        ScrollTrigger.getAll().forEach((trigger) => {
          if (trigger.vars.trigger === "#home" || trigger.vars.trigger === heroSection) {
            trigger.kill();
          }
        });
      };
    }

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => {
        if (trigger.vars.trigger === "#home" || trigger.vars.trigger === heroSection) {
          trigger.kill();
        }
      });
    };

  }, [loaded]);

  const marqueeItems = ["UI Design", "UX Research", "Brand Identity", "Webflow", "Framer", "Motion", "Design Systems"];
  const marqueeRow = [...marqueeItems, ...marqueeItems, ...marqueeItems];

  return (
    <section ref={heroRef} id="home" className="relative isolate overflow-hidden bg-background text-text-primary transition-colors duration-300 flex flex-col justify-between h-[100svh] overflow-hidden z-10">
      {/* Hero inner — height is exactly what's visually needed, no oversized min-h */}
      <div className="hero-inner relative mx-auto w-full max-w-[1480px] flex-1 flex flex-col px-6 md:px-10 pt-24 md:pt-28 pb-4 relative z-10">

        {/* ── Ghost watermark behind portrait ── */}
        <div className="pointer-events-none absolute inset-x-0 top-[16%] flex justify-center">
          <span className="hero__bg-text font-display text-[18vw] leading-none text-text-primary/10 select-none">
            TUTUN
          </span>
        </div>

        {/* ── Centered Headline ── */}
        <h1
          id="hero-title-main"
          className="hero-heading font-src-display leading-[0.9] tracking-tight text-center relative z-10 flex flex-wrap items-baseline justify-center gap-x-[0.18em]"
          style={{ fontSize: "clamp(3rem, 10vw, 8rem)" }}
        >
          <span className="relative inline-block overflow-hidden hero-title-word-wrapper">
            <span
              className="inline-block text-transparent hero-title-outline"
              style={{ WebkitTextStroke: "1.5px var(--text-hero-display)" } as CSSProperties}
            >
              TUTUN
            </span>
          </span>

          <span className="relative inline-block overflow-hidden hero-title-word-wrapper">
            <span
              className="inline-block text-transparent hero-title-outline"
              style={{ WebkitTextStroke: "1.5px var(--text-hero-display)" } as CSSProperties}
            >
              MAHAPATRA
            </span>
            <span
              className="hero-title-fill absolute inset-0 inline-block text-text-hero-display pointer-events-none select-none"
              style={{ clipPath: "inset(0 100% 0 0)" }}
            >
              MAHAPATRA
            </span>
          </span>
        </h1>

        {/* ── Portrait (absolute, enlarged 12%, bottom edge near strip) ── */}
        <div
          ref={portraitWrapRef}
          className="hero-portrait-wrap absolute left-1/2 top-[3%] h-[97%] w-auto max-w-none -translate-x-1/2 z-10 cursor-pointer pointer-events-auto"
        >
          <img
            id="hero-portrait"
            ref={portraitRef}
            src={heroPortrait}
            alt="Portrait of Tutun, AI Engineer"
            width={1280}
            height={1600}
            fetchPriority="high"
            className="hero-portrait h-full w-auto object-contain grayscale will-change-[filter,transform]"
          />
        </div>

        {/* ── Flanking Grid: Description (left) | Socials (right) ── */}
        <div className="relative mt-auto grid grid-cols-1 md:grid-cols-2 items-end gap-4 md:gap-6 z-20 pb-4">

          {/* Left column — Role + Description */}
          <div className="pb-2 md:pb-4">
            <div className="hero-desc-item">
              <h2 className="text-lg md:text-[22px] font-bold text-text-primary">
                AI Engineer &amp; Full Stack Developer
              </h2>
            </div>
            <p className="hero-desc-item mt-2 max-w-[280px] text-[13px] md:text-[14px] leading-relaxed text-text-secondary">
              I build AI-powered products, scalable web applications, and intelligent systems that transform ideas into real-world solutions.
            </p>
            <a
              href="mailto:mr.anonymous071105@gmail.com?subject=Project%20Inquiry"
              className="hero-desc-item mt-5 inline-flex items-center gap-1.5 rounded-full bg-text-primary px-4 py-2 text-[13px] font-medium text-background hover:opacity-85 transition-opacity"
            >
              Let's collaborate <Arrow className="h-3.5 w-3.5" />
            </a>
          </div>

          {/* Right column — Social links */}
          <div className="flex flex-col items-center md:items-end gap-2.5 pb-2 md:pb-4">
            <a
              href="https://github.com/Mr-Anonymous-Guy"
              target="_blank"
              rel="noopener noreferrer"
              className="hero-social-item flex w-[145px] items-center gap-2.5 rounded-[10px] border border-border-color bg-background px-3.5 py-2.5 text-[14px] font-medium text-text-primary hover:bg-surface transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path d="M9.5 0C4.25 0 0 4.34 0 9.7c0 4.28 2.72 7.91 6.49 9.2.48.09.65-.21.65-.47v-1.8c-2.64.58-3.2-1.14-3.2-1.14-.43-1.12-1.05-1.42-1.05-1.42-.86-.6.07-.59.07-.59.96.07 1.46.99 1.46.99.85 1.48 2.23 1.05 2.78.8.08-.63.33-1.05.61-1.3-2.11-.24-4.33-1.08-4.33-4.79 0-1.06.37-1.92.98-2.6-.1-.24-.43-1.23.09-2.56 0 0 .8-.26 2.62 1A8.93 8.93 0 0 1 9.5 4.67c.86 0 1.73.12 2.38.33 1.82-1.26 2.62-1 2.62-1 .52 1.33.19 2.32.09 2.56.61.68.98 1.54.98 2.6 0 3.72-2.22 4.55-4.34 4.79.34.3.65.89.65 1.79v2.66c0 .26.17.56.66.47A9.71 9.71 0 0 0 19 9.7C19 4.34 14.75 0 9.5 0z" />
              </svg>
              GitHub
            </a>
            <a
              href="https://www.linkedin.com/in/mr-anonymous-guy/"
              target="_blank"
              rel="noopener noreferrer"
              className="hero-social-item flex w-[145px] items-center gap-2.5 rounded-[10px] border border-border-color bg-background px-3.5 py-2.5 text-[14px] font-medium text-text-primary hover:bg-surface transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM.22 8h4.56v14H.22zM8 8h4.37v1.92h.06c.61-1.15 2.1-2.36 4.32-2.36 4.62 0 5.47 3.04 5.47 7v7.44h-4.55v-6.6c0-1.57-.03-3.6-2.19-3.6-2.2 0-2.53 1.72-2.53 3.49V22H8z" />
              </svg>
              LinkedIn
            </a>
            <a
              href="mailto:mr.anonymous071105@gmail.com?subject=Project%20Inquiry"
              className="hero-social-item flex w-[145px] items-center gap-2.5 rounded-[10px] border border-border-color bg-background px-3.5 py-2.5 text-[14px] font-medium text-text-primary hover:bg-surface transition-colors"
            >
              <Asterisk className="h-4 w-4" />
              Contact
            </a>
          </div>
        </div>

        {/* ── Copyright (bottom-left, tight to bottom) ── */}
        <div className="relative z-10 pb-2">
          <div className="hero-copyright text-[11px] opacity-70">&copy;2026</div>
        </div>
      </div>

      {/* ── Marquee (integrated directly at the bottom edge) ── */}
      <div className="overflow-hidden border-t border-ink/10 bg-cream py-4 w-full relative z-20">
        <div className="src-marquee-track flex w-max gap-12 whitespace-nowrap text-sm uppercase tracking-[0.22em] text-ink/70">
          {marqueeRow.map((t, i) => (
            <span key={i} className="flex items-center gap-12 transition-opacity duration-300">
              {t}
              <Asterisk className="h-3 w-3 text-orange" />
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
