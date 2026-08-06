"use client";

import { usePathname } from "next/navigation";

export default function ChromeWrapper({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  if (path.startsWith("/v5") || path.startsWith("/v6") || path.startsWith("/leads")) return null;
  return <>{children}</>;
}
