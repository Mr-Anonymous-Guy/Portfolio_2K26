import { useRef, useState } from "react";
import { useGSAPContext } from "@/hooks/useGSAP";
import { Asterisk, Arrow } from "@/features/Hero/SourceHero";
import Shuffle from "@/components/shared/Shuffle";
import SplitText from "@/components/shared/SplitText";

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
    { 
      n: "01", 
      title: "AI Systems & Agents", 
      body: "From intelligent assistants to autonomous AI agents, I build systems that reason, retrieve knowledge, automate workflows, and solve real-world problems using modern AI stacks.",
      technologies: ["Python", "FastAPI", "LangChain", "OpenAI", "Ollama", "Qdrant", "PostgreSQL"] 
    },
    { 
      n: "02", 
      title: "Full Stack Platforms", 
      body: "Scalable web applications designed from backend architecture to polished user interfaces, built for performance, maintainability, and production deployment.",
      technologies: ["Next.js", "React", "TypeScript", "Tailwind CSS", "FastAPI", "Docker", "PostgreSQL"] 
    },
    { 
      n: "03", 
      title: "Intelligent Automation", 
      body: "Automate repetitive processes by connecting APIs, AI models, databases, and third-party services into efficient workflows that save time and reduce manual effort.",
      technologies: ["REST APIs", "Webhooks", "Redis", "Cron Jobs", "Workers", "Integrations"] 
    },
    { 
      n: "04", 
      title: "Creative Technology", 
      body: "Premium interactive experiences combining mathematics, procedural graphics, WebGL, and modern frontend engineering.",
      technologies: ["Three.js", "React Three Fiber", "GLSL", "GSAP", "Framer Motion", "WebGPU (Learning)"] 
    },
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

  // Accordion height expand/collapse and stagger tech stack
  useGSAPContext(({ gsap, ScrollTrigger }) => {
    const root = containerRef.current;
    if (!root) return;

    const rows = root.querySelectorAll(".service-row");
    rows.forEach((rowEl, i) => {
      const panel = rowEl.querySelector(".service-panel") as HTMLElement;
      const techPills = panel?.querySelectorAll(".tech-pill");
      
      if (i === openIndex) {
        // Expand
        gsap.to(panel, {
          height: panel.scrollHeight,
          opacity: 1,
          duration: 0.45,
          ease: "power2.out",
          onComplete: () => ScrollTrigger.refresh(),
        });
        
        if (techPills && techPills.length > 0) {
          gsap.to(techPills, {
            y: 0,
            opacity: 1,
            duration: 0.4,
            stagger: 0.04,
            ease: "power2.out",
            delay: 0.1
          });
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
        
        if (techPills && techPills.length > 0) {
          gsap.to(techPills, {
            y: 8,
            opacity: 0,
            duration: 0.2,
            ease: "power2.in"
          });
        }
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
              <Asterisk className="h-3 w-3 text-accent" /> <Shuffle text="WHAT I DO" tag="span" />
            </div>
            <h2 className="service-heading font-display text-[clamp(32px,5vw,72px)] leading-[1.05] opacity-0">
              <Shuffle text="WHAT" tag="span" />
              <br />
              <Shuffle text="I CAN" tag="span" />
              <br />
              <Shuffle text="BUILD" tag="span" className="text-accent" />
              <br />
              <Shuffle text="FOR YOU" tag="span" />
            </h2>
          </div>

          {/* Right Column: Accordion Rows List */}
          <ul className="lg:col-span-7 border-t border-divider mt-6 lg:mt-0">
            {items.map((it, idx) => {
              const isSelfOpen = openIndex === idx;
              return (
                <li
                  key={it.n}
                  className={`service-row group relative border-b transition-all duration-500 ease-out ${
                    isSelfOpen ? "border-b-transparent py-3" : "py-0 border-divider"
                  }`}
                  onMouseEnter={() => {
                    if (window.matchMedia("(hover: hover)").matches) {
                      setOpenIndex(idx);
                    }
                  }}
                  onMouseLeave={() => {
                    if (window.matchMedia("(hover: hover)").matches) {
                      setOpenIndex(null);
                    }
                  }}
                >
                  {/* Animated Divider line on hover */}
                  <div className="absolute bottom-[-1px] left-0 h-px w-full bg-[var(--ember)] origin-left scale-x-0 transition-transform duration-500 ease-out group-hover:scale-x-100 z-10 hidden md:block" />

                  <div
                    role="button"
                    tabIndex={0}
                    aria-expanded={isSelfOpen}
                    className={`w-full cursor-pointer transition-all duration-500 ease-out focus:outline-none ${
                      isSelfOpen
                        ? "bg-[var(--cocoa)] text-[var(--paper)] rounded-2xl p-5 md:p-6 shadow-lg"
                        : "bg-transparent py-4 px-2"
                    }`}
                    onClick={() => {
                      if (!window.matchMedia("(hover: hover)").matches) {
                        setOpenIndex(isSelfOpen ? null : idx);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setOpenIndex(isSelfOpen ? null : idx);
                      }
                    }}
                  >
                    {/* Header Row */}
                    <div className="flex items-center justify-between gap-6">
                      <div className="flex items-center gap-6">
                        <span className={`text-sm tabular-nums transition-colors duration-300 ${
                          isSelfOpen ? "text-[var(--paper)]" : "text-text-secondary group-hover:text-text-primary"
                        }`}>
                          <SplitText
                            text={it.n}
                            delay={30}
                            duration={0.4}
                            ease="power3.out"
                            splitType="chars"
                            from={{ opacity: 0, y: 10 }}
                            to={{ opacity: 1, y: 0 }}
                          />
                        </span>
                        <h3 className={`font-display text-xl md:text-2xl transition-all duration-300 ${
                          isSelfOpen ? "text-[var(--paper)] translate-x-2" : "text-text-primary group-hover:translate-x-1"
                        }`}>
                          <SplitText
                            text={it.title}
                            delay={15}
                            duration={0.6}
                            ease="power3.out"
                            splitType="chars"
                            from={{ opacity: 0, y: 20 }}
                            to={{ opacity: 1, y: 0 }}
                            threshold={0.1}
                          />
                        </h3>
                      </div>

                      {/* Toggle Button */}
                      <button
                        type="button"
                        tabIndex={-1}
                        className="relative h-9 w-9 shrink-0 focus:outline-none pointer-events-none"
                        aria-hidden="true"
                      >
                        {/* Arrow */}
                        <div className={`absolute inset-0 grid place-items-center rounded-full border border-border transition-all duration-300 ${
                          isSelfOpen ? "opacity-0 scale-75 rotate-45 border-transparent" : "opacity-100 scale-100 rotate-0 group-hover:border-text-primary"
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
                      <div className="pt-4 grid gap-6 items-start border-t border-white/10 mt-3">
                        <div>
                          {isSelfOpen ? (
                            <SplitText
                              text={it.body}
                              className="text-sm md:text-[15px] leading-relaxed text-[var(--paper)]/85 max-w-2xl"
                              delay={20}
                              duration={0.5}
                              ease="power3.out"
                              splitType="words"
                              from={{ opacity: 0, y: 15 }}
                              to={{ opacity: 1, y: 0 }}
                              threshold={0}
                              textAlign="left"
                            />
                          ) : (
                            <p className="text-sm md:text-[15px] leading-relaxed text-[var(--paper)]/85 max-w-2xl">
                              {it.body}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          {it.technologies.map((tech) => (
                            <span 
                              key={tech} 
                              className="tech-pill opacity-0 translate-y-2 text-[11px] md:text-xs font-medium tracking-wider text-[var(--paper)]/90 px-3 py-1.5 rounded-full border border-[var(--paper)]/15 bg-white/5 uppercase"
                            >
                              {tech}
                            </span>
                          ))}
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

