import React, { useEffect, useRef, useState } from "react";
import { useUI } from "@/store/ui";
import {
  setTextLines,
  byTextLines,
  Decoder,
  setOpacityHidden,
  animateOpacity,
  setScaleHidden,
  animateScale
} from "@/animations/heroTimeline";
import "./Hero.scss";

const MARQUEE_ITEMS = "Nuxt3, WebGl, GSAP, Escroll, Three.js, Storyblok, Storytelling, Web3, Web2";

export function Hero() {
  const loaded = useUI((s) => s.loaded);
  const [activeTheme, setActiveTheme] = useState(false);

  // Refs for elements
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const title1Ref = useRef<HTMLSpanElement>(null);
  const title2Ref = useRef<HTMLSpanElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);
  const marqueeRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLAnchorElement>(null);

  // SplitType instances / decoders
  const textDecoderRef = useRef<Decoder | null>(null);
  const title1SplitRef = useRef<any>(null);
  const title2SplitRef = useRef<any>(null);

  useEffect(() => {
    // 1. Initial State Setup (Set elements to hidden / pre-split)
    if (textRef.current) {
      textDecoderRef.current = new Decoder(textRef.current);
    }

    if (title1Ref.current) {
      title1SplitRef.current = setTextLines(title1Ref.current, "up");
    }

    if (title2Ref.current) {
      title2SplitRef.current = setTextLines(title2Ref.current, "up");
    }

    if (marqueeRef.current) {
      setOpacityHidden(marqueeRef.current);
    }

    if (btnRef.current) {
      setScaleHidden(btnRef.current);
    }
  }, []);

  useEffect(() => {
    // 2. Play Reveal Animations once Loader is completed
    if (loaded) {
      const playReveal = async () => {
        // Delay hero reveal by 500ms after loader fades out (matching original)
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Reveal title top line
        if (title1Ref.current) {
          byTextLines(title1Ref.current, { delay: 0 });
        }

        // Reveal title bottom line (delayed 0.2s)
        if (title2Ref.current) {
          byTextLines(title2Ref.current, { delay: 0.2 });
        }

        // Decode character animation for description (delayed 0.5s)
        if (textDecoderRef.current) {
          textDecoderRef.current.animate({ withSound: false, delay: 0.5 });
          // Ensure container is opacity: 1
          if (textRef.current) {
            textRef.current.style.opacity = "1";
          }
        }

        // Scale and fade in buttons (delayed 1.5s)
        if (btnRef.current) {
          animateScale(btnRef.current, { delay: 1.5 });
        }

        // Fade in marquee (delayed 1.7s)
        if (marqueeRef.current) {
          animateOpacity(marqueeRef.current, { delay: 1.7 });
        }
      };

      playReveal();
    }
  }, [loaded]);

  // Clean up
  useEffect(() => {
    return () => {
      if (textDecoderRef.current) textDecoderRef.current.destroy();
      if (title1SplitRef.current) title1SplitRef.current.revert();
      if (title2SplitRef.current) title2SplitRef.current.revert();
    };
  }, []);

  return (
    <div ref={containerRef} id="start" className="hero-pin" data-section="">
      <section ref={contentRef} className="section hero e-pin">
        <div className="container hero__container">
          <h1 className="hero__title">
            <span ref={title1Ref} className="hero__title-top">
              Cutt<span className="text-alt">i</span>ng <span className="text-alt">e</span>dge
              <span className="purple">.</span>
            </span>
            <span ref={title2Ref} className="hero__title-bottom">
              Front<span className="text-alt">e</span>nd solut<span className="text-alt">i</span>ons
              <span className="purple">.</span>
            </span>
          </h1>

          <p ref={textRef} className="hero__text">
            We specialize in crafting interfaces that deliver an unparalleled user experience. Prototyping, designing, and developing for Web2 & Web3 interfaces
          </p>

          <div ref={marqueeRef} className="hero__marquee">
            <span className="purple">[</span>
            <div className="hero__marquee-text">
              <div className="marquee">
                <div className="marquee__items">
                  <div className="marquee__item">
                    ,&nbsp;{MARQUEE_ITEMS}
                  </div>
                  <div className="marquee__item">
                    ,&nbsp;{MARQUEE_ITEMS}
                  </div>
                </div>
              </div>
            </div>
            <span className="purple">]</span>
          </div>

          <a
            ref={btnRef}
            className="btn btn--primary hero__btn"
            href="https://calendly.com/emotion-agency/30min"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="btn__text">
              <span className="btn__text-1">Ready to Talk?</span>
              <span className="btn__text-2">Ready to Talk?</span>
            </span>
            <span className="btn__icon">
              <svg width="14" height="12" viewBox="0 0 14 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M0.5 -0.000315666C0.367392 -0.000315666 0.240215 0.0523627 0.146447 0.146131C0.0526784 0.239899 0 0.367076 0 0.499684V5.29968C0 5.62799 0.0646644 5.95308 0.190301 6.25639C0.315938 6.55971 0.500087 6.83531 0.732233 7.06745C1.20107 7.53629 1.83696 7.79968 2.5 7.79968H12.293L8.946 11.1457C8.85211 11.2396 8.79937 11.3669 8.79937 11.4997C8.79937 11.6325 8.85211 11.7598 8.946 11.8537C9.03989 11.9476 9.16722 12.0003 9.3 12.0003C9.43278 12.0003 9.56011 11.9476 9.654 11.8537L13.854 7.65368C13.9006 7.60724 13.9375 7.55206 13.9627 7.49132C13.9879 7.43057 14.0009 7.36545 14.0009 7.29968C14.0009 7.23392 13.9879 7.1688 13.9627 7.10805C13.9375 7.04731 13.9006 6.99213 13.854 6.94568L9.854 2.94568C9.76011 2.8518 9.63278 2.79905 9.5 2.79905C9.36722 2.79905 9.23989 2.8518 9.146 2.94568C9.05211 3.03957 8.99937 3.16691 8.99937 3.29968C8.99937 3.43246 9.05211 3.5598 9.146 3.65368L12.293 6.79968H2.5C2.10218 6.79968 1.72064 6.64165 1.43934 6.36034C1.15804 6.07904 1 5.69751 1 5.29968V0.499684C1 0.367076 0.947322 0.239899 0.853553 0.146131C0.759785 0.0523627 0.632608 -0.000315666 0.5 -0.000315666V-0.000315666Z"
                  fill="white"
                />
              </svg>
            </span>
          </a>
        </div>
      </section>
    </div>
  );
}
