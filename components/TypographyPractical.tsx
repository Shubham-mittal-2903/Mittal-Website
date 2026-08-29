"use client";

import { useRef, useEffect } from "react";

interface TypographyPracticalProps {
  text: string;
  className?: string;
  fontSize?: string;
}

export default function TypographyPractical({ text, className = "", fontSize = "clamp(36px, 5.5vw, 68px)" }: TypographyPracticalProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const letters = container.querySelectorAll<HTMLSpanElement>(".tp-letter");

    const onMove = (e: MouseEvent) => {
      letters.forEach((letter) => {
        const rect = letter.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = e.clientX - cx;
        const dy = e.clientY - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxDist = 300;
        const t = Math.max(0, 1 - dist / maxDist);

        const moveX = dx * t * 0.08;
        const moveY = dy * t * 0.08;
        const scale = 1 + t * 0.15;
        const rotate = (dx * t * 0.02);

        letter.style.transform = `translate(${moveX}px, ${moveY}px) scale(${scale}) rotate(${rotate}deg)`;
        letter.style.opacity = String(0.4 + t * 0.6);
      });
    };

    const onLeave = () => {
      letters.forEach((l) => {
        l.style.transform = "translate(0,0) scale(1) rotate(0deg)";
        l.style.opacity = "0.4";
      });
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseleave", onLeave);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  const words = text.split(" ");

  return (
    <div ref={containerRef} className={className} style={{
      fontSize, lineHeight: 1.08, letterSpacing: "-0.035em",
      fontFamily: "var(--font-v6-display), Georgia, serif",
    }}>
      {words.map((word, wi) => (
        <span key={wi} style={{ display: "inline-block", whiteSpace: "nowrap" }}>
          {word.split("").map((char, ci) => (
            <span
              key={ci}
              className="tp-letter"
              style={{
                display: "inline-block",
                transition: "transform 0.25s cubic-bezier(0.22,1,0.36,1), opacity 0.25s",
                opacity: 0.4,
                willChange: "transform",
              }}
            >
              {char}
            </span>
          ))}
          {wi < words.length - 1 && <span>&nbsp;</span>}
        </span>
      ))}
    </div>
  );
}
