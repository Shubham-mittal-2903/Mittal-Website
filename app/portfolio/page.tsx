import type { Metadata } from "next";
import Image from "next/image";
import { ArrowUpRight, ExternalLink, BadgeCheck } from "lucide-react";
import { PROJECTS, PERSONAL_PROJECTS, SKILLS } from "@/lib/data";
import Reveal from "@/components/Reveal";
import Tilt from "@/components/Tilt";
import SectionHeading from "@/components/SectionHeading";

export const metadata: Metadata = {
  title: "Shubham Mittal — Founder & Full-Stack Developer",
  description:
    "Shubham Mittal — B.Tech CSE student and founder of MITTAL.WEBSITE. Full-stack developer building websites, e-commerce stores and AI-powered products end to end.",
  alternates: { canonical: "/portfolio" },
};

const STATS = [
  { value: `${PROJECTS.length + PERSONAL_PROJECTS.length}+`, label: "Products Shipped" },
  { value: "Solo", label: "Design → Build → Ship" },
  { value: "B.Tech", label: "CSE Student" },
  { value: "Full-Stack", label: "Frontend, Backend & AI" },
];

export default function PortfolioPage() {
  return (
    <main className="pb-24 pt-40">
      {/* Hero */}
      <section className="container-px">
        <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
          <Reveal>
            <div className="relative h-28 w-28 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.08] to-transparent shadow-lg shadow-black/40">
              <Image
                src="/shubham.png"
                alt="Shubham Mittal"
                fill
                sizes="112px"
                className="object-cover object-top"
                priority
              />
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="mt-6 flex items-center justify-center gap-2">
              <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
                Shubham Mittal
              </h1>
              <BadgeCheck size={26} className="text-white/70" />
            </div>
          </Reveal>

          <Reveal delay={0.14}>
            <p className="mt-3 text-lg text-white/60">
              Founder, MITTAL.WEBSITE — Full-Stack Developer &amp; B.Tech CSE Student
            </p>
          </Reveal>

          <Reveal delay={0.2}>
            <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-white/55">
              I design, build and ship every project myself — from the first line of code to
              the client handoff. Below is the real work: live client sites, e-commerce stores
              and the AI products I&apos;m building on the side.
            </p>
          </Reveal>

          <Reveal delay={0.26}>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <a href="/#contact" className="btn-primary !px-7 !py-3 text-sm">
                Work With Me
              </a>
              <a
                href="https://www.linkedin.com/in/shubham-mittal-45804b3b8/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-6 py-3 text-sm font-medium text-white/80 transition-colors hover:border-white/30 hover:text-white"
              >
                Connect on LinkedIn <ArrowUpRight size={14} />
              </a>
            </div>
          </Reveal>
        </div>

        {/* Stats */}
        <Reveal delay={0.3}>
          <div className="mx-auto mt-16 grid max-w-3xl grid-cols-2 gap-4 sm:grid-cols-4">
            {STATS.map((s) => (
              <div key={s.label} className="rounded-2xl glass px-4 py-5 text-center">
                <div className="font-display text-2xl font-bold text-white">{s.value}</div>
                <div className="mt-1 text-xs text-white/50">{s.label}</div>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* Client Work */}
      <section className="mt-24 py-8">
        <div className="container-px">
          <SectionHeading
            eyebrow="Client Work"
            title={
              <>
                Live Projects I&apos;ve <span className="gradient-text">Designed &amp; Built</span>
              </>
            }
            subtitle="Real client websites and stores, shipped and running in production."
          />

          <div className="mx-auto mt-14 grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {PROJECTS.map((project, i) => (
              <Reveal key={project.name} delay={(i % 3) * 0.08} className="h-full">
                <Tilt className="h-full">
                  <article className="group relative h-full overflow-hidden rounded-2xl glass transition-colors duration-500 hover:border-gold/40">
                    <div
                      className={`relative flex h-40 items-center justify-center overflow-hidden bg-gradient-to-br ${project.gradient}`}
                    >
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.18),transparent_60%)]" />
                      <span className="font-display text-4xl font-bold text-white/90 transition-transform duration-500 group-hover:scale-110">
                        {project.initials}
                      </span>
                      <span className="absolute right-4 top-4 rounded-full bg-black/50 px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-white/85 backdrop-blur">
                        {project.category}
                      </span>
                    </div>
                    <div className="p-6">
                      <h3 className="font-display text-xl font-semibold">{project.name}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-white/55">{project.summary}</p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {project.tech.map((t) => (
                          <span
                            key={t}
                            className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[11px] text-white/55"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                      {project.liveUrl && (
                        <a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-electric transition-colors hover:text-white"
                        >
                          Live Preview <ExternalLink size={14} />
                        </a>
                      )}
                    </div>
                  </article>
                </Tilt>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Personal Builds */}
      <section className="mt-8 py-8">
        <div className="container-px">
          <SectionHeading
            eyebrow="Personal Builds"
            title={
              <>
                Products I&apos;m <span className="gradient-text">Building on the Side</span>
              </>
            }
            subtitle="AI tools and products I build for myself and for other founders — outside of client work."
          />

          <div className="mx-auto mt-14 grid max-w-6xl gap-6 sm:grid-cols-2">
            {PERSONAL_PROJECTS.map((project, i) => (
              <Reveal key={project.name} delay={(i % 2) * 0.08}>
                <div className="glass rounded-2xl p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-display text-lg font-semibold">{project.name}</h3>
                      <p className="text-xs uppercase tracking-wider text-white/45">{project.category}</p>
                    </div>
                    <span className="shrink-0 rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-white/50">
                      {project.status}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-white/55">{project.summary}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {project.tech.map((t) => (
                      <span
                        key={t}
                        className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[11px] text-white/55"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Skills */}
      <section className="mt-8 py-8">
        <div className="container-px">
          <SectionHeading eyebrow="Stack" title="What I Work With" />
          <div className="mx-auto mt-12 grid max-w-4xl gap-6 sm:grid-cols-2">
            {SKILLS.map((group, i) => (
              <Reveal key={group.label} delay={(i % 2) * 0.08}>
                <div className="glass rounded-2xl p-5">
                  <h3 className="text-sm font-semibold text-white/80">{group.label}</h3>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {group.skills.map((s) => (
                      <span
                        key={s}
                        className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[11px] text-white/60"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mt-16 py-8">
        <div className="container-px">
          <Reveal>
            <div className="glass mx-auto max-w-3xl rounded-3xl px-8 py-12 text-center">
              <h2 className="font-display text-2xl font-bold sm:text-3xl">
                Have a project in mind? <span className="gradient-text">Let&apos;s build it.</span>
              </h2>
              <p className="mx-auto mt-3 max-w-md text-sm text-white/55">
                Whether it&apos;s a website, an e-commerce store or a custom AI product — I build it
                myself, end to end.
              </p>
              <a href="/#contact" className="btn-primary mt-7 inline-flex !px-8 !py-3 text-sm">
                Get In Touch
              </a>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
