import { Asterisk } from "@/features/Hero/SourceHero";

export function SourceMarquee() {
  const items = ["UI Design", "UX Research", "Brand Identity", "Webflow", "Framer", "Motion", "Design Systems"];
  const row = [...items, ...items, ...items];
  
  return (
    <div className="overflow-hidden border-y border-ink/10 bg-cream py-5">
      <div className="src-marquee-track flex w-max gap-12 whitespace-nowrap text-sm uppercase tracking-[0.22em] text-ink/70">
        {row.map((t, i) => (
          <span key={i} className="flex items-center gap-12 transition-opacity duration-300">
            {t}
            <Asterisk className="h-3 w-3 text-orange" />
          </span>
        ))}
      </div>
    </div>
  );
}
