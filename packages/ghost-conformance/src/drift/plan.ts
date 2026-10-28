type Fetch = (input: string, init?: RequestInit) => Promise<Response>;
type GitHubRelease = { tag_name: string; html_url: string; prerelease: boolean; draft: boolean };

export type GhostRelease = { version: string; url: string };
export type NewestGhost = { version: string; releases: GhostRelease[] };
export type DriftPlan = { bump: boolean; from: string; to: string };

const RELEASES_URL = "https://api.github.com/repos/TryGhost/Ghost/releases?per_page=100";
const imageUrl = (version: string) =>
  `https://hub.docker.com/v2/repositories/library/ghost/tags/${version}/`;

/**
 * Newest stable Ghost release (or `target`) whose official Docker image exists, plus every release
 * after the pin up to it, oldest first, for the reviewer's release-note reading.
 */
export async function resolveNewestGhost(opts: {
  pin: string;
  fetch?: Fetch;
  target?: string;
  githubToken?: string;
}): Promise<NewestGhost> {
  const fetchFn: Fetch = opts.fetch ?? fetch;
  // A token lifts GitHub's shared 60-requests-per-hour limit on CI runners.
  const auth = opts.githubToken ? { authorization: `Bearer ${opts.githubToken}` } : undefined;
  const response = await fetchFn(RELEASES_URL, {
    headers: { accept: "application/vnd.github+json", ...auth },
  });
  if (!response.ok) throw new Error(`GitHub releases for TryGhost/Ghost answered ${response.status}`);
  const stable = ((await response.json()) as GitHubRelease[])
    .filter((r) => !r.draft && !r.prerelease && /^v\d+\.\d+\.\d+$/.test(r.tag_name))
    .map((r): GhostRelease => ({ version: r.tag_name.slice(1), url: r.html_url }))
    .sort((a, b) => compareVersions(b.version, a.version));

  let version = opts.target;
  if (!version) {
    for (const candidate of stable) {
      if ((await fetchFn(imageUrl(candidate.version))).ok) {
        version = candidate.version;
        break;
      }
    }
  }
  if (!version) throw new Error("No stable Ghost release has an official Docker image");
  const target = version;
  const releases = stable
    .filter((r) => compareVersions(r.version, opts.pin) > 0 && compareVersions(r.version, target) <= 0)
    .reverse();
  return { version: target, releases };
}

/** Bump only when the newest release is ahead of the pin. */
export function planDrift(pin: string, newest: string): DriftPlan {
  return { bump: compareVersions(newest, pin) > 0, from: pin, to: newest };
}

export function compareVersions(a: string, b: string): number {
  const pa = a.split(".").map(Number);
  const pb = b.split(".").map(Number);
  for (let i = 0; i < 3; i++) if (pa[i] !== pb[i]) return (pa[i] ?? 0) - (pb[i] ?? 0);
  return 0;
}
