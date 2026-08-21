import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact — Get a Free Consultation",
  description:
    "Contact MITTAL.WEBSITE for a free website consultation. WhatsApp: +91 77019 03505. Email: shubhammittal3555@gmail.com. Based in Delhi NCR, serving all India. Response within 2 hours.",
  openGraph: {
    title: "Contact MITTAL.WEBSITE — Free Website Consultation",
    description: "WhatsApp +91 77019 03505. Free consultation, no commitment. Delhi NCR web design studio.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
