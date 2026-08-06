import fs from "node:fs";
import path from "node:path";

// MISSION-AUGUST lives outside the repo (sibling folder on Shubham's machine), and this
// resolution only ever runs locally via tsx — Vercel's deployed functions never see it.
export function locateMissionAugust(cliArg?: string): string {
  const candidates = [
    cliArg,
    process.env.MISSION_AUGUST_PATH,
    path.resolve(process.cwd(), "..", "MISSION-AUGUST"),
    path.resolve(process.cwd(), "..", "..", "MISSION-AUGUST"),
  ].filter((c): c is string => Boolean(c));

  for (const candidate of candidates) {
    const resolved = path.resolve(candidate);
    if (fs.existsSync(resolved) && fs.statSync(resolved).isDirectory()) {
      return resolved;
    }
  }

  throw new Error(
    `Could not locate the MISSION-AUGUST folder. Tried:\n${candidates.map((c) => `  - ${path.resolve(c)}`).join("\n")}\n` +
      `Pass --path=<dir>, or set MISSION_AUGUST_PATH in .env.`
  );
}

export function discoverLeadFolders(root: string) {
  const results: Array<{ dir: string; id: string; legacyId: string; statusFolder: string }> = [];
  const leadsRoot = path.join(root, "03_Leads");
  const statusFolders = ["Qualified", "Rejected", "Archive"];

  for (const statusFolder of statusFolders) {
    const dir = path.join(leadsRoot, statusFolder);
    if (!fs.existsSync(dir)) continue;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const m = entry.name.match(/^(\d{3})_/);
      if (!m) continue;
      results.push({
        dir: path.join(dir, entry.name),
        id: m[1],
        legacyId: `MA-${m[1]}`,
        statusFolder,
      });
    }
  }

  return results.sort((a, b) => a.id.localeCompare(b.id));
}

export function readIfExists(p: string): string | null {
  return fs.existsSync(p) ? fs.readFileSync(p, "utf-8") : null;
}
