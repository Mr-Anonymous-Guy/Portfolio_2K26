import { useEffect, useRef, useState } from "react";
import { useQuote } from "../../hooks/useQuote";
import { useUI } from "@/store/ui";
import { Quote } from "../../types/quote";

export function QuoteBanner() {
  const textRef = useRef<HTMLSpanElement>(null);
  const { quote, rotateToNextQuote } = useQuote();
  const isLoaded = useUI((s) => s.loaded);

  // Quote and transition states
  const [activeQuote, setActiveQuote] = useState<Quote | null>(null);
  const [fadeState, setFadeState] = useState<"fade-in" | "fade-out">("fade-in");
  const [showAuthor, setShowAuthor] = useState(false);

  // Typing and timer control states
  const [isTyping, setIsTyping] = useState(false);

  // Pause conditions refs
  const isHovered = useRef(false);
  const isTabHidden = useRef(false);
  const isWindowBlurred = useRef(false);
  const isSelectingText = useRef(false);

  // Countdown timer refs
  const timerSecondsRemainingRef = useRef(35);
  const isTypingRef = useRef(false);

  // Sync isTyping with ref
  useEffect(() => {
    isTypingRef.current = isTyping;
  }, [isTyping]);

  // Hook to handle preloading / transition of new quotes
  useEffect(() => {
    if (!quote || !isLoaded) return;

    // Reset transitions and set active quote
    setActiveQuote(quote);
    setFadeState("fade-in");
    setShowAuthor(false);
    setIsTyping(true);

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      // Reduced motion fallback: instantly reveal text and author
      if (textRef.current) {
        textRef.current.textContent = `QUOTE:\n"${quote.text}"`;
      }
      setShowAuthor(true);
      setIsTyping(false);
      // Set random timer duration between 30 and 45 seconds
      timerSecondsRemainingRef.current = 30 + Math.floor(Math.random() * 16);
      return;
    }

    // Typewriter typing animation
    let animationFrameId: number;
    let isAborted = false;

    let currentText = "QUOTE:\n";
    const targetText = `QUOTE:\n"${quote.text}"`;
    let typedIndex = 7; // Start typing after "QUOTE:\n"
    let lastTypeTime = 0;
    let writeDelay = 0;

    if (textRef.current) {
      textRef.current.textContent = currentText;
    }

    const typeLoop = (time: number) => {
      if (isAborted) return;
      animationFrameId = requestAnimationFrame(typeLoop);

      if (time - lastTypeTime < writeDelay) {
        return;
      }

      if (typedIndex < targetText.length) {
        const char = targetText.charAt(typedIndex);
        currentText += char;
        typedIndex++;

        // Typing delay rules
        if (char === ",") {
          writeDelay = 100;
        } else if (char === " ") {
          writeDelay = 100;
        } else if (char === ".") {
          writeDelay = 400;
        } else if (char === "?" || char === "!") {
          writeDelay = 400;
        } else {
          writeDelay = 25;
        }

        if (textRef.current) {
          textRef.current.textContent = currentText;
        }
      } else {
        // Typing finished
        setShowAuthor(true);
        setIsTyping(false);
        // Set random timer duration between 30 and 45 seconds
        timerSecondsRemainingRef.current = 30 + Math.floor(Math.random() * 16);
        cancelAnimationFrame(animationFrameId);
      }

      lastTypeTime = time;
    };

    animationFrameId = requestAnimationFrame(typeLoop);

    return () => {
      isAborted = true;
      cancelAnimationFrame(animationFrameId);
    };
  }, [quote, isLoaded]);

  // Set up smart rotation timer countdown
  useEffect(() => {
    if (!isLoaded) return;

    const interval = setInterval(() => {
      // Pause if currently typing or if any pause condition is met
      const isPaused =
        isTypingRef.current ||
        isHovered.current ||
        isTabHidden.current ||
        isWindowBlurred.current ||
        isSelectingText.current;

      if (!isPaused) {
        timerSecondsRemainingRef.current -= 1;
        if (timerSecondsRemainingRef.current <= 0) {
          // Trigger rotation transition
          setFadeState("fade-out");
          setShowAuthor(false);
          
          // Swap quotes after fade out duration (800ms)
          setTimeout(() => {
            rotateToNextQuote();
          }, 800);
        }
      }
    }, 1000);

    // Listeners for smart pause conditions
    const handleSelectionChange = () => {
      const selection = window.getSelection();
      isSelectingText.current = !!(selection && selection.toString().trim().length > 0);
    };

    const handleVisibilityChange = () => {
      isTabHidden.current = document.hidden;
    };

    const handleBlur = () => {
      isWindowBlurred.current = true;
    };

    const handleFocus = () => {
      isWindowBlurred.current = false;
    };

    document.addEventListener("selectionchange", handleSelectionChange);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);

    return () => {
      clearInterval(interval);
      document.removeEventListener("selectionchange", handleSelectionChange);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
    };
  }, [isLoaded]);

  // Container styling for transitions
  const consoleInnerStyle = {
    opacity: fadeState === "fade-out" ? 0 : 1,
    transition: "opacity 800ms cubic-bezier(0.22, 1, 0.36, 1)",
  };

  return (
    <div
      className="sb-console"
      role="presentation"
      onMouseEnter={() => {
        isHovered.current = true;
      }}
      onMouseLeave={() => {
        isHovered.current = false;
      }}
    >
      <div className="sb-console__inner js-console" style={consoleInnerStyle}>
        <span ref={textRef} className="quote-text-content"></span>
        {activeQuote && (
          <span
            className={`quote-author ${showAuthor ? "quote-author--visible" : ""}`}
          >
            — {activeQuote.author || "Unknown"}
          </span>
        )}
      </div>
    </div>
  );
}
