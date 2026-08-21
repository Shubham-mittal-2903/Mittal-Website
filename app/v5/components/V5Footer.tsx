import Link from "next/link";

export default function V5Footer() {
  return (
    <footer style={{ borderTop: "2px solid #D0CBC2", background: "#F2EFE8" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "64px 40px 40px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 80 }}>
          <div>
            <div className="v5-sans" style={{ fontSize: 20, fontWeight: 600, letterSpacing: "-0.02em", color: "#1A1A1A" }}>
              MITTAL<span style={{ color: "#8B7355" }}>.</span>WEBSITE
            </div>
            <p className="v5-sans" style={{ fontSize: 14, color: "#444", marginTop: 8, maxWidth: 280 }}>
              Founder-led web design studio based in Delhi NCR. Websites that grow businesses.
            </p>
          </div>
          <div style={{ display: "flex", gap: 80 }}>
            <div>
              <div className="v5-label" style={{ marginBottom: 16, color: "#888" }}>PAGES</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  { label: "About", href: "/v5/about" },
                  { label: "Services", href: "/v5/services" },
                  { label: "Work", href: "/v5/work" },
                  { label: "Pricing", href: "/v5/pricing" },
                  { label: "Contact", href: "/v5/contact" },
                ].map((l) => (
                  <Link key={l.href} href={l.href} className="v5-sans" style={{ fontSize: 14, color: "#444" }}>
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <div className="v5-label" style={{ marginBottom: 16, color: "#888" }}>CONNECT</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <a href="https://wa.me/917701903505" target="_blank" rel="noopener" className="v5-sans" style={{ fontSize: 14, color: "#444" }}>WhatsApp</a>
                <a href="https://www.instagram.com/mittal.website" target="_blank" rel="noopener" className="v5-sans" style={{ fontSize: 14, color: "#444" }}>Instagram</a>
                <a href="mailto:shubhammittal3555@gmail.com" className="v5-sans" style={{ fontSize: 14, color: "#444" }}>Email</a>
                <a href="tel:+917701903505" className="v5-sans" style={{ fontSize: 14, color: "#444" }}>+91 77019 03505</a>
              </div>
            </div>
          </div>
        </div>
        <div className="v5-sans" style={{
          display: "flex", justifyContent: "space-between",
          marginTop: 48, paddingTop: 24, borderTop: "1px solid #D0CBC2",
          fontSize: 13, color: "#555",
        }}>
          <span>&copy; 2025 MITTAL.WEBSITE. All rights reserved.</span>
          <span>Delhi NCR, India</span>
        </div>
      </div>
    </footer>
  );
}
