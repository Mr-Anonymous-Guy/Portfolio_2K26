import { useEffect, useRef, type CSSProperties } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
const heroPortrait = "/images/Image.webp";
const projRing = "/images/proj-ring.jpg";

gsap.registerPlugin(ScrollTrigger);

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

  useEffect(() => {
    let heroAnimated = false;

    const onLoaderComplete = () => {
      if (heroAnimated) return;
      heroAnimated = true;

      const heroTl = gsap.timeline({
        onComplete: () => {
          initParallax();
        },
      });

      /* A. Background decorative text */
      const bgText = heroRef.current?.querySelector(".hero__bg-text");
      if (bgText) {
        heroTl.fromTo(
          bgText,
          { opacity: 0, y: 30, filter: "blur(12px)" },
          {
            opacity: 0.03,
            y: 0,
            filter: "blur(0px)",
            duration: 1.6,
            ease: "power3.out",
          },
          0
        );
      }

      /* B. Portrait Image */
      const portrait = heroRef.current?.querySelector("#hero-portrait");
      if (portrait) {
        heroTl.fromTo(
          portrait,
          { scale: 1.06, filter: "blur(8px)", opacity: 0 },
          {
            scale: 1,
            filter: "blur(0px)",
            opacity: 1,
            duration: 1.2,
            ease: "power4.out",
          },
          0.1
        );
      }

      /* C. Hero headline lines stagger */
      const lines = heroRef.current?.querySelectorAll(".hero-word-line");
      if (lines) {
        lines.forEach((line, i) => {
          heroTl.fromTo(
            line,
            { y: 44, opacity: 0, filter: "blur(4px)" },
            {
              y: 0,
              opacity: 1,
              filter: "blur(0px)",
              duration: 1.0,
              ease: "power4.out",
            },
            0.2 + i * 0.12
          );
        });
      }

      /* D. Big MICHAEL title */
      const mainTitle = heroRef.current?.querySelector("#hero-title-main");
      if (mainTitle) {
        heroTl.fromTo(
          mainTitle,
          { y: 56, opacity: 0, filter: "blur(6px)" },
          {
            y: 0,
            opacity: 1,
            filter: "blur(0px)",
            duration: 1.1,
            ease: "power4.out",
          },
          0.45
        );
      }

      /* E. Floating cards stagger reveal */
      const card1 = heroRef.current?.querySelector("#hero-card-1");
      const card2 = heroRef.current?.querySelector("#hero-card-2");
      [card1, card2].forEach((card, i) => {
        if (!card) return;
        heroTl.fromTo(
          card,
          { y: 24, opacity: 0, filter: "blur(4px)" },
          {
            y: 0,
            opacity: 1,
            filter: "blur(0px)",
            duration: 0.7,
            ease: "power3.out",
          },
          0.82 + i * 0.14
        );
      });
    };

    const initParallax = () => {
      const bgText = heroRef.current?.querySelector(".hero__bg-text");
      if (!bgText) return;

      ScrollTrigger.create({
        trigger: "#home",
        start: "top top",
        end: "bottom top",
        onUpdate: (self) => {
          const progress = self.progress;
          gsap.set(bgText, {
            y: progress * -60,
            opacity: 0.03 - progress * 0.03,
          });
        },
      });
    };

    window.addEventListener("loaderComplete", onLoaderComplete);

    // Fallback trigger for hot reloads or fast environments
    const isLoaded = document.body.classList.contains("loaded") || !(document.querySelector(".e-loader"));
    if (isLoaded) {
      onLoaderComplete();
    }

    return () => {
      window.removeEventListener("loaderComplete", onLoaderComplete);
      ScrollTrigger.getAll().forEach((trigger) => {
        if (trigger.vars.trigger === "#home") trigger.kill();
      });
    };
  }, []);

  return (
    <section ref={heroRef} id="home" className="relative isolate overflow-hidden bg-background text-text-primary transition-colors duration-300">
      <div className="container-x relative mx-auto flex min-h-[100svh] max-w-[1480px] flex-col pt-32 md:pt-36 pb-12">
        {/* ghost word behind portrait */}
        <div className="pointer-events-none absolute inset-x-0 top-[16%] flex justify-center">
          <span data-reveal-bg className="hero__bg-text font-display text-[18vw] leading-none text-text-primary/10 select-none">
            TUTUN
          </span>
        </div>

        <img
          id="hero-portrait"
          data-reveal-hero
          src={heroPortrait}
          alt="Portrait of Tutun, product designer"
          width={1280}
          height={1600}
          fetchPriority="high"
          className="pointer-events-none absolute left-1/2 top-[6%] h-[88%] w-auto max-w-none -translate-x-1/2 object-contain z-10"
        />

        {/* left blurb */}
        <div data-reveal-headline className="relative z-10 mt-[28vh] max-w-xs text-[11px] uppercase tracking-[0.16em] leading-relaxed md:text-xs">
          <p className="space-y-0">
            <span className="block hero-word-line" style={{ "--i": 0 } as CSSProperties}>I build AI-powered products,</span>
            <span className="block hero-word-line" style={{ "--i": 1 } as CSSProperties}>scalable web applications,</span>
            <span className="block hero-word-line" style={{ "--i": 2 } as CSSProperties}>and intelligent systems that</span>
            <span className="block hero-word-line" style={{ "--i": 3 } as CSSProperties}>transform ideas into</span>
            <span className="block hero-word-line" style={{ "--i": 4 } as CSSProperties}>real-world solutions.</span>
          </p>
        </div>

        {/* polaroid card */}
        <div
          id="hero-card-1"
          data-reveal-card
          style={{ "--i": 0 } as CSSProperties}
          className="absolute right-[3vw] top-[36%] hidden w-[230px] rotate-[2deg] bg-bg-surface-elevated p-2 pb-3 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.45)] md:block float-idle"
        >
          <div className="aspect-square overflow-hidden bg-bg-surface">
            <img src={projRing} alt="" className="h-full w-full object-cover" width={800} height={800} loading="lazy" />
          </div>
          <div className="mt-2 flex items-center justify-between px-1 text-text-primary">
            <span className="flex items-center gap-1 text-[11px] font-semibold tracking-wide">
              <Asterisk className="h-3 w-3 text-accent" />
              ZENTIX
            </span>
            <span className="text-[11px] text-text-secondary">/Design</span>
          </div>
        </div>

        {/* contact card */}
        <div
          id="hero-card-2"
          data-reveal-card
          style={{ "--i": 1 } as CSSProperties}
          className="absolute bottom-10 right-[3vw] hidden w-[300px] items-center gap-3 rounded-md bg-text-primary p-3 text-bg-primary md:flex float-idle-alt"
        >
          <div className="h-14 w-14 shrink-0 overflow-hidden rounded-sm bg-bg-primary">
            <img src={heroPortrait} alt="" className="h-full w-full object-cover" loading="lazy" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-bg-primary/70">Let's Talk</span>
              <Asterisk className="h-3 w-3 text-accent" />
            </div>
            <div className="text-sm font-semibold">Tutun</div>
            <div className="text-[11px] text-bg-primary/60">UI/UX Designer</div>
          </div>
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-sm bg-accent">
            <Arrow className="h-4 w-4" />
          </div>
        </div>

        {/* big MICHAEL */}
        <div data-reveal-headline className="absolute bottom-[14%] left-[2vw] z-0">
          <div className="text-[11px] opacity-70" style={{ "--i": 3 } as CSSProperties}>©2026</div>
          <h1 id="hero-title-main" className="font-display text-[clamp(60px,11vw,200px)] leading-[0.85] text-text-hero-display tracking-tight" style={{ "--i": 4 } as CSSProperties}>
            TUTUN
          </h1>
        </div>
      </div>
    </section>
  );
}
