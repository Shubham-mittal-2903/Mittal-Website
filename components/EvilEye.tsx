"use client";

import { useEffect, useRef } from "react";

interface EvilEyeProps {
  size?: number;
  className?: string;
}

export default function EvilEye({ size = 120, className = "" }: EvilEyeProps) {
  const eyeRef = useRef<HTMLDivElement>(null);
  const pupilRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const eye = eyeRef.current;
      const pupil = pupilRef.current;
      if (!eye || !pupil) return;
      const rect = eye.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const angle = Math.atan2(e.clientY - cy, e.clientX - cx);
      const dist = Math.min(Math.hypot(e.clientX - cx, e.clientY - cy), size * 0.22);
      const maxMove = size * 0.22;
      const move = Math.min(dist, maxMove);
      pupil.style.transform = `translate(${Math.cos(angle) * move}px, ${Math.sin(angle) * move}px)`;
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [size]);

  const s = size;
  return (
    <div ref={eyeRef} className={className} style={{
      width: s, height: s, borderRadius: "50%", position: "relative",
      background: "radial-gradient(circle, #fff 40%, #e8e0d4 100%)",
      boxShadow: "inset 0 0 20px rgba(0,0,0,0.15), 0 4px 30px rgba(0,0,0,0.3)",
      display: "flex", alignItems: "center", justifyContent: "center",
      border: "3px solid rgba(196,169,125,0.4)",
    }}>
      <div ref={pupilRef} style={{
        width: s * 0.45, height: s * 0.45, borderRadius: "50%", position: "relative",
        background: "radial-gradient(circle at 35% 35%, #8B6914 0%, #3a2a08 70%, #1a1000 100%)",
        transition: "transform 0.08s ease-out",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <div style={{
          width: s * 0.2, height: s * 0.2, borderRadius: "50%",
          background: "#000",
          position: "relative",
        }}>
          <div style={{
            position: "absolute", top: "20%", left: "25%",
            width: s * 0.06, height: s * 0.06, borderRadius: "50%",
            background: "rgba(255,255,255,0.8)",
          }} />
        </div>
      </div>
    </div>
  );
}
