"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Loader2, Send, Phone, Mail, MessageCircle } from "lucide-react";
import { BUDGET_RANGES, BRAND } from "@/lib/data";
import SectionHeading from "./SectionHeading";
import Reveal from "./Reveal";

type Status = "idle" | "loading" | "success" | "error";

export default function Contact() {
  const [status, setStatus] = useState<Status>("idle");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("loading");
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());

    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Request failed");
      setStatus("success");
      form.reset();
    } catch {
      setStatus("error");
    }
  };

  const inputClass =
    "w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder-white/35 outline-none transition-colors focus:border-electric/60 focus:bg-white/[0.05]";

  return (
    <section id="contact" className="py-24">
      <div className="container-px">
        <SectionHeading
          eyebrow="Get In Touch"
          title={
            <>
              Get Your <span className="gradient-text">Free Consultation</span>
            </>
          }
          subtitle="Register your project below and our team will personally coordinate with you within 24 hours."
        />

        <Reveal delay={0.05}>
          <div className="mx-auto mt-10 grid max-w-2xl gap-3 sm:grid-cols-3">
            {[
              { icon: Phone, label: "Call Us", value: BRAND.phoneDisplay, href: `tel:${BRAND.phone}` },
              { icon: MessageCircle, label: "WhatsApp", value: "Chat now", href: BRAND.whatsapp },
              { icon: Mail, label: "Email", value: BRAND.email, href: `mailto:${BRAND.email}` },
            ].map((item) => (
              <a
                key={item.label}
                href={item.href}
                target={item.label === "WhatsApp" ? "_blank" : undefined}
                rel="noopener noreferrer"
                className="glass flex items-center gap-3 rounded-2xl px-4 py-3.5 transition-all duration-300 hover:border-gold/40 hover:-translate-y-0.5"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-soft">
                  <item.icon size={16} className="text-gold" />
                </span>
                <span className="min-w-0">
                  <span className="block text-[11px] uppercase tracking-wider text-white/40">
                    {item.label}
                  </span>
                  <span className="block truncate text-sm font-medium text-white/85">
                    {item.value}
                  </span>
                </span>
              </a>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mx-auto mt-12 max-w-2xl rounded-3xl glass-strong p-6 sm:p-9">
            <AnimatePresence mode="wait">
              {status === "success" ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center py-10 text-center"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 12 }}
                    className="flex h-16 w-16 items-center justify-center rounded-full bg-accent-gradient"
                  >
                    <CheckCircle2 size={34} className="text-ink" />
                  </motion.div>
                  <h3 className="mt-5 font-display text-2xl font-bold">Thank you!</h3>
                  <p className="mt-2 max-w-sm text-sm text-white/60">
                    Your request has been received. Our team will reach out within 24 hours to
                    discuss your project.
                  </p>
                  <button
                    onClick={() => setStatus("idle")}
                    className="btn-ghost mt-7"
                  >
                    Send Another Request
                  </button>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleSubmit}
                  className="grid gap-4 sm:grid-cols-2"
                >
                  <div>
                    <label className="mb-1.5 block text-xs text-white/50">Name *</label>
                    <input name="name" required placeholder="Your name" className={inputClass} />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs text-white/50">Business Name</label>
                    <input name="business" placeholder="Your company" className={inputClass} />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs text-white/50">Email *</label>
                    <input
                      name="email"
                      type="email"
                      required
                      placeholder="you@email.com"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs text-white/50">Phone Number</label>
                    <input name="phone" placeholder="+91 ..." className={inputClass} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-1.5 block text-xs text-white/50">Budget Range</label>
                    <select name="budget" className={inputClass} defaultValue="">
                      <option value="" disabled className="bg-ink">
                        Select a range
                      </option>
                      {BUDGET_RANGES.map((r) => (
                        <option key={r} value={r} className="bg-ink">
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-1.5 block text-xs text-white/50">
                      Project Requirements *
                    </label>
                    <textarea
                      name="requirements"
                      required
                      rows={4}
                      placeholder="Tell us what you're looking to build..."
                      className={`${inputClass} resize-none`}
                    />
                  </div>

                  {status === "error" && (
                    <p className="sm:col-span-2 text-sm text-red-400">
                      Something went wrong. Please try again or email {""}
                      <span className="text-white">shubhammittal3555@gmail.com</span>.
                    </p>
                  )}

                  <div className="sm:col-span-2">
                    <button
                      type="submit"
                      disabled={status === "loading"}
                      className="btn-primary w-full disabled:opacity-70"
                    >
                      {status === "loading" ? (
                        <>
                          <Loader2 size={16} className="animate-spin" /> Sending...
                        </>
                      ) : (
                        <>
                          Submit Request <Send size={16} />
                        </>
                      )}
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
