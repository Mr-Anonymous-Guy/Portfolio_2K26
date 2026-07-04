import LogoLoop from "@/components/shared/LogoLoop";
import { technologyStack } from "@/data/technologyStack";

export function SourceMarquee() {
  const logos = technologyStack.map((tech) => ({
    title: tech.name,
    node: <span className="font-semibold uppercase tracking-widest">{tech.name}</span>
  }));

  return (
    <div className="border-y border-ink/10 bg-cream py-5">
      <LogoLoop 
        logos={logos} 
        speed={45}
        direction="left"
        gap={48}
        logoHeight={24}
        hoverSpeed={15}
        className="text-ink/80 text-sm" 
      />
    </div>
  );
}
