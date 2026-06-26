import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Asterisk, Arrow } from "@/features/Hero/SourceHero";
const servicePaper = "/images/service-paper.jpg";
const serviceBear = "/images/service-bear.jpg";
const serviceCalendar = "/images/service-calendar.jpg";
const serviceSphere = "/images/service-sphere.jpg";

gsap.registerPlugin(ScrollTrigger);

export function SourceServices() {
  const containerRef = useRef<HTMLDivElement>(null);

  const items = [
    { n: "01", title: "AI Applications", body: "Developing intelligent applications using Python, FastAPI, Machine Learning, Large Language Models and Retrieval-Augmented Generation (RAG) to solve real-world problems.", img: servicePaper },
    { n: "02", title: "Full Stack Development", body: "Building modern, responsive and scalable web applications using React, Next.js, TypeScript, PostgreSQL and clean backend architecture.", img: serviceBear },
    { n: "03", title: "Automation & APIs", body: "Creating REST APIs, backend services and intelligent automation workflows that improve productivity and connect modern applications.", img: serviceCalendar },
    { n: "04", title: "Web & Mobile Design", body: "Crafted interfaces and motion that feel premium on every device and every screen.", img: serviceSphere },
  ];

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
      const wrapper = img.closest(".img-reveal") || img.parentElement;
      gsap.set(img, {
        scale: 1.08,
        filter: "blur(8px)",
        opacity: 0,
      });

      ScrollTrigger.create({
        trigger: wrapper || img,
        start: "top 85%",
        once: true,
        onEnter: () => {
          gsap.to(img, {
            scale: 1,
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
    <section ref={containerRef} id="service" className="bg-background text-text-primary select-text">
      <div className="container-x mx-auto max-w-[1480px] py-24 md:py-32">
        <div className="mb-12 flex items-center gap-3 text-xs uppercase tracking-[0.22em] text-text-secondary">
          <Asterisk className="h-3 w-3 text-accent" /> WHAT I DO
        </div>
        <h2 className="reveal font-display text-[clamp(36px,5.4vw,84px)]">
          WHAT
          <br />
          I CAN
          <br />
          <span className="text-accent">BUILD</span>
          <br />
          FOR YOU
        </h2>

        <ul className="mt-16 divide-y divide-divider border-y border-divider">
          {items.map((it) => (
            <li key={it.n} className="reveal group grid grid-cols-[auto_1fr_auto] items-center gap-6 py-6 md:grid-cols-[80px_1fr_240px_60px]">
               <span className="text-sm tabular-nums text-text-secondary">{it.n}</span>
              <div>
                <h3 className="font-display text-2xl md:text-3xl">{it.title}</h3>
                 <p className="mt-2 max-w-md text-sm text-text-secondary">{it.body}</p>
              </div>
              <div className="hidden h-24 w-full overflow-hidden md:block img-reveal">
                <img src={it.img} data-reveal-image alt="" className="h-full w-full scale-105 object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
              </div>
               <div className="grid h-10 w-10 place-items-center rounded-full border border-border transition group-hover:bg-accent group-hover:text-paper group-hover:border-accent">
                <Arrow className="h-4 w-4" />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
