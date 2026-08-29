"use client";

import { ArrowUpRight, ExternalLink } from "lucide-react";
import { PROJECTS } from "@/lib/data";
import SectionHeading from "./SectionHeading";
import Reveal from "./Reveal";
import Tilt from "./Tilt";

export default function Projects() {
  return (
    <section id="projects" className="py-24">
      <div className="container-px">
        <SectionHeading
          eyebrow="Selected Work"
          title={
            <>
              Projects That <span className="gradient-text">Speak For Themselves</span>
            </>
          }
          subtitle="A handpicked look at what we've designed and built — from client sites to our own products."
        />

        <div className="mx-auto mt-14 grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {PROJECTS.map((project, i) => (
            <Reveal key={project.name} delay={(i % 3) * 0.08} className="h-full">
              <Tilt className="h-full">
              <article className="group relative h-full overflow-hidden rounded-2xl glass transition-colors duration-500 hover:border-gold/40">
                {/* Thumbnail */}
                <div
                  className={`relative flex h-44 items-center justify-center overflow-hidden bg-gradient-to-br ${project.gradient}`}
                >
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.18),transparent_60%)]" />
                  <span className="font-display text-5xl font-bold text-white/90 transition-transform duration-500 group-hover:scale-110">
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

                  <div className="mt-6 flex items-center gap-4 text-sm">
                    {project.liveUrl && (
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 font-medium text-electric transition-colors hover:text-white"
                      >
                        Live Preview <ExternalLink size={14} />
                      </a>
                    )}
                    <a
                      href="/#contact"
                      className="inline-flex items-center gap-1 font-medium text-white/60 transition-colors hover:text-white"
                    >
                      Enquire <ArrowUpRight size={14} />
                    </a>
                  </div>
                </div>
              </article>
              </Tilt>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
