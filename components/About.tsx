"use client";

import { CheckCircle2 } from "lucide-react";
import { STATS } from "@/lib/data";
import Reveal from "./Reveal";
import DecryptedText from "./DecryptedText";

const benefits = [
  "Build trust",
  "Generate leads",
  "Improve credibility",
  "Increase conversions",
  "Stand out from competitors",
];

export default function About() {
  return (
    <section id="about" className="py-24">
      <div className="container-px grid items-center gap-14 lg:grid-cols-2">
        <div>
          <Reveal>
            <span className="eyebrow">Why Us</span>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="mt-5 font-display text-3xl font-bold tracking-tight sm:text-4xl">
              <DecryptedText text="Why MITTAL.WEBSITE?" speed={40} />
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-5 text-lg leading-relaxed text-white/65">
              We don&apos;t just create websites. We create online experiences that help
              businesses grow — designed to look credible and built to convert.
            </p>
          </Reveal>

          <ul className="mt-8 space-y-3">
            {benefits.map((b, i) => (
              <Reveal key={b} delay={0.15 + i * 0.05}>
                <li className="flex items-center gap-3 text-white/80">
                  <CheckCircle2 size={20} className="text-electric" />
                  {b}
                </li>
              </Reveal>
            ))}
          </ul>
        </div>

        <div className="grid grid-cols-2 gap-5">
          {STATS.map((stat, i) => (
            <Reveal key={stat.label} delay={i * 0.08}>
              <div className="card-glow h-full">
                <div className="font-display text-4xl font-bold gradient-text">{stat.value}</div>
                <div className="mt-2 text-sm text-white/60">{stat.label}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
