"use client";

import { useRef, useEffect, useCallback } from "react";

interface LanyardProps {
  text?: string;
  className?: string;
  width?: number;
  height?: number;
}

export default function Lanyard({ text = "MW", className = "", width = 200, height = 280 }: LanyardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1, y: -1, down: false });
  const stateRef = useRef({
    angle: 0, angleV: 0, pivotX: 0, pivotY: 30,
    ropeLen: 140, grabbed: false,
  });

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = devicePixelRatio;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    const s = stateRef.current;
    s.pivotX = width / 2;

    const rect = canvas.getBoundingClientRect();
    const mx = mouseRef.current.x - rect.left;
    const my = mouseRef.current.y - rect.top;

    if (mouseRef.current.down && my > 0 && my < height) {
      const targetAngle = Math.atan2(mx - s.pivotX, my - s.pivotY);
      s.angleV += (targetAngle - s.angle) * 0.02;
    }

    const gravity = 0.001;
    s.angleV += -Math.sin(s.angle) * gravity;
    s.angleV *= 0.985;
    s.angle += s.angleV;

    const endX = s.pivotX + Math.sin(s.angle) * s.ropeLen;
    const endY = s.pivotY + Math.cos(s.angle) * s.ropeLen;

    // Rope
    ctx.beginPath();
    ctx.moveTo(s.pivotX, s.pivotY);
    ctx.lineTo(endX, endY);
    ctx.strokeStyle = "rgba(196,169,125,0.6)";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Clip at pivot
    ctx.beginPath();
    ctx.arc(s.pivotX, s.pivotY, 5, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(196,169,125,0.8)";
    ctx.fill();

    // Badge
    ctx.save();
    ctx.translate(endX, endY);
    ctx.rotate(s.angle);
    const bw = 70, bh = 90, br = 10;

    ctx.beginPath();
    ctx.roundRect(-bw / 2, -10, bw, bh, br);
    ctx.fillStyle = "#1a1a1a";
    ctx.fill();
    ctx.strokeStyle = "rgba(196,169,125,0.4)";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Text on badge
    ctx.fillStyle = "#C4A97D";
    ctx.font = "bold 22px Georgia, serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, 0, bh / 2 - 10);

    // Hole
    ctx.beginPath();
    ctx.arc(0, 2, 4, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(196,169,125,0.3)";
    ctx.fill();

    ctx.restore();

    requestAnimationFrame(draw);
  }, [width, height, text]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => { mouseRef.current.x = e.clientX; mouseRef.current.y = e.clientY; };
    const onDown = () => { mouseRef.current.down = true; };
    const onUp = () => { mouseRef.current.down = false; };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    requestAnimationFrame(draw);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
    };
  }, [draw]);

  return <canvas ref={canvasRef} className={className} style={{ width, height }} />;
}
