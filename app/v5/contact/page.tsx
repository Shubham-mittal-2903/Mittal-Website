"use client";

import { motion } from "framer-motion";
import { ArrowRight, Phone, Mail, MapPin, MessageCircle, Clock } from "lucide-react";

const fade = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.12, duration: 0.7, ease: [0.25, 0.1, 0, 1] },
  }),
};

export default function ContactPage() {
  return (
    <main>
      <div className="v5-page-header">
        <motion.p className="v5-label" custom={0} variants={fade} initial="hidden" animate="visible">Contact</motion.p>
        <motion.h1 className="v5-serif" custom={1} variants={fade} initial="hidden" animate="visible">
          Let&rsquo;s talk about<br />your project.
        </motion.h1>
        <motion.p className="v5-sans" custom={2} variants={fade} initial="hidden" animate="visible">
          Free consultation — no commitment, no hard sell. Just an honest conversation
          about what your business needs.
        </motion.p>
      </div>

      <hr className="v5-rule" style={{ maxWidth: 1280, margin: "0 auto" }} />

      <section style={{ padding: "80px 40px", maxWidth: 1280, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80 }}>
          {/* Left — contact details */}
          <div>
            <p className="v5-label">Get in touch</p>
            <h2 className="v5-serif" style={{ fontSize: 32, letterSpacing: "-0.02em", marginTop: 20 }}>
              Reach out however<br />works best for you.
            </h2>

            <div style={{ marginTop: 48, display: "flex", flexDirection: "column", gap: 32 }}>
              {[
                { icon: <MessageCircle size={20} />, label: "WhatsApp (fastest)", value: "+91 77019 03505", href: "https://wa.me/917701903505" },
                { icon: <Phone size={20} />, label: "Phone", value: "+91 77019 03505", href: "tel:+917701903505" },
                { icon: <Mail size={20} />, label: "Email", value: "shubhammittal3555@gmail.com", href: "mailto:shubhammittal3555@gmail.com" },
                { icon: <MapPin size={20} />, label: "Location", value: "Delhi NCR, India", href: undefined },
                { icon: <Clock size={20} />, label: "Response time", value: "Usually within 2 hours", href: undefined },
              ].map((c, i) => (
                <motion.div
                  key={i}
                  variants={fade} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }}
                  style={{ display: "flex", gap: 16, alignItems: "flex-start" }}
                >
                  <div style={{ color: "var(--accent)", marginTop: 2 }}>{c.icon}</div>
                  <div>
                    <div className="v5-sans" style={{ fontSize: 13, color: "var(--muted)" }}>{c.label}</div>
                    {c.href ? (
                      <a href={c.href} target={c.href.startsWith("http") ? "_blank" : undefined} rel="noopener"
                        className="v5-sans" style={{ fontSize: 16, fontWeight: 500, borderBottom: "1px solid var(--border)", paddingBottom: 2 }}>
                        {c.value}
                      </a>
                    ) : (
                      <div className="v5-sans" style={{ fontSize: 16, fontWeight: 500 }}>{c.value}</div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            <div style={{ marginTop: 48 }}>
              <a href="https://wa.me/917701903505" className="v5-btn v5-btn-dark">
                WhatsApp us directly <ArrowRight size={16} />
              </a>
            </div>
          </div>

          {/* Right — contact form */}
          <motion.div variants={fade} custom={1} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <p className="v5-label">Or fill out the form</p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                const name = fd.get("name");
                const phone = fd.get("phone");
                const msg = fd.get("message");
                const text = `Hi, I'm ${name}. ${msg}`;
                window.open(`https://wa.me/917701903505?text=${encodeURIComponent(text)}`, "_blank");
              }}
              style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 20 }}
            >
              {[
                { name: "name", label: "Your name", type: "text", required: true },
                { name: "phone", label: "Phone / WhatsApp number", type: "tel", required: true },
                { name: "email", label: "Email (optional)", type: "email", required: false },
              ].map((f) => (
                <div key={f.name}>
                  <label className="v5-sans" style={{ fontSize: 13, color: "var(--muted)", display: "block", marginBottom: 6 }}>{f.label}</label>
                  <input
                    name={f.name}
                    type={f.type}
                    required={f.required}
                    className="v5-sans"
                    style={{
                      width: "100%", padding: "14px 16px", fontSize: 15,
                      border: "1px solid var(--border)", borderRadius: 10,
                      background: "transparent", color: "var(--ink)",
                      outline: "none", transition: "border-color 0.2s",
                      fontFamily: "var(--font-v5-sans), system-ui, sans-serif",
                    }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = "var(--ink)")}
                    onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
                  />
                </div>
              ))}
              <div>
                <label className="v5-sans" style={{ fontSize: 13, color: "var(--muted)", display: "block", marginBottom: 6 }}>Tell us about your project</label>
                <textarea
                  name="message"
                  rows={4}
                  required
                  className="v5-sans"
                  placeholder="What kind of website do you need? Any specific features?"
                  style={{
                    width: "100%", padding: "14px 16px", fontSize: 15,
                    border: "1px solid var(--border)", borderRadius: 10,
                    background: "transparent", color: "var(--ink)",
                    outline: "none", transition: "border-color 0.2s", resize: "vertical",
                    fontFamily: "var(--font-v5-sans), system-ui, sans-serif",
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "var(--ink)")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
                />
              </div>
              <button type="submit" className="v5-btn v5-btn-dark" style={{ border: "none", cursor: "pointer", justifyContent: "center" }}>
                Send via WhatsApp <ArrowRight size={16} />
              </button>
              <p className="v5-sans" style={{ fontSize: 12, color: "var(--muted)", textAlign: "center" }}>
                This opens WhatsApp with your message pre-filled. No data stored.
              </p>
            </form>
          </motion.div>
        </div>
      </section>

      <hr className="v5-rule" style={{ maxWidth: 1280, margin: "0 auto" }} />

      {/* Service areas */}
      <section style={{ padding: "80px 40px", maxWidth: 1280, margin: "0 auto" }}>
        <div className="v5-grid-aside">
          <div>
            <p className="v5-label">Service area</p>
            <h2 className="v5-serif" style={{ fontSize: 32, letterSpacing: "-0.02em", marginTop: 20 }}>
              Where we work.
            </h2>
          </div>
          <div>
            <p className="v5-sans" style={{ fontSize: 17, lineHeight: 1.7, color: "var(--muted)", maxWidth: 480 }}>
              Based in Delhi NCR. We work with businesses across India remotely — all communication
              happens on WhatsApp and video calls.
            </p>
            <div style={{ marginTop: 24, display: "flex", flexWrap: "wrap", gap: 8 }}>
              {["Delhi", "Noida", "Gurugram", "Ghaziabad", "Faridabad", "All India (remote)"].map((c) => (
                <span key={c} className="v5-sans" style={{
                  fontSize: 13, padding: "6px 16px", borderRadius: 100,
                  border: "1px solid var(--border)", color: "var(--muted)",
                }}>{c}</span>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
