import { getSettings } from "@/lib/actions/settings";
import SettingsForm from "@/components/leads/SettingsForm";

export default async function SettingsPage() {
  const settings = await getSettings();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-sm text-muted-foreground">Profile, signature and portfolio links used across outreach.</p>
      </div>
      <SettingsForm
        initial={{
          profileName: settings?.profileName ?? "Shubham Mittal",
          profileEmail: settings?.profileEmail ?? "",
          emailSignature: settings?.emailSignature ?? "",
          portfolioLinks: (settings?.portfolioLinks as { url: string; label: string; useCase?: string }[]) ?? [],
        }}
      />
    </div>
  );
}
