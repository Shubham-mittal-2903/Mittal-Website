"use client";

import { ArrowRight, Phone } from "lucide-react";
import { BRAND } from "@/lib/data";
import Reveal from "./Reveal";
import TypographyPractical from "./TypographyPractical";

export default function FinalCTA() {
  return (
    <section className="py-24">
      <div className="container-px">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl glass-strong px-6 py-16 text-center sm:px-12">
            <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-electric/20 blur-3xl" />
            <div className="absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-violet/20 blur-3xl" />

            <div className="relative">
              <div className="mx-auto max-w-3xl">
                <TypographyPractical
                  text="Ready To Build Something Amazing?"
                  fontSize="clamp(28px, 5vw, 48px)"
                  className="font-bold tracking-tight text-white"
                />
              </div>
              <p className="mx-auto mt-5 max-w-xl text-base text-white/65 sm:text-lg">
                Let&apos;s turn your idea into a website that wins you more customers.
              </p>
              <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
                <a href={`tel:${BRAND.phone}`} className="btn-primary group">
                  Book A Call
                  <Phone size={16} />
                </a>
                <a href="#contact" className="btn-gold-outline group">
                  Get Free Consultation
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                </a>
              </div>

              <p className="relative mt-6 text-sm text-white/55">
                Register today &middot; Our team coordinates with you{" "}
                <span className="font-semibold text-white/80">within 24 hours</span> &middot;{" "}
                <a href={`tel:${BRAND.phone}`} className="text-gold hover:text-champagne">
                  {BRAND.phoneDisplay}
                </a>
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
