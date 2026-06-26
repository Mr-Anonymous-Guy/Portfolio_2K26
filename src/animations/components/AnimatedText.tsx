'use client';

import { useMemo, useRef } from 'react';
import { useGSAPContext } from '@/hooks/useGSAP';

interface AnimatedTextProps {
  text: string;
  className?: string;
  delay?: number;
}

export default function AnimatedText({ text, className = '', delay = 0 }: AnimatedTextProps) {
  const containerRef = useRef<HTMLSpanElement>(null);

  const words = useMemo(() => {
    return text.split(' ').map((word) => ({
      word,
      chars: word.split(''),
    }));
  }, [text]);

  useGSAPContext(({ gsap }) => {
    if (!containerRef.current) return;

    const chars = containerRef.current.querySelectorAll('.char');

    gsap.fromTo(
      chars,
      { y: 100, opacity: 0, rotateZ: 10 },
      {
        y: 0,
        opacity: 1,
        rotateZ: 0,
        duration: 1,
        ease: 'power4.out',
        stagger: 0.02,
        delay,
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 90%',
        },
      }
    );
  }, [delay]);

  return (
    <span
      ref={containerRef}
      className={`inline-block overflow-hidden ${className}`}
      aria-label={text}
      data-cursor-hover
    >
      {words.map((wordObj, wordIndex) => (
        <span key={wordIndex} className="inline-block whitespace-nowrap">
          {wordObj.chars.map((char, charIndex) => (
            <span
              key={charIndex}
              className="char inline-block"
              style={{ willChange: 'transform, opacity' }}
            >
              {char}
            </span>
          ))}
          {wordIndex < words.length - 1 && (
            <span className="inline-block">&nbsp;</span>
          )}
        </span>
      ))}
    </span>
  );
}
