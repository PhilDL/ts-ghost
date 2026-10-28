import { fileURLToPath } from "node:url";

import type { RouteAccess } from "./classify.ts";
import type { RouteDefinition } from "./ghost-router.ts";

/** One Admin API route. `public`: needs no credential; the other three: Ghost's auth lets that credential in. */
export type ManifestRoute = { method: string; path: string; labs: string | null } & RouteAccess;
export type Manifest = { ghost: string; routes: ManifestRoute[] };

/** The generated manifest, committed; regenerating it against a new Ghost is the drift check. */
export const MANIFEST_FILE = fileURLToPath(new URL("../../manifest.json", import.meta.url));

export function buildManifest(
  ghost: string,
  routes: (RouteDefinition & { access: RouteAccess })[],
): Manifest {
  const entries = routes.map(
    (r): ManifestRoute => ({
      method: r.method,
      path: r.path.endsWith("/") ? r.path : `${r.path}/`,
      labs: r.labs,
      public: r.access.public,
      integration: r.access.integration,
      staff: r.access.staff,
      session: r.access.session,
    }),
  );
  const key = (r: ManifestRoute) => `${r.path} ${r.method}`;
  entries.sort((a, b) => (key(a) < key(b) ? -1 : key(a) > key(b) ? 1 : 0));
  entries.forEach((r, i) => {
    if (i > 0 && key(entries[i - 1]!) === key(r)) throw new Error(`Ghost registers ${key(r)} twice`);
  });
  return { ghost, routes: entries };
}

/** JSON with one route per line, so a drift diff shows one line per changed route. */
export function serialiseManifest(manifest: Manifest): string {
  const lines = manifest.routes.map((r) => `    ${JSON.stringify(r)}`);
  return `{\n  "ghost": ${JSON.stringify(manifest.ghost)},\n  "routes": [\n${lines.join(",\n")}\n  ]\n}\n`;
}

export function parseManifest(text: string): Manifest {
  return JSON.parse(text) as Manifest;
}
