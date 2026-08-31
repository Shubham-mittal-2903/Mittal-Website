import type { Metadata, Viewport } from "next";
import { Inter, Cormorant_Garamond } from "next/font/google";
import { BRAND, FAQS } from "@/lib/data";
import Preloader from "@/components/Preloader";
import AuroraBackground from "@/components/AuroraBackground";
import ScrollProgress from "@/components/ScrollProgress";
import CursorFollower from "@/components/CursorFollower";
import CardSpotlight from "@/components/CardSpotlight";
import AnnouncementBar from "@/components/AnnouncementBar";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingActions from "@/components/FloatingActions";
import Jayden from "@/components/jayden/Jayden";
import SmoothScroll from "@/components/SmoothScroll";
import NoiseOverlay from "@/components/NoiseOverlay";
import ChromeWrapper from "@/components/ChromeWrapper";
import FirebaseAnalytics from "@/components/FirebaseAnalytics";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

const siteUrl = "https://mittaldev.website";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Website Development Agency in Delhi NCR — MITTAL.WEBSITE | From ₹5,555",
    template: "%s | MITTAL.WEBSITE",
  },
  description:
    "Want to get a website made in Delhi NCR? MITTAL.WEBSITE is a premium web development agency building business websites, e-commerce stores & web apps that convert. Starting from ₹5,555 — free consultation, delivered in 10 days. Serving Delhi, Noida, Gurugram, Ghaziabad, Faridabad & all of India.",
  keywords: [
    "website development agency Delhi NCR",
    "website designer Delhi NCR",
    "ecommerce website development",
    "business website design India",
    "MITTAL.WEBSITE",
  ],
  authors: [{ name: "MITTAL.WEBSITE" }],
  creator: "MITTAL.WEBSITE",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: siteUrl,
    siteName: "MITTAL.WEBSITE",
    title: "MITTAL.WEBSITE — Websites That Grow Your Business",
    description:
      "Websites, e-commerce stores and custom web apps that win you more customers. Built for growth, from ₹5,555. Delhi NCR web development agency.",
  },
  twitter: {
    card: "summary_large_image",
    title: "MITTAL.WEBSITE — Websites That Grow Your Business",
    description:
      "Websites and web apps that win you more customers. Built for growth, from ₹5,555.",
  },
  robots: { index: true, follow: true },
  alternates: { canonical: "/" },
};

export const viewport: Viewport = {
  themeColor: "#0A0A0B",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: "MITTAL.WEBSITE",
        alternateName: "mittal.website",
        url: siteUrl,
        slogan: BRAND.tagline,
        email: BRAND.email,
        telephone: BRAND.phone,
        sameAs: [BRAND.instagram, BRAND.whatsapp],
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: "MITTAL.WEBSITE",
        inLanguage: "en-IN",
        publisher: { "@id": `${siteUrl}/#organization` },
      },
      {
        "@type": "ProfessionalService",
        "@id": `${siteUrl}/#service`,
        name: "MITTAL.WEBSITE",
        description:
          "Premium web development agency building websites, landing pages and custom web apps that help businesses attract customers and convert.",
        url: siteUrl,
        email: BRAND.email,
        telephone: BRAND.phone,
        priceRange: "₹₹",
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
        founder: { "@type": "Person", name: "Shubham Mittal" },
        contactPoint: {
          "@type": "ContactPoint",
          telephone: BRAND.phone,
          email: BRAND.email,
          contactType: "sales",
          availableLanguage: ["English", "Hindi"],
        },
      },
      {
        "@type": "FAQPage",
        "@id": `${siteUrl}/#faq`,
        mainEntity: FAQS.map((f) => ({
          "@type": "Question",
          name: f.question,
          acceptedAnswer: { "@type": "Answer", text: f.answer },
        })),
      },
    ],
  };

  return (
    <html
      lang="en"
      className={`${inter.variable} ${cormorant.variable}`}
      suppressHydrationWarning
    >
      <body className="font-sans antialiased" suppressHydrationWarning>
        <FirebaseAnalytics />
        <ChromeWrapper>
          <SmoothScroll />
          <Preloader />
          <AuroraBackground />
          <NoiseOverlay />
          <ScrollProgress />
          <CursorFollower />
          <CardSpotlight />
          <AnnouncementBar />
          <Navbar />
        </ChromeWrapper>
        {children}
        <ChromeWrapper>
          <Footer />
          <FloatingActions />
          <Jayden />
        </ChromeWrapper>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  );
}
