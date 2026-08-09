// Lets Jayden read the real mittal-website source and propose changes as a PR — never a
// direct push. Vercel's deployed functions can't edit their own build output at runtime, so
// "Jayden updates the dashboard" has to mean "Jayden commits to a branch via the GitHub API
// and opens a PR," with Shubham merging it himself. That review step is the whole safety net
// here — every tool in this file is written to preserve it, never to bypass it.

const GITHUB_OWNER = "Shubham-mittal-2903";
const GITHUB_REPO = "Mittal-Website";
const GITHUB_API = "https://api.github.com";

// Anything matching these is off-limits to both read and write — secrets, CI/CD config (which
// could otherwise be used to route around the PR-review gate entirely), and noise.
const DENIED_PATH_PATTERNS = [
  /(^|\/)\.env/i,
  /(^|\/)\.git\//,
  /(^|\/)\.github\/workflows\//,
  /(^|\/)node_modules\//,
  /\.pem$/i,
  /secret/i,
  /credential/i,
];

export function isDeniedPath(path: string): boolean {
  return DENIED_PATH_PATTERNS.some((re) => re.test(path));
}

function assertConfigured(): string {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error("GITHUB_TOKEN isn't set — code-change tools aren't available yet.");
  return token;
}

async function gh(path: string, token: string, init?: RequestInit) {
  const res = await fetch(`${GITHUB_API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`GitHub API ${init?.method ?? "GET"} ${path} -> ${res.status}: ${body.slice(0, 300)}`);
  }
  return res.json();
}

export async function readRepoFiles(paths: string[]): Promise<string> {
  const token = assertConfigured();
  const results: string[] = [];

  for (const path of paths.slice(0, 10)) {
    if (isDeniedPath(path)) {
      results.push(`=== ${path} ===\n[BLOCKED — this path can't be read: secrets/CI config are off-limits]`);
      continue;
    }
    try {
      const data = await gh(`/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${encodeURI(path)}?ref=main`, token);
      if (Array.isArray(data)) {
        const listing = data.map((e: { name: string; type: string }) => `${e.type === "dir" ? "📁" : "📄"} ${e.name}`).join("\n");
        results.push(`=== ${path} (directory) ===\n${listing}`);
      } else {
        const content = Buffer.from(data.content, "base64").toString("utf-8");
        results.push(`=== ${path} ===\n${content}`);
      }
    } catch (err) {
      results.push(`=== ${path} ===\n[Could not read: ${err instanceof Error ? err.message : "unknown error"}]`);
    }
  }

  return results.join("\n\n");
}

export async function proposeChange(input: {
  branchName: string;
  title: string;
  description: string;
  files: Array<{ path: string; content: string }>;
}): Promise<string> {
  const token = assertConfigured();

  const badPath = input.files.map((f) => f.path).find(isDeniedPath);
  if (badPath) {
    throw new Error(`Refusing: "${badPath}" is a denied path (secrets/CI config). Never propose changes to files like this.`);
  }
  if (input.files.length === 0) throw new Error("No files provided.");
  if (input.files.length > 20) throw new Error("Too many files in one change (max 20) — split into smaller proposals.");

  const branch = `jayden/${input.branchName}`.replace(/[^a-zA-Z0-9/_-]/g, "-");

  const mainRef = await gh(`/repos/${GITHUB_OWNER}/${GITHUB_REPO}/git/refs/heads/main`, token);
  const mainSha = mainRef.object.sha;

  await gh(`/repos/${GITHUB_OWNER}/${GITHUB_REPO}/git/refs`, token, {
    method: "POST",
    body: JSON.stringify({ ref: `refs/heads/${branch}`, sha: mainSha }),
  });

  for (const file of input.files) {
    let existingSha: string | undefined;
    try {
      const existing = await gh(`/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${encodeURI(file.path)}?ref=${branch}`, token);
      existingSha = Array.isArray(existing) ? undefined : existing.sha;
    } catch {
      // File doesn't exist yet on this branch — that's fine, it's a new file.
    }

    await gh(`/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${encodeURI(file.path)}`, token, {
      method: "PUT",
      body: JSON.stringify({
        message: `${input.title}\n\nvia Jayden`,
        content: Buffer.from(file.content, "utf-8").toString("base64"),
        branch,
        ...(existingSha ? { sha: existingSha } : {}),
      }),
    });
  }

  const pr = await gh(`/repos/${GITHUB_OWNER}/${GITHUB_REPO}/pulls`, token, {
    method: "POST",
    body: JSON.stringify({
      title: input.title,
      body: `${input.description}\n\n---\nOpened by Jayden. Nothing here is live until this PR is merged.`,
      head: branch,
      base: "main",
    }),
  });

  return `Pull request opened: ${pr.html_url}\n\nThis is NOT live — Shubham needs to review and merge it himself before anything deploys.`;
}
