"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import BottomNav from "./BottomNav";
import CommandPalette from "./CommandPalette";
import { Toaster } from "@/components/ui/sonner";
import CardSpotlight from "@/components/CardSpotlight";

export default function LeadsShell({
  email,
  children,
}: {
  email: string | null;
  children: React.ReactNode;
}) {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <div data-leads-theme className="flex min-h-screen">
      <Sidebar email={email} />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar email={email} onSearchClick={() => setSearchOpen(true)} />
        <main className="min-w-0 flex-1 p-4 pb-24 lg:p-6 lg:pb-6">{children}</main>
      </div>
      <BottomNav onSearchClick={() => setSearchOpen(true)} />
      <CommandPalette open={searchOpen} onOpenChange={setSearchOpen} />
      <Toaster theme="dark" />
      <CardSpotlight />
    </div>
  );
}
