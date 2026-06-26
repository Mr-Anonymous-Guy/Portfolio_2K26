import React, { Suspense } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { SmoothScroll } from "@/components/shared/SmoothScroll";
import { Nav } from "@/components/shared/Nav/Nav";
import { Loader } from "@/features/Loader";
import { SourceHero } from "@/features/Hero/SourceHero";
import { SourceMarquee } from "@/components/SourceMarquee";
import { SourceIntroduction } from "@/features/Services/SourceIntroduction";
import { SourceServices } from "@/features/Services/SourceServices";

const SWork = React.lazy(() => import("@/features/Projects/Work/SWork").then(m => ({ default: m.SWork })));
const SMyWay = React.lazy(() => import("@/features/Projects/MyWay/SMyWay").then(m => ({ default: m.SMyWay })));
const SCTA = React.lazy(() => import("@/features/Contact/CTA/SCTA"));

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Tutun Mahapatra — AI Engineer & Full Stack Developer" },
      {
        name: "description",
        content:
          "Portfolio of Tutun Mahapatra (Mr. Anonymous) — second-year CSE student building intelligent systems, RAG platforms, and full-stack products.",
      },
      { property: "og:title", content: "Tutun Mahapatra — AI Engineer & Full Stack Developer" },
      {
        property: "og:description",
        content:
          "Selected work: ArogyaAI, Fin Smart. Built with React, FastAPI, LangChain and a love for calm interfaces.",
      },
      { property: "og:url", content: "https://mr-anonymous.dev/" },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "https://mr-anonymous.dev/images/Image.webp" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Tutun Mahapatra — AI Engineer & Full Stack Developer" },
      {
        name: "twitter:description",
        content: "Building intelligent systems. Selected work, stack and contact.",
      },
      { name: "twitter:image", content: "https://mr-anonymous.dev/images/Image.webp" },
    ],
    links: [{ rel: "canonical", href: "https://mr-anonymous.dev/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Person",
          name: "Tutun Mahapatra",
          alternateName: "Mr. Anonymous",
          jobTitle: "AI Engineer & Full Stack Developer",
          description:
            "Second-year B.Tech CSE student building intelligent systems and full-stack products.",
          knowsAbout: [
            "Artificial Intelligence",
            "Full Stack Development",
            "RAG",
            "FastAPI",
            "React",
            "PostgreSQL",
            "MySQL",
          ],
        }),
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="grain relative min-h-screen bg-[var(--paper)] text-[var(--ink)]">
      <Loader />
      <SmoothScroll />
      <Nav />
      <main className="relative z-10">
        <div className="src-section">
          <SourceHero />
          <SourceMarquee />
          <SourceIntroduction />
          <SourceServices />
        </div>

        {/* Remaining AW portfolio sections */}
        <Suspense fallback={null}>
          <SWork />
          <SMyWay />
          <SCTA />
        </Suspense>
      </main>
    </div>
  );
}
