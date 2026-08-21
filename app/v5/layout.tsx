import { Inter, Instrument_Serif } from "next/font/google";
import type { Metadata } from "next";
import V5Nav from "./components/V5Nav";
import V5Footer from "./components/V5Footer";
import ScrollToTop from "./components/ScrollToTop";
import "./v5.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-v5-sans",
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-v5-display",
  display: "swap",
});

const siteUrl = "https://mittaldev.website";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "MITTAL.WEBSITE — Custom Website Development Agency in Delhi NCR | From ₹5,555",
    template: "%s | MITTAL.WEBSITE — Web Design Studio Delhi NCR",
  },
  description:
    "Founder-led web design studio in Delhi NCR building custom websites, e-commerce stores & web apps from ₹5,555. No templates — every site designed from scratch. 10-day delivery, 100% ownership, fixed pricing. Serving Delhi, Noida, Gurugram & all India.",
  keywords: [
    "website development agency Delhi NCR",
    "web design studio Delhi",
    "custom website design India",
    "website designer near me",
    "affordable website development Delhi",
    "ecommerce website development India",
    "business website design Delhi NCR",
    "website banwao Delhi",
    "best web developer Delhi NCR",
    "MITTAL.WEBSITE",
    "website development Noida",
    "website development Gurugram",
    "freelance web developer Delhi",
    "startup website design",
    "small business website India",
  ],
  authors: [{ name: "Shubham Mittal", url: siteUrl }],
  creator: "MITTAL.WEBSITE",
  publisher: "MITTAL.WEBSITE",
  robots: { index: false, follow: false },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: siteUrl,
    siteName: "MITTAL.WEBSITE",
    title: "MITTAL.WEBSITE — Custom Websites That Grow Businesses | Delhi NCR",
    description:
      "Founder-led web design studio. Custom websites from ₹5,555 — no templates, 10-day delivery, 100% ownership. Delhi NCR & all India.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "MITTAL.WEBSITE — Custom Web Design Studio Delhi NCR",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MITTAL.WEBSITE — Custom Websites From ₹5,555",
    description:
      "Founder-led web design studio in Delhi NCR. Custom design, 10-day delivery, fixed pricing, 100% ownership.",
  },
  alternates: {
    canonical: siteUrl,
  },
  category: "Web Development",
  other: {
    "geo.region": "IN-DL",
    "geo.placename": "Delhi NCR",
    "geo.position": "28.6139;77.2090",
    "ICBM": "28.6139, 77.2090",
    "rating": "general",
    "revisit-after": "7 days",
    "language": "English, Hindi",
  },
};

export default function V5Layout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: "MITTAL.WEBSITE",
        alternateName: ["mittal.website", "Mittal Website", "Mittal Web Design"],
        url: siteUrl,
        logo: `${siteUrl}/logo.png`,
        slogan: "Websites That Actually Grow Businesses",
        description: "Founder-led web design studio in Delhi NCR building custom websites, e-commerce stores and web applications from ₹5,555.",
        email: "shubhammittal3555@gmail.com",
        telephone: "+917701903505",
        foundingDate: "2024",
        founder: {
          "@type": "Person",
          name: "Shubham Mittal",
          jobTitle: "Founder & Lead Developer",
          url: siteUrl,
        },
        sameAs: [
          "https://www.instagram.com/mittal.website",
          "https://wa.me/917701903505",
        ],
        address: {
          "@type": "PostalAddress",
          addressLocality: "Delhi",
          addressRegion: "Delhi NCR",
          addressCountry: "IN",
        },
        areaServed: [
          { "@type": "City", name: "Delhi" },
          { "@type": "City", name: "Noida" },
          { "@type": "City", name: "Gurugram" },
          { "@type": "City", name: "Ghaziabad" },
          { "@type": "City", name: "Faridabad" },
          { "@type": "Country", name: "India" },
        ],
        contactPoint: {
          "@type": "ContactPoint",
          telephone: "+917701903505",
          email: "shubhammittal3555@gmail.com",
          contactType: "sales",
          availableLanguage: ["English", "Hindi", "Hinglish"],
          areaServed: "IN",
        },
        knowsAbout: [
          "Web Development", "Web Design", "E-Commerce Development",
          "UI/UX Design", "SEO", "Custom Web Applications",
          "React", "Next.js", "Node.js", "Tailwind CSS",
        ],
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: "MITTAL.WEBSITE",
        description: "Custom website development agency in Delhi NCR",
        inLanguage: ["en-IN", "hi-IN"],
        publisher: { "@id": `${siteUrl}/#organization` },
      },
      {
        "@type": "ProfessionalService",
        "@id": `${siteUrl}/#service`,
        name: "MITTAL.WEBSITE",
        description: "Custom website development, e-commerce stores, and web applications for businesses across India. Fixed pricing, 10-day delivery, founder-led communication.",
        url: siteUrl,
        email: "shubhammittal3555@gmail.com",
        telephone: "+917701903505",
        priceRange: "₹5,555 - ₹50,000+",
        currenciesAccepted: "INR",
        paymentAccepted: "Bank Transfer, UPI, Cash",
        address: {
          "@type": "PostalAddress",
          addressLocality: "Delhi",
          addressRegion: "Delhi NCR",
          addressCountry: "IN",
        },
        geo: {
          "@type": "GeoCoordinates",
          latitude: 28.6139,
          longitude: 77.2090,
        },
        areaServed: [
          { "@type": "City", name: "Delhi" },
          { "@type": "City", name: "Noida" },
          { "@type": "City", name: "Gurugram" },
          { "@type": "City", name: "Ghaziabad" },
          { "@type": "City", name: "Faridabad" },
          { "@type": "Country", name: "India" },
        ],
        founder: { "@type": "Person", name: "Shubham Mittal" },
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: "Web Development Services",
          itemListElement: [
            {
              "@type": "Offer",
              name: "Starter Website",
              description: "Up to 5 pages, responsive design, contact form, WhatsApp integration, basic SEO. For new businesses and local shops.",
              price: "5555",
              priceCurrency: "INR",
              availability: "https://schema.org/InStock",
            },
            {
              "@type": "Offer",
              name: "Business Website",
              description: "Premium custom design, lead generation setup, SEO structure, premium animations, priority delivery. For growing brands.",
              price: "9999",
              priceCurrency: "INR",
              availability: "https://schema.org/InStock",
            },
            {
              "@type": "Offer",
              name: "E-Commerce Website",
              description: "Product catalog, filters, cart, payment gateway, admin panel, order management. For retail and product businesses.",
              price: "14999",
              priceCurrency: "INR",
              availability: "https://schema.org/InStock",
            },
            {
              "@type": "Offer",
              name: "Brand Growth Package",
              description: "12 premium creatives, content strategy, branding, WhatsApp lead-gen focus. Monthly ongoing visibility.",
              price: "6999",
              priceCurrency: "INR",
              unitText: "MONTH",
              availability: "https://schema.org/InStock",
            },
            {
              "@type": "Offer",
              name: "SEO Foundation",
              description: "Meta titles, schema markup, sitemap, technical audit, local SEO setup.",
              price: "4999",
              priceCurrency: "INR",
              availability: "https://schema.org/InStock",
            },
          ],
        },
      },
      {
        "@type": "FAQPage",
        "@id": `${siteUrl}/#faq`,
        mainEntity: [
          { "@type": "Question", name: "How much does a website cost at MITTAL.WEBSITE?", acceptedAnswer: { "@type": "Answer", text: "Starter websites begin at ₹5,555 (market rate ~₹15,000). Business websites at ₹9,999 (market rate ~₹30,000). E-commerce from ₹14,999 (market rate ~₹50,000). All pricing is fixed — no hidden charges." } },
          { "@type": "Question", name: "How long does it take to build a website?", acceptedAnswer: { "@type": "Answer", text: "Most projects launch within 10 business days. Simple sites can be faster, complex web apps may take longer. You always know the timeline before we start." } },
          { "@type": "Question", name: "Do I own the website after it's built?", acceptedAnswer: { "@type": "Answer", text: "Yes, 100%. After final payment, you own the code, domain, and hosting accounts. No lock-in, no monthly trap, no 'you can't leave' clauses." } },
          { "@type": "Question", name: "What is the payment structure?", acceptedAnswer: { "@type": "Answer", text: "50% advance to start, 50% after you review and approve on staging. You never pay the full amount before seeing the final product." } },
          { "@type": "Question", name: "Where is MITTAL.WEBSITE located?", acceptedAnswer: { "@type": "Answer", text: "We're based in Delhi NCR and serve businesses across Delhi, Noida, Gurugram, Ghaziabad, Faridabad, and all of India remotely via WhatsApp and video calls." } },
          { "@type": "Question", name: "Do you use templates?", acceptedAnswer: { "@type": "Answer", text: "No. Every website is designed from scratch. Two clients in the same industry never get the same design. We don't use WordPress themes or page builders." } },
          { "@type": "Question", name: "Can I see my website before it goes live?", acceptedAnswer: { "@type": "Answer", text: "Always. You get a live staging preview link. You review, request changes (2 revision rounds included), and approve before anything goes public." } },
          { "@type": "Question", name: "What technologies do you use?", acceptedAnswer: { "@type": "Answer", text: "We use modern technologies like React, Next.js, Tailwind CSS, and Node.js. Every project uses the tech stack that best fits the requirements — no one-size-fits-all approach." } },
        ],
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${siteUrl}/#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
          { "@type": "ListItem", position: 2, name: "About", item: `${siteUrl}/about` },
          { "@type": "ListItem", position: 3, name: "Services", item: `${siteUrl}/services` },
          { "@type": "ListItem", position: 4, name: "Work", item: `${siteUrl}/work` },
          { "@type": "ListItem", position: 5, name: "Pricing", item: `${siteUrl}/pricing` },
          { "@type": "ListItem", position: 6, name: "Contact", item: `${siteUrl}/contact` },
        ],
      },
    ],
  };

  return (
    <div className={`${inter.variable} ${instrumentSerif.variable} v5`}>
      <ScrollToTop />
      <V5Nav />
      {children}
      <V5Footer />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </div>
  );
}
