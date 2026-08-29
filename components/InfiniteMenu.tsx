"use client";

import { useRef, useEffect, useCallback, useState } from "react";

interface InfiniteMenuProps {
  items: { label: string; href: string }[];
  className?: string;
}

export default function InfiniteMenu({ items, className = "" }: InfiniteMenuProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const posRef = useRef(0);
  const rafRef = useRef(0);
  const speedRef = useRef(0.5);

  const tripled = [...items, ...items, ...items];

  const animate = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const speed = isHovered ? 0.15 : 0.5;
    speedRef.current += (speed - speedRef.current) * 0.05;
    posRef.current -= speedRef.current;

    const totalW = track.scrollWidth / 3;
    if (Math.abs(posRef.current) >= totalW) posRef.current += totalW;

    track.style.transform = `translateX(${posRef.current}px)`;
    rafRef.current = requestAnimationFrame(animate);
  }, [isHovered]);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [animate]);

  return (
    <div
      className={className}
      style={{ overflow: "hidden", position: "relative", cursor: "pointer" }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div ref={trackRef} style={{ display: "flex", whiteSpace: "nowrap", willChange: "transform" }}>
        {tripled.map((item, i) => (
          <a
            key={i}
            href={item.href}
            style={{
              display: "inline-flex", alignItems: "center", gap: 24,
              padding: "20px 40px", fontSize: "clamp(24px, 4vw, 48px)",
              fontFamily: "var(--font-display), Georgia, serif",
              fontStyle: "italic", color: "inherit", textDecoration: "none",
              opacity: 0.6, transition: "opacity 0.3s",
              flexShrink: 0,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.6")}
          >
            {item.label}
            <span style={{
              width: 6, height: 6, borderRadius: "50%",
              background: "var(--accent, #C4A97D)", flexShrink: 0,
            }} />
          </a>
        ))}
      </div>
    </div>
  );
}
