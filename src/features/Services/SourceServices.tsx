import { useRef, useState } from "react";
import { useGSAPContext } from "@/hooks/useGSAP";
import { Asterisk, Arrow } from "@/features/Hero/SourceHero";

const servicePaper = "/images/service-paper.jpg";
const serviceBear = "/images/service-bear.jpg";
const serviceCalendar = "/images/service-calendar.jpg";
const serviceSphere = "/images/service-sphere.jpg";

const X = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export function SourceServices() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const items = [
    { n: "01", title: "AI Applications", body: "Developing intelligent applications using Python, FastAPI, Machine Learning, Large Language Models and Retrieval-Augmented Generation (RAG) to solve real-world problems.", img: servicePaper },
    { n: "02", title: "Full Stack Development", body: "Building modern, responsive and scalable web applications using React, Next.js, TypeScript, PostgreSQL and clean backend architecture.", img: serviceBear },
    { n: "03", title: "Automation & APIs", body: "Creating REST APIs, backend services and intelligent automation workflows that improve productivity and connect modern applications.", img: serviceCalendar },
    { n: "04", title: "Web & Mobile Design", body: "Crafted interfaces and motion that feel premium on every device and every screen.", img: serviceSphere },
  ];

  // Stagger reveal on scroll
  useGSAPContext(({ gsap, ScrollTrigger }) => {
    const root = containerRef.current;
    if (!root) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: root,
        start: "top 75%",
        once: true,
      },
    });

    tl.fromTo(
      root.querySelector(".service-label"),
      { opacity: 0, y: 15 },
      { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }
    )
      .fromTo(
        root.querySelector(".service-heading"),
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" },
        "-=0.3"
      )
      .fromTo(
        root.querySelectorAll(".service-row"),
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.12, ease: "power3.out" },
        "-=0.4"
      );
  }, []);

  // Accordion height expand/collapse
  useGSAPContext(({ gsap, ScrollTrigger }) => {
    const root = containerRef.current;
    if (!root) return;

    const rows = root.querySelectorAll(".service-row");
    rows.forEach((rowEl, i) => {
      const panel = rowEl.querySelector(".service-panel") as HTMLElement;
      const thumb = panel?.querySelector(".service-thumb");
      
      if (i === openIndex) {
        // Expand
        gsap.to(panel, {
          height: panel.scrollHeight,
          opacity: 1,
          duration: 0.45,
          ease: "power2.out",
          onComplete: () => ScrollTrigger.refresh(),
        });
        if (thumb) {
          gsap.fromTo(
            thumb,
            { x: 30, opacity: 0 },
            { x: 0, opacity: 1, duration: 0.4, delay: 0.1 }
          );
        }
      } else {
        // Collapse
        gsap.to(panel, {
          height: 0,
          opacity: 0,
          duration: 0.35,
          ease: "power2.in",
          onComplete: () => ScrollTrigger.refresh(),
        });
      }
    });
  }, [openIndex]);

  return (
    <section ref={containerRef} id="service" className="bg-background text-text-primary select-text">
      <div className="container-x mx-auto max-w-[1480px] py-24 md:py-32">
        <div className="grid gap-8 lg:grid-cols-12 lg:gap-16 lg:items-start">
          
          {/* Left Column: Title & Label */}
          <div className="lg:col-span-5 lg:sticky lg:top-12">
            <div className="service-label mb-6 flex items-center gap-3 text-xs uppercase tracking-[0.22em] text-text-secondary opacity-0">
              <Asterisk className="h-3 w-3 text-accent" /> WHAT I DO
            </div>
            <h2 className="service-heading font-display text-[clamp(32px,5vw,72px)] leading-[1.05] opacity-0">
              WHAT
              <br />
              I CAN
              <br />
              <span className="text-accent">BUILD</span>
              <br />
              FOR YOU
            </h2>
          </div>

          {/* Right Column: Accordion Rows List */}
          <ul className="lg:col-span-7 border-t border-divider mt-6 lg:mt-0">
            {items.map((it, idx) => {
              const isSelfOpen = openIndex === idx;
              return (
                <li
                  key={it.n}
                  className={`service-row group border-b border-divider transition-all duration-500 ease-out ${
                    isSelfOpen ? "border-b-transparent py-3" : "py-0"
                  }`}
                >
                  <div
                    className={`w-full cursor-pointer transition-all duration-500 ease-out ${
                      isSelfOpen
                        ? "bg-[var(--cocoa)] text-[var(--paper)] rounded-2xl p-5 md:p-6 shadow-lg"
                        : "bg-transparent py-4 px-2 hover:bg-black/5"
                    }`}
                    onClick={() => setOpenIndex(isSelfOpen ? null : idx)}
                  >
                    {/* Header Row */}
                    <div className="flex items-center justify-between gap-6">
                      <div className="flex items-center gap-6">
                        <span className={`text-sm tabular-nums transition-colors duration-300 ${
                          isSelfOpen ? "text-[var(--paper)]/60" : "text-text-secondary"
                        }`}>
                          {it.n}
                        </span>
                        <h3 className={`font-display text-xl md:text-2xl transition-colors duration-300 ${
                          isSelfOpen ? "text-[var(--paper)]" : "text-text-primary"
                        }`}>
                          {it.title}
                        </h3>
                      </div>

                      {/* Toggle Button */}
                      <button
                        type="button"
                        className="relative h-9 w-9 shrink-0 focus:outline-none"
                        aria-label={isSelfOpen ? "Close panel" : "Open panel"}
                      >
                        {/* Arrow */}
                        <div className={`absolute inset-0 grid place-items-center rounded-full border border-border transition-all duration-300 ${
                          isSelfOpen ? "opacity-0 scale-75 rotate-45 border-transparent" : "opacity-100 scale-100 rotate-0"
                        }`}>
                          <Arrow className="h-3.5 w-3.5" />
                        </div>
                        {/* Close Icon */}
                        <div className={`absolute inset-0 grid place-items-center rounded-full border border-white/20 transition-all duration-300 ${
                          isSelfOpen ? "opacity-100 scale-100 rotate-0" : "opacity-0 scale-75 -rotate-45 border-transparent"
                        }`}>
                          <X className="h-3.5 w-3.5 text-[var(--paper)]" />
                        </div>
                      </button>
                    </div>

                    {/* Panel */}
                    <div
                      className="service-panel overflow-hidden transition-all duration-300"
                      style={{ height: 0, opacity: 0 }}
                    >
                      <div className="pt-4 grid gap-4 md:grid-cols-[1fr_200px] items-center border-t border-white/10 mt-3">
                        <div>
                          <p className="text-xs md:text-sm leading-relaxed text-[var(--paper)]/80 max-w-md">
                            {it.body}
                          </p>
                        </div>
                        <div className="service-thumb hidden h-28 w-full overflow-hidden rounded-lg md:block opacity-0">
                          <img
                            src={it.img}
                            alt={it.title}
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

        </div>
      </div>
    </section>
  );
}

