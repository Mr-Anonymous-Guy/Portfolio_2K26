import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { AnimatedCounter } from "@/components/shared/AnimatedCounter";
import { Asterisk } from "@/features/Hero/SourceHero";
import Shuffle from "@/components/shared/Shuffle";

const impactFigure = "/images/Figure.webp";

gsap.registerPlugin(ScrollTrigger);

export function SourceIntroduction() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    const elements = root.querySelectorAll(".reveal");
    elements.forEach((el) => {
      gsap.set(el, { opacity: 0, y: 44, filter: "blur(4px)" });

      ScrollTrigger.create({
        trigger: el,
        start: "top 82%",
        once: true,
        onEnter: () => {
          gsap.to(el, {
            y: 0,
            opacity: 1,
            filter: "blur(0px)",
            duration: 1.0,
            ease: "power4.out",
          });
        },
      });
    });

    const images = root.querySelectorAll("[data-reveal-image]");
    images.forEach((img) => {
      const wrapper = img.closest(".img-contain-reveal") || img.closest(".img-reveal") || img.parentElement;
      gsap.set(img, {
        scale: 1.0,
        filter: "blur(6px)",
        opacity: 0,
      });

      ScrollTrigger.create({
        trigger: wrapper || img,
        start: "top 85%",
        once: true,
        onEnter: () => {
          gsap.to(img, {
            scale: 1.0,
            filter: "blur(0px)",
            opacity: 1,
            duration: 1.2,
            ease: "power4.out",
          });
        },
      });
    });

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => {
        if (trigger.vars.trigger && typeof trigger.vars.trigger === "object" && root.contains(trigger.vars.trigger as Node)) {
          trigger.kill();
        }
      });
    };
  }, []);

  return (
    <section ref={containerRef} id="about" className="bg-background text-text-primary select-text transition-colors duration-300">
      <div className="container-x mx-auto max-w-[1480px] py-24 md:py-32">
        <div className="mb-12 flex items-center gap-3 text-xs uppercase tracking-[0.22em] text-text-secondary">
          <Asterisk className="h-3 w-3 text-accent" />
          <Shuffle text="WHO I AM" tag="span" />
        </div>
        <div className="grid gap-12 lg:grid-cols-12 items-center">
          <h2 className="reveal font-display text-[clamp(36px,5.4vw,84px)] lg:col-span-7">
            <Shuffle text="BUILDING" tag="span" />
            <br />
            <Shuffle text="INTELLIGENT" tag="span" className="text-accent" />
            <br />
            <Shuffle text="DIGITAL" tag="span" />
            <br />
            <Shuffle text="PRODUCTS" tag="span" />
          </h2>
          <div className="reveal lg:col-span-5 flex items-center justify-center w-full min-h-[320px] lg:min-h-[400px] p-2 overflow-visible">
            <div className="relative w-full max-w-[420px] lg:max-w-[440px] flex items-center justify-center overflow-visible img-contain-reveal">
              <img
                src={impactFigure}
                data-reveal-image
                alt="Figure"
                className="w-full h-auto max-h-[420px] lg:max-h-[440px] object-contain drop-shadow-2xl"
                loading="eager"
              />
            </div>
          </div>
        </div>

        <div className="mt-16 grid gap-8 border-t border-divider pt-10 md:grid-cols-2">
          <Stat n="04+" label={"Major Projects\n\nArogyaAI, FinSmart,\nPortfolio & AI Experiments."} />
          <Stat n="15+" label={"Technologies\n\nReact, Next.js, FastAPI,\nPython, Docker & AI."} />
        </div>
      </div>
    </section>
  );
}

function Stat({ n, label }: { n: string; label: string }) {
  return (
    <div className="reveal flex items-end justify-between gap-6">
      <span className="font-display text-[clamp(56px,8vw,128px)] text-text-primary">
        <AnimatedCounter value={n} />
      </span>
      <p className="max-w-[260px] pb-4 text-sm leading-relaxed text-text-secondary whitespace-pre-line">{label}</p>
    </div>
  );
}
