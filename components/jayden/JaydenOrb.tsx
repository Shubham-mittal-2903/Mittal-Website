"use client";

import { useEffect, useRef } from "react";

/**
 * Decorative centerpiece for the /jayden showcase — the same visualizer rendering logic used in
 * jayden-voice's console and jayden-app's /assistant page (one shared visual identity across
 * every real Jayden surface), ported here idle-only. Deliberately NOT wired to a live chat
 * backend: this is a public marketing page, and a real chat endpoint here would mean exposing an
 * API key to unauthenticated internet traffic — the actual product lives behind auth in MITTAL
 * OS, jayden-voice (local), and jayden-app (local). This orb is honest about being a visual, not
 * a working demo.
 */
const HUE = 265; // same accent family as jayden-app's console — near this site's own --accent (#6388ff)

function accent(l: number, c: number, a?: number) {
  return a === undefined ? `oklch(${l} ${c} ${HUE})` : `oklch(${l} ${c} ${HUE} / ${a})`;
}

function heartbeatPulse(t: number) {
  const x = t % 1;
  const bump = (c: number, w: number) => Math.exp(-((x - c) ** 2) / (2 * w * w));
  return bump(0.05, 0.028) * 1 + bump(0.16, 0.032) * 0.55;
}

export default function JaydenOrb({ size = 220 }: { size?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const phaseRef = useRef(0);
  const levelRef = useRef(0);
  const rafRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const scale = size / 190; // original design sized at 190px — scale everything proportionally

    const draw = () => {
      phaseRef.current += 0.02;
      const phase = phaseRef.current;
      const target = 0.18 + Math.sin(phase) * 0.06; // idle breathing only
      levelRef.current += (target - levelRef.current) * 0.25;
      const level = levelRef.current;
      const hb = heartbeatPulse(phase * 0.22);

      const w = canvas.width, h = canvas.height, cx = w / 2, cy = h / 2;
      ctx.clearRect(0, 0, w, h);

      const glowR = (70 + level * 40 + hb * 8) * scale;
      const grad = ctx.createRadialGradient(cx, cy, 10 * scale, cx, cy, glowR);
      grad.addColorStop(0, accent(0.6, 0.2, 0.35));
      grad.addColorStop(1, accent(0.6, 0.2, 0));
      ctx.fillStyle = grad;
      ctx.beginPath(); ctx.arc(cx, cy, glowR, 0, Math.PI * 2); ctx.fill();

      const bars = 40, baseR = 58 * scale;
      const spin = phase * 0.15;
      for (let i = 0; i < bars; i++) {
        const a = (i / bars) * Math.PI * 2 + spin;
        const wob = Math.sin(phase * 2 + i * 0.5) * 0.5 + 0.5;
        const len = (8 + level * 34 * (0.5 + wob * 0.5)) * scale;
        const x1 = cx + Math.cos(a) * baseR, y1 = cy + Math.sin(a) * baseR;
        const x2 = cx + Math.cos(a) * (baseR + len), y2 = cy + Math.sin(a) * (baseR + len);
        ctx.strokeStyle = `oklch(${0.55 + wob * 0.15} 0.19 ${HUE} / ${0.35 + level * 0.5})`;
        ctx.lineWidth = 2.4 * scale;
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
      }

      ctx.beginPath(); ctx.arc(cx, cy, 42 * scale, 0, Math.PI * 2);
      ctx.strokeStyle = `oklch(0.4 0.05 ${HUE} / 0.5)`; ctx.lineWidth = scale; ctx.stroke();

      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2;
        const r1 = 96 * scale, r2 = (i % 3 === 0 ? 104 : 100) * scale;
        ctx.strokeStyle = `oklch(0.5 0.05 ${HUE} / 0.4)`;
        ctx.lineWidth = (i % 3 === 0 ? 1.6 : 1) * scale;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1);
        ctx.lineTo(cx + Math.cos(a) * r2, cy + Math.sin(a) * r2);
        ctx.stroke();
      }

      const orbitA = phase * 0.6, orbitR = 104 * scale;
      const ox = cx + Math.cos(orbitA) * orbitR, oy = cy + Math.sin(orbitA) * orbitR;
      ctx.fillStyle = `oklch(0.75 0.2 ${HUE})`;
      ctx.beginPath(); ctx.arc(ox, oy, 2.6 * scale, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = accent(0.75, 0.2, 0.3);
      ctx.beginPath(); ctx.arc(ox, oy, 5 * scale, 0, Math.PI * 2); ctx.fill();

      const coreR = (10 + level * 10 + hb * 6) * scale;
      const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR);
      coreGrad.addColorStop(0, `oklch(0.78 0.2 ${HUE})`);
      coreGrad.addColorStop(1, accent(0.5, 0.2, 0.2));
      ctx.fillStyle = coreGrad;
      ctx.beginPath(); ctx.arc(cx, cy, coreR, 0, Math.PI * 2); ctx.fill();

      rafRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(rafRef.current);
  }, [size]);

  return <canvas ref={canvasRef} width={size} height={size} style={{ width: size, height: size }} />;
}
