"use client";

import { motion } from "framer-motion";
import {
  Zap,
  ShieldCheck,
  HeartHandshake,
  MessageCircle,
  Wand2,
  TrendingUp,
} from "lucide-react";
import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";
import TextPressure from "./TextPressure";

export default function Bento() {
  return (
    <section id="why" className="py-24">
      <div className="container-px">
        <SectionHeading
          eyebrow="Why Mittal.website"
          title={
            <>
              The Boring Stuff <span className="gradient-text">Done Right</span>
            </>
          }
          subtitle="Honest pricing, real ownership, fast delivery — and a website that's actually built to convert. The kind of basics most agencies skip."
        />

        <div className="mt-14 grid auto-rows-[minmax(180px,_auto)] grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Hero card — 10-day delivery (spans 2x2) */}
          <Reveal className="sm:col-span-2 lg:row-span-2">
            <BentoCard accent className="h-full">
              <div className="relative z-10 flex h-full flex-col justify-between gap-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/15 bg-white/[0.06]">
                  <Zap size={22} className="text-white" />
                </div>
                <div>
                  <div className="font-display text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
                    <TextPressure text="Live in 10 days." minWeight={300} maxWeight={900} radius={200} />
                  </div>
                  <p className="mt-3 max-w-md text-sm leading-relaxed text-white/55">
                    Most projects launch within 10 days from kickoff. Simple sites
                    go faster, custom apps take a little more — but you always know
                    the date before we start.
                  </p>
                </div>
              </div>
              <FloatingOrb />
            </BentoCard>
          </Reveal>

          {/* You own it */}
          <Reveal delay={0.05}>
            <BentoCard>
              <div className="flex h-full flex-col justify-between">
                <ShieldCheck size={24} className="text-white/85" />
                <div>
                  <div className="font-display text-xl font-semibold">
                    You own it. <span className="gradient-text">100%.</span>
                  </div>
                  <p className="mt-1.5 text-xs leading-relaxed text-white/55">
                    Code, hosting, accounts — all yours after final payment. No
                    lock-in, no monthly trap.
                  </p>
                </div>
              </div>
            </BentoCard>
          </Reveal>

          {/* Founder-led */}
          <Reveal delay={0.1}>
            <BentoCard>
              <div className="flex h-full flex-col justify-between">
                <HeartHandshake size={24} className="text-white/85" />
                <div>
                  <div className="font-display text-xl font-semibold">
                    Founder-led
                  </div>
                  <p className="mt-1.5 text-xs leading-relaxed text-white/55">
                    You talk directly to the studio. No account manager merry-go-round.
                  </p>
                </div>
              </div>
            </BentoCard>
          </Reveal>

          {/* WhatsApp-first */}
          <Reveal delay={0.15}>
            <BentoCard>
              <div className="flex h-full flex-col justify-between">
                <MessageCircle size={24} className="text-white/85" />
                <div>
                  <div className="font-display text-xl font-semibold">
                    WhatsApp-first
                  </div>
                  <p className="mt-1.5 text-xs leading-relaxed text-white/55">
                    Updates, drafts, feedback — all on the chat your clients use anyway.
                  </p>
                </div>
              </div>
            </BentoCard>
          </Reveal>

          {/* Built to convert */}
          <Reveal delay={0.2}>
            <BentoCard>
              <div className="flex h-full flex-col justify-between">
                <TrendingUp size={24} className="text-white/85" />
                <div>
                  <div className="font-display text-xl font-semibold">
                    Built to convert
                  </div>
                  <p className="mt-1.5 text-xs leading-relaxed text-white/55">
                    Every site is designed around one job: turning visitors into
                    paying customers.
                  </p>
                </div>
              </div>
            </BentoCard>
          </Reveal>

          {/* Custom design (spans 2) */}
          <Reveal delay={0.25} className="sm:col-span-2">
            <BentoCard>
              <div className="flex h-full items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="font-display text-xl font-semibold">
                    Pixel-perfect, custom — <span className="gradient-text">no templates.</span>
                  </div>
                  <p className="mt-1.5 text-xs leading-relaxed text-white/55">
                    Every site is hand-designed from scratch. Two clients in the
                    same industry never get the same look.
                  </p>
                </div>
                <Wand2 size={28} className="shrink-0 text-white/70" />
              </div>
            </BentoCard>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function BentoCard({
  children,
  className = "",
  accent = false,
}: {
  children: React.ReactNode;
  className?: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`group relative h-full overflow-hidden rounded-3xl border border-white/10 p-6 transition-all duration-500 hover:border-white/25 ${
        accent
          ? "bg-gradient-to-br from-white/[0.06] via-white/[0.03] to-white/[0.01]"
          : "bg-white/[0.025]"
      } ${className}`}
    >
      {/* spotlight */}
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
        <div className="absolute -inset-20 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.08),transparent_60%)]" />
      </div>
      {children}
    </div>
  );
}

function FloatingOrb() {
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute -right-10 -top-10 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.12),transparent_60%)] blur-2xl"
      animate={{ scale: [1, 1.15, 1], opacity: [0.45, 0.75, 0.45] }}
      transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}
