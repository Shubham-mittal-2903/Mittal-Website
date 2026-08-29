"use client";

import { useRef, useEffect, useCallback } from "react";

interface TextPressureProps {
  text: string;
  className?: string;
  fontFamily?: string;
  minWeight?: number;
  maxWeight?: number;
  minWidth?: number;
  maxWidth?: number;
  radius?: number;
}

export default function TextPressure({
  text,
  className = "",
  fontFamily = "var(--font-v6-display), Georgia, serif",
  minWeight = 100,
  maxWeight = 900,
  minWidth = 75,
  maxWidth = 125,
  radius = 200,
}: TextPressureProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const spansRef = useRef<HTMLSpanElement[]>([]);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const rafRef = useRef<number>(0);

  const updateStyles = useCallback(() => {
    const spans = spansRef.current;
    const mx = mouseRef.current.x;
    const my = mouseRef.current.y;

    for (const span of spans) {
      const rect = span.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dist = Math.sqrt((mx - cx) ** 2 + (my - cy) ** 2);
      const t = Math.max(0, 1 - dist / radius);

      const weight = minWeight + t * (maxWeight - minWeight);
      const width = minWidth + t * (maxWidth - minWidth);

      span.style.fontWeight = String(Math.round(weight));
      span.style.fontStretch = `${Math.round(width)}%`;
    }

    rafRef.current = requestAnimationFrame(updateStyles);
  }, [minWeight, maxWeight, minWidth, maxWidth, radius]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    const onLeave = () => {
      mouseRef.current = { x: -9999, y: -9999 };
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseleave", onLeave);
    rafRef.current = requestAnimationFrame(updateStyles);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
      cancelAnimationFrame(rafRef.current);
    };
  }, [updateStyles]);

  return (
    <div ref={containerRef} className={className} style={{ fontFamily, display: "inline" }}>
      {text.split("").map((char, i) => (
        <span
          key={i}
          ref={(el) => { if (el) spansRef.current[i] = el; }}
          style={{
            fontWeight: minWeight,
            fontStretch: `${minWidth}%`,
            transition: "font-weight 0.1s, font-stretch 0.1s",
            display: char === " " ? "inline" : "inline-block",
          }}
        >
          {char === " " ? " " : char}
        </span>
      ))}
    </div>
  );
}
