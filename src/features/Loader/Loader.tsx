import React, { useEffect, useRef, useState } from "react";
import { useUI } from "@/store/ui";
import {
  startPhrasesScroll,
  startProgressCounter,
  transitionToSoundOptions,
  exitLoader
} from "@/animations/loaderTimeline";
import { Decoder } from "@/animations/heroTimeline";
import { audioManager } from "@/services/audio/audioManager";
import "./Loader.scss";


const PHRASES = [
  "Loading Neural Architectures...",
  "Connecting Local Language Models...",
  "Indexing Vector Memories...",
  "Synchronizing Intelligent Agents...",
  "Compiling Interactive Experiences...",
  "Entering Anonymous's Digital Universe..."
];



export function Loader() {
  const setLoaded = useUI((s) => s.setLoaded);
  const [percent, setPercent] = useState(0);
  const [activeItemIndex, setActiveItemIndex] = useState(-1);
  const [showLoader, setShowLoader] = useState(true);

  // Refs for animation
  const containerRef = useRef<HTMLDivElement>(null);
  const itemsParentRef = useRef<HTMLUListElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);
  const soundIconRef = useRef<SVGSVGElement>(null);
  const soundTextRef = useRef<HTMLParagraphElement>(null);
  const buttonsWrapperRef = useRef<HTMLDivElement>(null);
  const itemsRefs = useRef<HTMLLIElement[]>([]);

  // SplitType Decoders
  const textDecoderRef = useRef<Decoder | null>(null);
  const soundTextDecoderRef = useRef<Decoder | null>(null);

  useEffect(() => {
    // 1. Initialize character decoders
    if (textRef.current) {
      textDecoderRef.current = new Decoder(textRef.current);
      // Run initial decode on the loader text
      textDecoderRef.current.animate({ withSound: false, delay: 0.1 });
    }

    if (soundTextRef.current) {
      soundTextDecoderRef.current = new Decoder(soundTextRef.current);
    }

    // 2. Start infinite phrase list scroll
    let scrollTimeline: gsap.core.Timeline | null = null;
    if (itemsParentRef.current && itemsRefs.current.length > 0) {
      scrollTimeline = startPhrasesScroll(
        itemsParentRef.current,
        itemsRefs.current,
        (activeIndex) => {
          setActiveItemIndex(activeIndex);
        }
      );
    }

    // 3. Start progress counter
    const counterTween = startProgressCounter(
      (val) => {
        setPercent(val);
      },
      () => {
        // Once 100% is reached, wait 1.3 seconds, then transition to sound options
        setTimeout(() => {
          if (
            itemsRefs.current.length > 0 &&
            textRef.current &&
            progressRef.current &&
            soundIconRef.current &&
            soundTextRef.current &&
            buttonsWrapperRef.current
          ) {
            transitionToSoundOptions(
              itemsRefs.current,
              textRef.current,
              progressRef.current,
              soundIconRef.current,
              soundTextRef.current,
              buttonsWrapperRef.current,
              soundTextDecoderRef.current
            );
          }
        }, 1300);
      }
    );

    // Clean up
    return () => {
      counterTween.kill();
      if (scrollTimeline) scrollTimeline.kill();
      if (textDecoderRef.current) textDecoderRef.current.destroy();
      if (soundTextDecoderRef.current) soundTextDecoderRef.current.destroy();
    };
  }, []);

  const handleEnter = (withAudio: boolean) => {
    // Play click sound regardless of choice
    audioManager.play('transition');

    if (withAudio) {
      audioManager.mute(false);
      audioManager.play('scene1');
      audioManager.play('whoosh2');
    } else {
      audioManager.mute(true);
    }

    if (containerRef.current) {
      // Recreate exit transition
      exitLoader(containerRef.current, () => {
        setShowLoader(false);
        setLoaded(true); // Trigger hero reveal animations
        window.dispatchEvent(new CustomEvent("loaderComplete"));
      });
    }
  };

  if (!showLoader) return null;

  // Render duplicated list to achieve seamless infinite vertical scroll
  const duplicatedPhrases = [...PHRASES, ...PHRASES];

  return (
    <div ref={containerRef} className="e-loader">
      <div className="container e-loader__container">
        {/* Left side list of scrolling phrases */}
        <div className="e-loader__items-wrapper" style={{ "--count": PHRASES.length * 2 } as React.CSSProperties}>
          <ul ref={itemsParentRef} className="e-loader__items">
            {duplicatedPhrases.map((phrase, idx) => (
              <li
                key={idx}
                ref={(el) => {
                  if (el) itemsRefs.current[idx] = el;
                }}
                className={`e-loader__item ${idx === activeItemIndex ? "e-loader__item--active" : ""}`}
              >
                // {phrase}
              </li>
            ))}
          </ul>
        </div>

        {/* Center progress indicator */}
        <div ref={progressRef} className="e-loader__progress" data-cursor-hover>
          ( {percent === 100 ? "done" : `${percent}%`} )
        </div>

        {/* Right side explanation text */}
        <p ref={textRef} className="e-loader__text e-loader__text--active" data-cursor-hover>
          // Hang tight, Explorer. The data transfer is in progress. It might take a moment, but the journey ahead is worth the wait...
        </p>

        {/* Sound option warning message (initially hidden) */}
        <div className="e-loader__sound-message">
          <svg
            ref={soundIconRef}
            className="e-loader__sound-icon"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M21.75 12V17.25C21.75 17.8467 21.5129 18.419 21.091 18.841C20.669 19.2629 20.0967 19.5 19.5 19.5H18C17.4033 19.5 16.831 19.2629 16.409 18.841C15.9871 18.419 15.75 17.8467 15.75 17.25V13.5C15.75 12.9033 15.9871 12.331 16.409 11.909C16.831 11.487 17.4033 11.25 18 11.25H20.2172C20.037 9.20821 19.1008 7.30732 17.592 5.91993C16.0832 4.53253 14.1106 3.75865 12.0609 3.75H12C9.94173 3.74989 7.95776 4.51918 6.43759 5.90683C4.91742 7.29448 3.97087 9.20025 3.78375 11.25H6C6.59674 11.25 7.16903 11.487 7.59099 11.909C8.01295 12.331 8.25 12.9033 8.25 13.5V17.25C8.25 17.8467 8.01295 18.419 7.59099 18.841C7.16903 19.2629 6.59674 19.5 6 19.5H4.5C3.90326 19.5 3.33097 19.2629 2.90901 18.841C2.48705 18.419 2.25 17.8467 2.25 17.25V12C2.2521 10.0686 2.82715 8.18134 3.90235 6.57696C4.97755 4.97258 6.50456 3.72325 8.29012 2.9871C10.0757 2.25096 12.0395 2.0611 13.933 2.44156C15.8265 2.82201 17.5646 3.75567 18.9272 5.12437C19.8269 6.02838 20.5393 7.10104 21.0237 8.28089C21.5081 9.46075 21.7549 10.7246 21.75 12Z"
              fill="#F6F5E9"
            />
          </svg>
          <p ref={soundTextRef} className="e-loaders__sound-text" data-cursor-hover>
            For optimal immersion in this digital frontier, we highly recommend activating your audio receptors with headphones
          </p>
        </div>

        {/* Action Entry Buttons (initially hidden) */}
        <div ref={buttonsWrapperRef} className="e-loader__btns-wrapper">
          <button className="btn btn--secondary e-loader__btn" onClick={() => handleEnter(true)}>
            <span className="btn__text">
              <span className="btn__text-1">Enter with audio</span>
              <span className="btn__text-2">Enter with audio</span>
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
          </button>
          <button className="e-loader__btn-without-sound" onClick={() => handleEnter(false)}>
            Enter Without Sound
          </button>
        </div>
      </div>
    </div>
  );
}
