"use client";

import { Check } from "lucide-react";
import { SERVICES } from "@/lib/data";
import SectionHeading from "./SectionHeading";
import Reveal from "./Reveal";
import DecryptedText from "./DecryptedText";

export default function Services() {
  return (
    <section id="services" className="py-24">
      <div className="container-px">
        <SectionHeading
          eyebrow="What We Build"
          title={
            <DecryptedText text="What We Build, Built To Convert" speed={35} />
          }
          subtitle="Everything your business needs to win online — designed to convert visitors into paying customers."
        />

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((service, i) => (
            <Reveal key={service.title} delay={(i % 3) * 0.08}>
              <div className="card-glow group h-full">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-soft text-white transition-transform duration-500 group-hover:scale-110">
                  <service.icon size={22} className="text-electric" />
                </div>
                <h3 className="mt-5 font-display text-xl font-semibold">{service.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/60">{service.description}</p>
                <ul className="mt-5 grid grid-cols-2 gap-2">
                  {service.features.map((f) => (
                    <li key={f} className="flex items-center gap-1.5 text-xs text-white/55">
                      <Check size={13} className="text-violet" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
