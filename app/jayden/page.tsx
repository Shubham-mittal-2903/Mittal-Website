import type { Metadata } from "next";
import { ArrowUpRight, Brain, Mic, MessageSquare, Workflow, Database, Shield } from "lucide-react";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";
import JaydenOrb from "@/components/jayden/JaydenOrb";

export const metadata: Metadata = {
  title: "JAYDEN — A Personal AI That Lives Everywhere You Work",
  description:
    "JAYDEN is a provider-agnostic AI system built by Shubham Mittal — one shared brain across a business dashboard, a voice assistant, and a desktop app. Multi-model routing, cross-surface memory, and a real agent with real tools.",
  alternates: { canonical: "/jayden" },
};

const SURFACES = [
  {
    icon: MessageSquare,
    name: "MITTAL OS",
    role: "Business dashboard",
    description:
      "Lives inside the CRM Shubham runs his agency on — reads and writes leads, tasks, attendance and finances directly, and can even open pull requests against the app's own codebase.",
  },
  {
    icon: Mic,
    name: "jayden-voice",
    role: "Desktop voice assistant",
    description:
      "A wake-word-driven HUD with four switchable personas, free neural TTS, and a local fine-tuning loop that improves its own model from real conversations over time.",
  },
  {
    icon: Workflow,
    name: "jayden-app",
    role: "Standalone AI engine + agent",
    description:
      "The reference implementation — a ReAct agent with tool-calling, task-aware multi-provider routing, and the console UI shown below, all built from a shared open-source-style core.",
  },
];

const FEATURES = [
  {
    icon: Brain,
    title: "Task-aware model routing",
    description:
      "A coding question and a one-line factual question land on different providers automatically — local Ollama for speed and privacy, Claude or OpenAI when a request actually needs the stronger model.",
  },
  {
    icon: Database,
    title: "One shared memory, three surfaces",
    description:
      "A fact taught to the voice assistant is recallable from the dashboard and vice versa — the same Postgres-backed memory, not three separate assistants that happen to share a name.",
  },
  {
    icon: Shield,
    title: "Tiered tool permissions",
    description:
      "Every tool call carries a trust tier — auto-approved, confirm-before-running, or denied outright — so a research question and a database write are never treated as equally safe.",
  },
];

export default function JaydenShowcasePage() {
  return (
    <main className="pb-24 pt-40">
      {/* Hero */}
      <section className="container-px">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <Reveal>
            <span className="eyebrow">Personal AI System · In Active Development</span>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="mt-8">
              <JaydenOrb size={200} />
            </div>
          </Reveal>

          <Reveal delay={0.14}>
            <h1 className="mt-6 font-display text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              JAYDEN<span className="gradient-text">.</span>
            </h1>
          </Reveal>

          <Reveal delay={0.2}>
            <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-white/60">
              One AI, one memory, three places to talk to it — a business dashboard, a desktop
              voice assistant, and a standalone agent. Built end to end by{" "}
              <a href="/portfolio" className="text-white/80 underline decoration-white/20 underline-offset-4 hover:text-white">
                Shubham Mittal
              </a>
              .
            </p>
          </Reveal>

          <Reveal delay={0.26}>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <a href="/#contact" className="btn-primary !px-7 !py-3 text-sm">
                Work With Me
              </a>
              <a
                href="/portfolio"
                className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-6 py-3 text-sm font-medium text-white/80 transition-colors hover:border-white/30 hover:text-white"
              >
                See the Full Portfolio <ArrowUpRight size={14} />
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* The three surfaces */}
      <section className="mt-24 py-8">
        <div className="container-px">
          <SectionHeading
            eyebrow="One Brain, Three Doors"
            title={
              <>
                The Same JAYDEN, <span className="gradient-text">Wherever You Reach It</span>
              </>
            }
            subtitle="Three genuinely different apps, built for three different moments — sharing one identity and one memory instead of three unrelated assistants that happen to share a name."
          />

          <div className="mx-auto mt-14 grid max-w-6xl gap-6 sm:grid-cols-3">
            {SURFACES.map((s, i) => (
              <Reveal key={s.name} delay={(i % 3) * 0.08} className="h-full">
                <div className="card-glow h-full">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/[0.06] text-white/80">
                    <s.icon size={20} />
                  </div>
                  <h3 className="mt-5 font-display text-lg font-semibold">{s.name}</h3>
                  <p className="mt-1 text-xs uppercase tracking-wider text-white/40">{s.role}</p>
                  <p className="mt-3 text-sm leading-relaxed text-white/55">{s.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mt-8 py-8">
        <div className="container-px">
          <SectionHeading
            eyebrow="Under the Hood"
            title={
              <>
                Built Like a <span className="gradient-text">Real System</span>, Not a Wrapper
              </>
            }
            subtitle="The difference between an LLM API call and an AI system that decides which model a request deserves, remembers what it's told, and knows what it's allowed to touch."
          />

          <div className="mx-auto mt-14 grid max-w-5xl gap-6 sm:grid-cols-3">
            {FEATURES.map((f, i) => (
              <Reveal key={f.title} delay={(i % 3) * 0.08} className="h-full">
                <div className="glass h-full rounded-2xl p-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/[0.06] text-white/75">
                    <f.icon size={18} />
                  </div>
                  <h3 className="mt-4 text-sm font-semibold text-white/85">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/55">{f.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Honest note about the orb above */}
      <section className="mt-8 py-8">
        <div className="container-px">
          <Reveal>
            <p className="mx-auto max-w-2xl text-center text-xs leading-relaxed text-white/35">
              The orb above is the same visualizer the real product uses — this page is a
              showcase, not a public chat demo, since the real JAYDEN runs behind authentication
              on Shubham&apos;s own business data. Want to see it actually working? Get in touch
              and I&apos;ll walk you through it live.
            </p>
          </Reveal>
        </div>
      </section>

      {/* CTA */}
      <section className="mt-8 py-8">
        <div className="container-px">
          <Reveal>
            <div className="glass mx-auto max-w-3xl rounded-3xl px-8 py-12 text-center">
              <h2 className="font-display text-2xl font-bold sm:text-3xl">
                Want an AI system like this <span className="gradient-text">for your business?</span>
              </h2>
              <p className="mx-auto mt-3 max-w-md text-sm text-white/55">
                I design and build AI-powered products end to end — routing, memory, agents and
                all — the same way I built JAYDEN.
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
