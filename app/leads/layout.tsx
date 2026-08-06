import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "MITTAL.WEBSITE — Leads",
  robots: { index: false, follow: false, nocache: true },
};

export default function LeadsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
