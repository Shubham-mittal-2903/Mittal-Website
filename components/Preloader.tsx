"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";

const EASE = [0.65, 0, 0.35, 1] as const;

type Swatch = {
  color: string;
  label: string;
  textClass: string;
  slashClass: string;
  delay: number;
};

const SWATCHES: Swatch[] = [
  { color: "bg-champagne", label: "Paper — Champagne", textClass: "text-ink", slashClass: "bg-ink/70", delay: 0 },
  { color: "bg-electric", label: "Signal — Electric", textClass: "text-ink", slashClass: "bg-ink/70", delay: 0.38 },
  { color: "bg-rosegold", label: "Warmth — Rosegold", textClass: "text-ink", slashClass: "bg-ink/70", delay: 0.76 },
];

const FINAL_DELAY = 1.14;
const DONE_AT = 2650;

export default function Preloader() {
  const [done, setDone] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDone(true), DONE_AT);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          className="fixed inset-0 z-[100] overflow-hidden bg-ink"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.7, ease: "easeInOut" } }}
        >
          {SWATCHES.map((s) => (
            <motion.div
              key={s.label}
              className={`absolute inset-0 flex items-end justify-end p-6 sm:p-10 ${s.color}`}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.38, ease: EASE, delay: s.delay }}
              style={{ transformOrigin: "left center" }}
            >
              <motion.span
                className={`absolute left-[8%] top-1/2 h-[220%] w-10 -translate-y-1/2 rotate-[20deg] rounded-lg opacity-50 sm:w-16 ${s.slashClass}`}
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ duration: 0.32, ease: EASE, delay: s.delay + 0.05 }}
              />
              <motion.span
                className={`relative font-mono text-[0.7rem] uppercase tracking-[0.18em] ${s.textClass}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2, delay: s.delay + 0.18 }}
              >
                {s.label}
              </motion.span>
            </motion.div>
          ))}

          {/* final panel */}
          <motion.div
            className="absolute inset-0 flex flex-col items-center justify-center bg-ink"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.38, ease: EASE, delay: FINAL_DELAY }}
            style={{ transformOrigin: "left center" }}
          >
            <div className="relative h-24 w-24 sm:h-28 sm:w-28">
              <motion.span
                className="absolute left-1/2 top-1/2 h-full w-7 rounded-md bg-accent-gradient sm:w-9"
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ duration: 0.35, ease: EASE, delay: FINAL_DELAY + 0.22 }}
                style={{ transformOrigin: "center", transform: "translate(-50%, -50%) rotate(20deg)" }}
              />
              <motion.span
                className="absolute left-[64%] top-[18%] h-5 w-5 rounded-full bg-electric shadow-[0_0_30px_rgba(201,205,214,0.55)]"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3, ease: EASE, delay: FINAL_DELAY + 0.42 }}
              />
            </div>
            <motion.div
              className="mt-5 flex items-center gap-2.5"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE, delay: FINAL_DELAY + 0.55 }}
            >
              <Image
                src="/logo.png"
                alt="MITTAL.WEBSITE"
                width={36}
                height={36}
                priority
                className="h-9 w-9 rounded-md object-cover"
              />
              <span className="font-display text-xl tracking-wide text-white">
                MITTAL<span className="text-electric">.WEBSITE</span>
              </span>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
