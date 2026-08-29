"use client";

import type { MotionValue } from "framer-motion";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import MagneticButton from "./MagneticButton";
import TextReveal from "./TextReveal";
import DecryptedText from "./DecryptedText";
import MagnetLines from "./MagnetLines";
import {
  ArrowRight,
  Sparkles,
  TrendingUp,
  Clock,
  Layers,
  Search,
  CheckCircle2,
  type LucideIcon,
} from "lucide-react";

type FloatCard = { icon: LucideIcon; label: string; className: string; depth: number };

const floatingCards: FloatCard[] = [
  { icon: TrendingUp, label: "+120% Leads", className: "left-[-9%] top-[12%]", depth: 50 },
  { icon: Clock, label: "10 Days Delivery", className: "right-[-7%] top-[6%]", depth: 70 },
  { icon: Layers, label: "Modern UI", className: "left-[-5%] bottom-[14%]", depth: 60 },
  { icon: Search, label: "SEO Ready", className: "right-[-9%] bottom-[8%]", depth: 80 },
];

function FloatingCard({
  card,
  sx,
  sy,
}: {
  card: FloatCard;
  sx: MotionValue<number>;
  sy: MotionValue<number>;
}) {
  const x = useTransform(sx, [-0.5, 0.5], [card.depth * 0.6, -card.depth * 0.6]);
  const y = useTransform(sy, [-0.5, 0.5], [card.depth * 0.4, -card.depth * 0.4]);

  return (
    <motion.div
      className={`absolute ${card.className} hidden sm:block`}
      style={{ translateZ: card.depth, x, y }}
    >
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="glass-strong flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-xs font-medium text-white shadow-lg shadow-black/40"
      >
        <card.icon size={15} className="text-white/80" />
        {card.label}
      </motion.div>
    </motion.div>
  );
}

export default function Hero() {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 120, damping: 18, mass: 0.4 });
  const sy = useSpring(my, { stiffness: 120, damping: 18, mass: 0.4 });

  const rotateY = useTransform(sx, [-0.5, 0.5], [12, -12]);
  const rotateX = useTransform(sy, [-0.5, 0.5], [-10, 10]);

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - rect.left) / rect.width - 0.5);
    my.set((e.clientY - rect.top) / rect.height - 0.5);
  };
  const reset = () => {
    mx.set(0);
    my.set(0);
  };

  return (
    <section
      id="home"
      className="relative flex min-h-screen items-center overflow-hidden pt-36 pb-16"
    >
      {/* MagnetLines background */}
      <MagnetLines rows={10} columns={20} lineColor="rgba(255,255,255,0.08)" radius={200} />

      {/* Particles */}
      <div className="pointer-events-none absolute inset-0">
        {Array.from({ length: 22 }).map((_, i) => (
          <motion.span
            key={i}
            className="absolute h-1 w-1 rounded-full bg-white/30"
            style={{ left: `${(i * 47) % 100}%`, top: `${(i * 31) % 100}%` }}
            animate={{ y: [0, -18, 0], opacity: [0.1, 0.5, 0.1] }}
            transition={{
              duration: 4 + (i % 5),
              repeat: Infinity,
              delay: i * 0.15,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <div className="container-px relative grid items-center gap-12 lg:grid-cols-2">
        {/* Left copy */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="eyebrow">
              <Sparkles size={14} className="text-white" />
              <DecryptedText text="Web Development Agency · Delhi NCR" speed={30} triggerOnView={false} />
            </span>
          </motion.div>

          <h1 className="mt-6 font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl lg:text-[4rem]">
            <TextReveal text="Websites That" delay={0.15} />
            <br className="hidden sm:block" />
            <TextReveal text="Grow Your" delay={0.35} />{" "}
            <span className="inline-block overflow-hidden align-bottom">
              <motion.span
                className="gradient-text animate-gradient-pan inline-block"
                initial={{ y: "110%", opacity: 0 }}
                animate={{
                  y: 0,
                  opacity: 1,
                  transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.55 },
                }}
              >
                Business
              </motion.span>
            </span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-6 max-w-xl text-base leading-relaxed text-white/55 sm:text-lg"
          >
            We build websites, e-commerce stores and custom web apps that help businesses attract
            more customers, build trust and turn visitors into enquiries.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-9 flex flex-wrap items-center gap-4"
          >
            <MagneticButton href="#contact" className="btn-primary group">
              Get Free Consultation
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </MagneticButton>
            <MagneticButton href="#projects" className="btn-ghost" strength={8}>
              View Our Work
            </MagneticButton>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="mt-5 flex items-center gap-2 text-sm text-white/50"
          >
            <CheckCircle2 size={16} className="text-white/80" />
            Register your project — our team coordinates with you{" "}
            <span className="font-semibold text-white/80">within 24 hours.</span>
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.55 }}
            className="mt-9 flex items-center gap-6 text-sm text-white/45"
          >
            <div>
              <span className="font-display text-xl font-bold text-white">10-Day</span> Delivery
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div>
              <span className="font-display text-xl font-bold text-white">100%</span> Satisfaction
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div>
              From <span className="font-display text-xl font-bold gradient-text">₹5,555</span>
            </div>
          </motion.div>
        </div>

        {/* Right: interactive mockup */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.3, ease: "easeOut" }}
          onMouseMove={handleMove}
          onMouseLeave={reset}
          className="relative mx-auto flex aspect-square w-full max-w-md items-center justify-center [perspective:1400px]"
        >
          {/* Rotating glow ring */}
          <motion.div
            className="absolute h-[112%] w-[112%] rounded-full opacity-60 blur-[1px] [mask:radial-gradient(closest-side,transparent_70%,black_72%)]"
            style={{
              background:
                "conic-gradient(from 0deg, transparent, rgba(255,255,255,0.32), transparent 38%, transparent 62%, rgba(255,255,255,0.16), transparent)",
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
          />
          <div className="absolute h-[74%] w-[74%] rounded-full bg-white/[0.05] blur-3xl" />

          {/* 3D-tilt mockup */}
          <motion.div
            style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
            className="relative w-[88%]"
          >
            <div className="glass-strong relative rounded-2xl p-3 shadow-2xl shadow-black/60">
              <div className="flex items-center gap-1.5 px-2 py-2">
                <span className="h-3 w-3 rounded-full bg-white/20" />
                <span className="h-3 w-3 rounded-full bg-white/15" />
                <span className="h-3 w-3 rounded-full bg-white/10" />
                <div className="ml-3 h-5 flex-1 rounded-md bg-white/5" />
              </div>
              <div className="rounded-xl bg-gradient-to-b from-white/[0.06] to-transparent p-4">
                <div className="h-28 rounded-lg bg-accent-gradient bg-[length:200%_auto] animate-gradient-pan opacity-90" />
                <div className="mt-4 grid grid-cols-3 gap-3">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="h-16 rounded-lg bg-white/[0.06]" />
                  ))}
                </div>
                <div className="mt-4 space-y-2">
                  <div className="h-3 w-3/4 rounded bg-white/10" />
                  <div className="h-3 w-1/2 rounded bg-white/10" />
                </div>
                <div className="mt-4 flex gap-2">
                  <div className="h-8 w-24 rounded-full bg-white/90" />
                  <div className="h-8 w-20 rounded-full bg-white/10" />
                </div>
              </div>
            </div>

            {floatingCards.map((card) => (
              <FloatingCard key={card.label} card={card} sx={sx} sy={sy} />
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
