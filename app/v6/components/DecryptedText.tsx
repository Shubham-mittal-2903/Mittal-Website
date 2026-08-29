"use client";

import { useEffect, useRef, useState } from "react";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&*";

interface DecryptedTextProps {
  text: string;
  className?: string;
  speed?: number;
  triggerOnView?: boolean;
}

export default function DecryptedText({ text, className = "", speed = 40, triggerOnView = true }: DecryptedTextProps) {
  const [display, setDisplay] = useState(text);
  const [started, setStarted] = useState(!triggerOnView);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setDisplay(text.replace(/[^ ]/g, () => CHARS[Math.floor(Math.random() * CHARS.length)]));
  }, [text]);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!triggerOnView) return;
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setStarted(true); obs.disconnect(); } }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [triggerOnView]);

  useEffect(() => {
    if (!started || !mounted) return;
    let revealed = 0;
    const iv = setInterval(() => {
      revealed++;
      if (revealed > text.length) { clearInterval(iv); setDisplay(text); return; }
      setDisplay(
        text.slice(0, revealed) +
        text.slice(revealed).replace(/[^ ]/g, () => CHARS[Math.floor(Math.random() * CHARS.length)])
      );
    }, speed);
    return () => clearInterval(iv);
  }, [started, text, speed]);

  return <span ref={ref} className={className} style={{ fontFamily: "inherit" }}>{display}</span>;
}
