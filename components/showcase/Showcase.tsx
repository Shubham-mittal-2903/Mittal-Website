"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, Eye, Sparkles } from "lucide-react";
import { CATEGORIES, INDUSTRY_FILTERS, type IndustryGroup } from "@/lib/showcase";
import SectionHeading from "@/components/SectionHeading";
import Reveal from "@/components/Reveal";
import InfiniteMenu from "@/components/InfiniteMenu";
import DemoFrame from "./DemoFrame";

export default function Showcase() {
  const [filter, setFilter] = useState<"All" | IndustryGroup>("All");

  const filtered = useMemo(() => {
    if (filter === "All") return CATEGORIES;
    return CATEGORIES.filter((c) => c.industries.includes(filter));
  }, [filter]);

  return (
    <section id="solutions" className="py-24">
      <div className="container-px">
        <SectionHeading
          eyebrow="Website Solutions"
          title={
            <>
              A Website For <span className="gradient-text">Every Business</span>
            </>
          }
          subtitle="Explore the kinds of websites we build. Pick the closest one to your business and we'll customise it end-to-end for you."
        />

        {/* Infinite Menu — scrolling categories */}
        <Reveal delay={0.08}>
          <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden">
            <InfiniteMenu items={CATEGORIES.map(c => ({ label: c.title, href: `/website-gallery?category=${c.slug}` }))} />
          </div>
        </Reveal>

        {/* Filter pills */}
        <Reveal delay={0.1}>
          <div className="mx-auto mt-10 flex max-w-4xl flex-wrap items-center justify-center gap-2">
            {INDUSTRY_FILTERS.map((f) => {
              const active = filter === f;
              return (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`rounded-full border px-4 py-1.5 text-xs font-medium transition-all ${
                    active
                      ? "border-white/40 bg-white text-black shadow-lg"
                      : "border-white/10 bg-white/[0.03] text-white/65 hover:border-white/30 hover:text-white"
                  }`}
                >
                  {f}
                </button>
              );
            })}
          </div>
        </Reveal>

        {/* Cards */}
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((cat, i) => (
            <Reveal key={cat.slug} delay={(i % 3) * 0.06}>
              <motion.article
                layout
                className="group flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025] transition-colors duration-500 hover:border-white/25"
              >
                <Link
                  href={`/website-gallery?category=${cat.slug}`}
                  className="block overflow-hidden"
                >
                  <div className="transition-transform duration-700 group-hover:scale-[1.03]">
                    <DemoFrame
                      brand={cat.brand}
                      category={cat.title}
                      gradient={cat.gradient}
                      accent={cat.accent}
                      variant={i % 5}
                    />
                  </div>
                </Link>

                <div className="flex flex-1 flex-col p-5">
                  <h3 className="font-display text-lg font-semibold text-white">
                    {cat.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-white/55">
                    {cat.description}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {cat.features.slice(0, 3).map((f) => (
                      <span
                        key={f}
                        className="rounded-full border border-white/10 bg-white/[0.03] px-2 py-0.5 text-[10px] text-white/50"
                      >
                        {f}
                      </span>
                    ))}
                  </div>

                  <div className="mt-5 flex items-center gap-3 pt-0">
                    <Link
                      href={`/website-gallery?category=${cat.slug}`}
                      className="inline-flex items-center gap-1 text-sm font-medium text-white/85 transition-colors hover:text-white"
                    >
                      <Eye size={14} />
                      View Demo
                    </Link>
                    <span className="h-3 w-px bg-white/10" />
                    <Link
                      href="/#contact"
                      className="inline-flex items-center gap-1 text-sm font-medium text-white/55 transition-colors hover:text-white"
                    >
                      Get Similar
                      <ArrowUpRight size={14} />
                    </Link>
                  </div>
                </div>
              </motion.article>
            </Reveal>
          ))}
        </div>

        {/* See full gallery CTA */}
        <Reveal delay={0.15}>
          <div className="mt-12 flex flex-col items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.02] px-6 py-8 text-center sm:flex-row sm:justify-between sm:text-left">
            <div className="max-w-xl">
              <h3 className="font-display text-xl font-semibold text-white">
                Want to see more? <span className="gradient-text">100+ demo websites.</span>
              </h3>
              <p className="mt-1 text-sm text-white/55">
                Explore the full library — search by category, sort by newest or most popular.
              </p>
            </div>
            <Link href="/website-gallery" className="btn-primary">
              <Sparkles size={16} />
              Explore Full Gallery
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
