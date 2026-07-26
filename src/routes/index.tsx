import React, { Suspense, useEffect, useRef } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { SmoothScroll } from "@/components/shared/SmoothScroll";
import { Nav } from "@/components/shared/Nav/Nav";
import { Loader } from "@/features/Loader";
import { SourceHero } from "@/features/Hero/SourceHero";
import { SourceIntroduction } from "@/features/Services/SourceIntroduction";
import { SourceServices } from "@/features/Services/SourceServices";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { workManifest } from "@/data/workManifest";
import { assetPreloader } from "@/services/assetPreloader";
import { usePreloadStore, initPreloadBridge } from "@/store/preload";

const SWork = React.lazy(() => import("@/features/Projects/Work/SWork").then(m => ({ default: m.SWork })));
const SMyWay = React.lazy(() => import("@/features/Projects/MyWay/SMyWay").then(m => ({ default: m.SMyWay })));
const SCTA = React.lazy(() => import("@/features/Contact/CTA/SCTA"));

gsap.registerPlugin(ScrollTrigger);

/** Number of videos to preload at high priority during the loader phase */
const HIGH_PRIORITY_VIDEO_COUNT = 6;

export const Route = createFileRoute("/")(  {
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
          ],
        }),
      },
    ],
  }),
  component: Index,
});

function Index() {
  const preloaderStarted = useRef(false);

  useEffect(() => {
    if (preloaderStarted.current) return;
    preloaderStarted.current = true;

    // Initialize the Zustand ↔ AssetPreloader bridge
    initPreloadBridge();

    // ── Register assets ─────────────────────────────

    // 1. Fonts (tracked via document.fonts.ready)
    assetPreloader.registerFonts();

    // 2. Critical images (hero, OG image)
    assetPreloader.registerImages(
      ['/images/Image.webp', '/images/grain.jpg'],
      'critical'
    );

    // 3. Work videos — filter visible works (same logic as SWork)
    const visibleWorks = workManifest.filter(
      (work) => work.status !== 'Archived' && work.status !== 'Private'
    );

    // Shuffle for variety (same as SWork does)
    const shuffled = [...visibleWorks];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    const allVideoUrls = shuffled.map((w) => w.video).filter(Boolean);

    // First N videos = high priority (loaded during loader phase)
    const highPriorityVideos = allVideoUrls.slice(0, HIGH_PRIORITY_VIDEO_COUNT);
    const normalPriorityVideos = allVideoUrls.slice(HIGH_PRIORITY_VIDEO_COUNT);

    assetPreloader.registerVideos(highPriorityVideos, 'high');
    assetPreloader.registerVideos(normalPriorityVideos, 'normal');

    // 4. Gallery frame images (normal priority — loaded after loader exits)
    const frameImages = shuffled
      .map((w) => w.thumbnail)
      .filter((t) => t && t.length > 0);
    assetPreloader.registerImages(frameImages, 'normal');

    // ── Start preloading ────────────────────────────
    assetPreloader.start().then(() => {
      usePreloadStore.getState().setReady(true);
      usePreloadStore.getState().syncBlobUrls();
    });

    // ── Continue background loading after loader exits ──
    const onLoaderComplete = () => {
      assetPreloader.continueBackground();
    };
    window.addEventListener('loaderComplete', onLoaderComplete, { once: true });

    return () => {
      window.removeEventListener('loaderComplete', onLoaderComplete);
    };
  }, []);

  return (
    <div className="grain relative min-h-screen bg-[var(--paper)] text-[var(--ink)]">
      <Loader />
      <SmoothScroll />
      <Nav />
      <main className="relative z-10">
        <div className="src-section">
          <SourceHero />
          <SourceIntroduction />
          <SourceServices />
        </div>

        {/* Remaining AW portfolio sections */}
        <div id="work-section-container" className="relative z-40 bg-background">
          <Suspense fallback={null}>
            <SWork />
            <SMyWay />
            <SCTA />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
