import { Inter, Instrument_Serif, Space_Mono } from "next/font/google";
import type { Metadata } from "next";

const inter = Inter({ subsets: ["latin"], variable: "--font-v6-sans", display: "swap" });
const instrumentSerif = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["normal", "italic"], variable: "--font-v6-display", display: "swap" });
const spaceMono = Space_Mono({ subsets: ["latin"], weight: "400", variable: "--font-v6-mono", display: "swap" });

export const metadata: Metadata = {
  title: "MITTAL.WEBSITE — V6",
  robots: { index: false, follow: false },
};

import "./v6.css";

export default function V6Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${inter.variable} ${instrumentSerif.variable} ${spaceMono.variable} v6`}>
      {children}
    </div>
  );
}
