import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LeadsShell from "@/components/leads/LeadsShell";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Defense-in-depth — middleware already gates this, but a Server Component
  // fetching real data should never trust that alone.
  if (!user) redirect("/leads/login");

  return <LeadsShell email={user.email ?? null}>{children}</LeadsShell>;
}
