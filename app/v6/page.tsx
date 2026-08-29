"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import TextPressure from "./components/TextPressure";
import DecryptedText from "./components/DecryptedText";
import MagnetLines from "./components/MagnetLines";
import EvilEye from "./components/EvilEye";
import InfiniteMenu from "./components/InfiniteMenu";
import Lanyard from "./components/Lanyard";
import TypographyPractical from "./components/TypographyPractical";

const fade = {
  hidden: { opacity: 0, y: 40 },
  show: (d: number) => ({
    opacity: 1, y: 0,
    transition: { delay: d * 0.15, duration: 0.8, ease: [0.22, 1, 0.36, 1] },
  }),
};

function RevealText({ children, className, style, delay = 0 }: { children: React.ReactNode; className?: string; style?: React.CSSProperties; delay?: number }) {
  return (
    <motion.div variants={fade} custom={delay} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }} className={className} style={style}>
      {children}
    </motion.div>
  );
}

export default function V6Page() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.5], [0, -80]);

  return (
    <main className="v6-main">

      {/* ─── TOPBAR ─── */}
      <nav className="v6-topbar">
        <span className="v6-mono v6-logo-text">MW</span>
        <div className="v6-topbar-links">
          <span className="v6-mono v6-topbar-link">Work</span>
          <span className="v6-mono v6-topbar-link">Services</span>
          <span className="v6-mono v6-topbar-link">Pricing</span>
          <a href="https://wa.me/917701903505" className="v6-topbar-cta v6-mono">Let&rsquo;s talk</a>
        </div>
      </nav>

      {/* ═══════════════════════════════════════════
          HERO — full viewport, dark, cinematic
          + MagnetLines bg + TextPressure heading
      ═══════════════════════════════════════════ */}
      <section ref={heroRef} className="v6-hero">
        <MagnetLines rows={10} columns={20} lineColor="rgba(196,169,125,0.25)" radius={180} />
        <motion.div style={{ opacity: heroOpacity, y: heroY }} className="v6-hero-inner">
          <motion.div className="v6-hero-eyebrow v6-mono" variants={fade} custom={0} initial="hidden" animate="show">
            <DecryptedText text="Delhi NCR · Est. 2024" speed={35} triggerOnView={false} />
          </motion.div>

          <motion.h1 className="v6-hero-heading v6-display" variants={fade} custom={1} initial="hidden" animate="show">
            <TextPressure
              text="We don't do templates."
              minWeight={200}
              maxWeight={900}
              minWidth={75}
              maxWidth={125}
              radius={250}
            />
          </motion.h1>

          <motion.p className="v6-hero-sub v6-sans" variants={fade} custom={2} initial="hidden" animate="show">
            Founder-led web studio. Every site designed from scratch.<br />
            Fixed pricing. 10-day delivery. You own everything.
          </motion.p>

          <motion.div variants={fade} custom={3} initial="hidden" animate="show" className="v6-hero-actions">
            <a href="https://wa.me/917701903505" className="v6-pill v6-pill-light">
              Start a project <ArrowRight size={16} />
            </a>
            <span className="v6-mono v6-hero-price">From ₹5,555</span>
          </motion.div>

          <div className="v6-hero-watermark v6-display" aria-hidden>MW</div>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════
          MARQUEE — infinite scroll trust strip
      ═══════════════════════════════════════════ */}
      <div className="v6-marquee-wrap">
        <div className="v6-marquee">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="v6-marquee-track v6-mono">
              <span>Custom Design</span><span className="v6-dot" />
              <span>10-Day Delivery</span><span className="v6-dot" />
              <span>Fixed Pricing</span><span className="v6-dot" />
              <span>100% Ownership</span><span className="v6-dot" />
              <span>Founder-Led</span><span className="v6-dot" />
              <span>No Templates</span><span className="v6-dot" />
              <span>WhatsApp-First</span><span className="v6-dot" />
            </div>
          ))}
        </div>
      </div>

      {/* ═══════════════════════════════════════════
          ABOUT — light section + Practical Typography
      ═══════════════════════════════════════════ */}
      <section className="v6-section v6-light">
        <div className="v6-container">
          <div className="v6-split" style={{ gridTemplateColumns: "1fr 1.2fr", gap: 100 }}>
            <div>
              <RevealText>
                <span className="v6-mono v6-section-num">01</span>
              </RevealText>
              <RevealText delay={1}>
                <TypographyPractical text="Your business is unique. Your site should be too." />
              </RevealText>
            </div>
            <div style={{ paddingTop: 80 }}>
              <RevealText delay={2}>
                <p className="v6-sans v6-body">
                  Most agencies hand you a WordPress theme with your logo pasted on and call it &ldquo;custom.&rdquo;
                  We think that&rsquo;s lazy. Every project we take on starts with a blank canvas — your story,
                  your customers, your goals. Nothing recycled.
                </p>
              </RevealText>
              <RevealText delay={3}>
                <p className="v6-sans v6-body" style={{ marginTop: 20 }}>
                  That&rsquo;s why two restaurants, two gyms, two clinics that hire us never get the same design.
                  Because they&rsquo;re not the same business.
                </p>
              </RevealText>
              <RevealText delay={4}>
                <div className="v6-founder-card">
                  <Image src="/shubham.png" alt="Shubham Mittal" width={56} height={56} className="v6-founder-img" />
                  <div>
                    <div className="v6-sans" style={{ fontWeight: 600, fontSize: 15 }}>Shubham Mittal</div>
                    <div className="v6-mono" style={{ fontSize: 11, opacity: 0.5 }}>Founder &amp; Lead Dev</div>
                  </div>
                </div>
              </RevealText>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SERVICES — dark section + DecryptedText titles
      ═══════════════════════════════════════════ */}
      <section className="v6-section v6-dark">
        <div className="v6-container">
          <RevealText>
            <span className="v6-mono v6-section-num" style={{ color: "rgba(255,255,255,0.3)" }}>02</span>
          </RevealText>
          <RevealText delay={1}>
            <h2 className="v6-display v6-heading-lg" style={{ color: "#fff" }}>
              <DecryptedText text="What we build & what it costs." speed={30} />
            </h2>
          </RevealText>

          <div className="v6-services-list">
            {[
              { title: "Starter Website", price: "₹5,555", market: "~₹15K", tag: "5 pages · responsive · SEO" },
              { title: "Business Website", price: "₹9,999", market: "~₹30K", tag: "premium design · lead-gen · CMS", hot: true },
              { title: "E-Commerce", price: "from ₹14,999", market: "~₹50K", tag: "catalog · cart · payments · admin" },
              { title: "Brand Growth", price: "₹6,999/mo", market: "~₹15K/mo", tag: "creatives · content · branding" },
              { title: "SEO Foundation", price: "from ₹4,999", market: "~₹12K", tag: "meta · schema · audit · local SEO" },
              { title: "Custom Build", price: "Let's talk", market: "", tag: "AI · dashboards · CRM · anything" },
            ].map((s, i) => (
              <RevealText key={i} delay={i * 0.5}>
                <a href="https://wa.me/917701903505" className="v6-service-row">
                  <div className="v6-service-left">
                    <span className="v6-display v6-service-title">{s.title}</span>
                    {s.hot && <span className="v6-hot v6-mono">Popular</span>}
                  </div>
                  <span className="v6-mono v6-service-tag">{s.tag}</span>
                  <div className="v6-service-right">
                    <span className="v6-sans v6-service-price">{s.price}</span>
                    {s.market && <span className="v6-mono v6-service-market">{s.market}</span>}
                  </div>
                  <ArrowUpRight size={20} className="v6-service-arrow" />
                </a>
              </RevealText>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          WORK — light, large cards
      ═══════════════════════════════════════════ */}
      <section className="v6-section v6-light">
        <div className="v6-container">
          <RevealText>
            <span className="v6-mono v6-section-num">03</span>
          </RevealText>
          <RevealText delay={1}>
            <h2 className="v6-display v6-heading-lg">
              <DecryptedText text="Selected work." speed={50} />
            </h2>
          </RevealText>

          <div className="v6-work-grid">
            {[
              { name: "Solid State Lights", type: "LED Manufacturer · Web Design", url: "https://solidstatelights.in", bg: "#141414" },
              { name: "ClearMyChallan", type: "Traffic Platform · Web App", url: "https://clearmychallan.com", bg: "#0C1824" },
            ].map((p, i) => (
              <RevealText key={i} delay={i}>
                <a href={p.url} target="_blank" rel="noopener" className="v6-work-card">
                  <div className="v6-work-thumb" style={{ background: p.bg }}>
                    <span className="v6-display v6-work-name-overlay">{p.name}</span>
                  </div>
                  <div className="v6-work-meta">
                    <div>
                      <div className="v6-sans" style={{ fontWeight: 600 }}>{p.name}</div>
                      <div className="v6-mono" style={{ fontSize: 12, opacity: 0.5, marginTop: 2 }}>{p.type}</div>
                    </div>
                    <ArrowUpRight size={20} style={{ opacity: 0.4 }} />
                  </div>
                </a>
              </RevealText>
            ))}
          </div>

          <RevealText delay={2}>
            <div style={{ marginTop: 48 }}>
              <Link href="/website-gallery" className="v6-pill v6-pill-dark">
                Browse 100+ demos <ArrowRight size={16} />
              </Link>
            </div>
          </RevealText>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          INFINITE MENU — between work and process
      ═══════════════════════════════════════════ */}
      <section className="v6-dark" style={{ paddingTop: 40, paddingBottom: 40, borderTop: "1px solid rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <InfiniteMenu items={[
          { label: "Starter", href: "#" },
          { label: "Business", href: "#" },
          { label: "E-Commerce", href: "#" },
          { label: "Branding", href: "#" },
          { label: "SEO", href: "#" },
          { label: "Custom", href: "#" },
        ]} />
      </section>

      {/* ═══════════════════════════════════════════
          PROCESS — dark, numbered steps
      ═══════════════════════════════════════════ */}
      <section className="v6-section v6-dark">
        <div className="v6-container">
          <RevealText>
            <span className="v6-mono v6-section-num" style={{ color: "rgba(255,255,255,0.3)" }}>04</span>
          </RevealText>
          <RevealText delay={1}>
            <h2 className="v6-display v6-heading-lg" style={{ color: "#fff" }}>
              How it works.
            </h2>
          </RevealText>

          <div className="v6-process-grid">
            {[
              { step: "01", title: "Discovery", desc: "15-min WhatsApp call. We learn your business, goals, and what your site needs to do." },
              { step: "02", title: "Design & Build", desc: "Custom design from scratch. Live staging preview. Two revision rounds." },
              { step: "03", title: "Review", desc: "You check staging, request changes, approve before anything goes live." },
              { step: "04", title: "Launch", desc: "Site goes live. You own everything — code, domain, hosting. 100% yours." },
            ].map((s, i) => (
              <RevealText key={i} delay={i}>
                <div className="v6-process-card">
                  <span className="v6-display v6-process-num">{s.step}</span>
                  <h3 className="v6-sans v6-process-title">{s.title}</h3>
                  <p className="v6-sans v6-process-desc">{s.desc}</p>
                </div>
              </RevealText>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          QUOTE — full bleed + Evil Eye + Lanyard
      ═══════════════════════════════════════════ */}
      <section className="v6-quote-section" style={{ position: "relative" }}>
        <div className="v6-container" style={{ textAlign: "center" }}>
          <RevealText>
            <div style={{ display: "flex", justifyContent: "center", gap: 40, marginBottom: 48, alignItems: "center", flexWrap: "wrap" }}>
              <EvilEye size={80} />
              <Lanyard text="MW" width={140} height={200} />
              <EvilEye size={80} />
            </div>
          </RevealText>
          <RevealText>
            <blockquote className="v6-display v6-quote">
              &ldquo;I started this because businesses deserve better than a ₹30,000 template with their logo slapped on.&rdquo;
            </blockquote>
          </RevealText>
          <RevealText delay={1}>
            <div className="v6-quote-attr">
              <Image src="/shubham.png" alt="Shubham" width={44} height={44} className="v6-quote-avatar" />
              <div style={{ textAlign: "left" }}>
                <div className="v6-sans" style={{ fontWeight: 600, fontSize: 14, color: "#fff" }}>Shubham Mittal</div>
                <div className="v6-mono" style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>Founder</div>
              </div>
            </div>
          </RevealText>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          CTA — light, centered
      ═══════════════════════════════════════════ */}
      <section className="v6-section v6-light" style={{ textAlign: "center", paddingTop: 140, paddingBottom: 140 }}>
        <div className="v6-container">
          <RevealText>
            <span className="v6-mono v6-section-num">05</span>
          </RevealText>
          <RevealText delay={1}>
            <h2 className="v6-display" style={{ fontSize: "clamp(40px, 6vw, 80px)", letterSpacing: "-0.04em", lineHeight: 1.05 }}>
              Let&rsquo;s build something<br /><em>worth visiting.</em>
            </h2>
          </RevealText>
          <RevealText delay={2}>
            <p className="v6-sans v6-body" style={{ maxWidth: 380, margin: "28px auto 0", textAlign: "center" }}>
              Free consultation. Fixed pricing. No lock-in.<br />
              50% advance, 50% on completion.
            </p>
          </RevealText>
          <RevealText delay={3}>
            <div style={{ marginTop: 40, display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
              <a href="https://wa.me/917701903505" className="v6-pill v6-pill-dark">
                WhatsApp us <ArrowRight size={16} />
              </a>
              <a href="mailto:contact@mittaldev.website" className="v6-pill v6-pill-outline">
                Email us
              </a>
            </div>
          </RevealText>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="v6-footer">
        <div className="v6-container">
          <div className="v6-footer-top">
            <div className="v6-display" style={{ fontSize: 48, letterSpacing: "-0.04em", color: "#fff" }}>MW</div>
            <div className="v6-footer-links">
              <div className="v6-footer-col">
                <span className="v6-mono v6-footer-label">Sitemap</span>
                <a href="/v6" className="v6-sans">Home</a>
                <a href="/v5/about" className="v6-sans">About</a>
                <a href="/v5/services" className="v6-sans">Services</a>
                <a href="/v5/work" className="v6-sans">Work</a>
                <a href="/v5/pricing" className="v6-sans">Pricing</a>
                <a href="/v5/contact" className="v6-sans">Contact</a>
              </div>
              <div className="v6-footer-col">
                <span className="v6-mono v6-footer-label">Connect</span>
                <a href="https://wa.me/917701903505" target="_blank" rel="noopener" className="v6-sans">WhatsApp</a>
                <a href="https://www.instagram.com/mittal.website" target="_blank" rel="noopener" className="v6-sans">Instagram</a>
                <a href="mailto:contact@mittaldev.website" className="v6-sans">Email</a>
                <a href="tel:+917701903505" className="v6-sans">+91 77019 03505</a>
              </div>
            </div>
          </div>
          <div className="v6-footer-bottom v6-mono">
            <span>&copy; 2025 MITTAL.WEBSITE</span>
            <span>Delhi NCR, India</span>
          </div>
        </div>
      </footer>

    </main>
  );
}
