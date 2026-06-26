import { motion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

const variants: Variants = {
  hidden: { y: "110%" },
  show: (i: number = 0) => ({
    y: "0%",
    transition: { duration: 0.9, ease: [0.7, 0, 0.2, 1], delay: i * 0.06 },
  }),
};

interface RevealProps {
  children: ReactNode;
  className?: string;
  as?: "span" | "div";
  delay?: number;
}

export function Reveal({ children, className = "", delay = 0 }: RevealProps) {
  return (
    <span className={`inline-block overflow-hidden align-bottom ${className}`}>
      <motion.span
        className="inline-block will-change-transform"
        custom={delay}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-10%" }}
        variants={variants}
      >
        {children}
      </motion.span>
    </span>
  );
}

export function RevealWords({ text, className = "" }: { text: string; className?: string }) {
  return (
    <span className={className}>
      {text.split(" ").map((w, i) => (
        <span key={i} className="inline-block">
          <Reveal delay={i}>{w}</Reveal>
          {i < text.split(" ").length - 1 && "\u00A0"}
        </span>
      ))}
    </span>
  );
}
