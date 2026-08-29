"use client";

import { useRef, useEffect, useCallback } from "react";

interface MagnetLinesProps {
  rows?: number;
  columns?: number;
  containerClassName?: string;
  lineColor?: string;
  radius?: number;
}

export default function MagnetLines({
  rows = 12,
  columns = 24,
  containerClassName = "",
  lineColor = "rgba(196,169,125,0.5)",
  radius = 150,
}: MagnetLinesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const rafRef = useRef(0);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width = canvas.offsetWidth * devicePixelRatio;
    const h = canvas.height = canvas.offsetHeight * devicePixelRatio;
    ctx.scale(devicePixelRatio, devicePixelRatio);
    ctx.clearRect(0, 0, w, h);

    const cw = canvas.offsetWidth;
    const ch = canvas.offsetHeight;
    const gapX = cw / (columns + 1);
    const gapY = ch / (rows + 1);
    const lineLen = Math.min(gapX, gapY) * 0.6;
    const rect = canvas.getBoundingClientRect();
    const mx = mouseRef.current.x - rect.left;
    const my = mouseRef.current.y - rect.top;

    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 1.5;
    ctx.lineCap = "round";

    for (let r = 1; r <= rows; r++) {
      for (let c = 1; c <= columns; c++) {
        const x = c * gapX;
        const y = r * gapY;
        const dx = mx - x;
        const dy = my - y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const angle = dist < radius ? Math.atan2(dy, dx) : Math.PI / 2;
        const t = Math.max(0, 1 - dist / radius);

        ctx.globalAlpha = 0.25 + t * 0.75;
        ctx.beginPath();
        ctx.moveTo(x - Math.cos(angle) * lineLen / 2, y - Math.sin(angle) * lineLen / 2);
        ctx.lineTo(x + Math.cos(angle) * lineLen / 2, y + Math.sin(angle) * lineLen / 2);
        ctx.stroke();
      }
    }

    rafRef.current = requestAnimationFrame(draw);
  }, [rows, columns, lineColor, radius]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => { mouseRef.current = { x: e.clientX, y: e.clientY }; };
    window.addEventListener("mousemove", onMove);
    rafRef.current = requestAnimationFrame(draw);
    return () => { window.removeEventListener("mousemove", onMove); cancelAnimationFrame(rafRef.current); };
  }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      className={containerClassName}
      style={{ width: "100%", height: "100%", position: "absolute", inset: 0, pointerEvents: "none" }}
    />
  );
}
