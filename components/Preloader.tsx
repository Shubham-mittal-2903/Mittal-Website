"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";

const EASE = [0.65, 0, 0.35, 1] as const;

type Swatch = {
  color: string;
  label: string;
  delay: number;
};

// Panel wipe sequence — our own greyscale/silver brand palette, not a borrowed one.
const SWATCHES: Swatch[] = [
  { color: "bg-charcoal", label: "Base — Charcoal", delay: 0 },
  { color: "bg-graphite", label: "Structure — Graphite", delay: 0.32 },
  { color: "bg-silver", label: "Signal — Silver", delay: 0.64 },
];

const FINAL_DELAY = 0.96;
const DONE_AT = 2500;

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
          exit={{ opacity: 0, transition: { duration: 0.65, ease: "easeInOut" } }}
        >
          {SWATCHES.map((s) => (
            <motion.div
              key={s.label}
              className={`absolute inset-0 flex items-end p-6 sm:p-10 ${s.color}`}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.34, ease: EASE, delay: s.delay }}
              style={{ transformOrigin: "left center" }}
            >
              <motion.span
                className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-white/60"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: s.delay + 0.16 }}
              >
                {s.label}
              </motion.span>
            </motion.div>
          ))}

          {/* Final reveal — black wipe, then the mark builds itself from a spinning
              gradient ring instead of a static logo drop. */}
          <motion.div
            className="absolute inset-0 flex flex-col items-center justify-center bg-ink"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.34, ease: EASE, delay: FINAL_DELAY }}
            style={{ transformOrigin: "left center" }}
          >
            <div className="relative flex h-24 w-24 items-center justify-center sm:h-28 sm:w-28">
              <motion.span
                className="absolute inset-0 rounded-full"
                style={{
                  background:
                    "conic-gradient(from 0deg, transparent 0%, #ffffff 18%, transparent 40%, transparent 60%, #C8C8CE 78%, transparent 100%)",
                  WebkitMask:
                    "radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 3px))",
                  mask: "radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 3px))",
                }}
                initial={{ opacity: 0, rotate: 0, scale: 0.6 }}
                animate={{ opacity: 1, rotate: 360, scale: 1 }}
                transition={{
                  opacity: { duration: 0.25, delay: FINAL_DELAY + 0.15 },
                  scale: { duration: 0.4, ease: EASE, delay: FINAL_DELAY + 0.15 },
                  rotate: { duration: 1.6, ease: "linear", delay: FINAL_DELAY + 0.15, repeat: Infinity },
                }}
              />
              <motion.div
                className="relative h-16 w-16 overflow-hidden rounded-full bg-ink sm:h-[4.6rem] sm:w-[4.6rem]"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1], delay: FINAL_DELAY + 0.4 }}
              >
                <Image
                  src="/logo.png"
                  alt="MITTAL.WEBSITE"
                  width={112}
                  height={112}
                  priority
                  className="h-full w-full object-cover"
                />
              </motion.div>
            </div>

            <motion.div
              className="mt-5 flex items-center gap-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: EASE, delay: FINAL_DELAY + 0.7 }}
            >
              <span className="font-display text-xl tracking-wide text-white">
                MITTAL<span className="text-silver">.WEBSITE</span>
              </span>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
